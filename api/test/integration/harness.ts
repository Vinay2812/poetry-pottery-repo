import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { Provider } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { EventStatus, OrderStatus, type Prisma } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Client } from "pg";

import { AdminEventsService } from "@/features/admin/events/events.service";
import { AdminProductsService } from "@/features/admin/products/products.service";
import { CartService } from "@/features/cart/cart.service";
import { CommissionsService } from "@/features/commissions/commissions.service";
import { ContactService } from "@/features/contact/contact.service";
import { EventsService } from "@/features/events/events.service";
import { NewsletterService } from "@/features/newsletter/newsletter.service";
import { NotificationsService } from "@/features/notifications/notifications.service";
import { OrdersService } from "@/features/orders/orders.service";
import { ProductsService } from "@/features/products/products.service";
import { ShelfService } from "@/features/products/shelf.service";
import { ReviewsService } from "@/features/reviews/reviews.service";
import { SearchService } from "@/features/search/search.service";
import { SettingsService } from "@/features/settings/settings.service";
import {
  addDays,
  fromWallClock,
  toWallClock,
} from "@/features/workshops/schedule";
import { UsersService } from "@/features/users/users.service";
import { VisitsService } from "@/features/visits/visits.service";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { WorkshopsService } from "@/features/workshops/workshops.service";
import { MailService, type MailMessage } from "@/mail/mail.service";
import {
  PrismaService,
  withAmbientTransactions,
} from "@/prisma/prisma.service";
import { jobForDelayQueue, jobSchemas } from "@/queue/jobs";
import { QueueService } from "@/queue/queue.service";
import { RedisService } from "@/redis/redis.service";
import { StorageService, type UploadTarget } from "@/storage/storage.service";
import { UploadsService } from "@/uploads/uploads.service";

class RedisStub {
  getOrSet<T>(
    _key: string,
    _ttl: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    return loader();
  }

  del(): Promise<void> {
    return Promise.resolve();
  }
}

class LoggerStub {
  info(): void {}

  warn(): void {}

  error(): void {}
}

// The studio's own bucket inside the sandbox; every other origin is somebody else's.
export const STUDIO_CDN = "https://cdn.test";

// Stands in for the bucket: presigns hand out keys, objects a test puts in can be read back, and
// deletes are recorded so a test can see which photos were really let go.
export class StorageRecorder {
  readonly isEnabled = true;
  readonly objects = new Map<string, Buffer>();
  readonly deleted: string[] = [];
  // Set by a test to make the next delete fail the way a refused bucket call would.
  refuseNextDelete = false;
  private sequence = 0;

  isOwnUrl(url: string): boolean {
    return url.startsWith(`${STUDIO_CDN}/`);
  }

  keyFor(url: string): string | null {
    if (!this.isOwnUrl(url)) return null;
    return url.slice(STUDIO_CDN.length + 1) || null;
  }

  publicUrlFor(key: string): string {
    return `${STUDIO_CDN}/${key}`;
  }

  createImageUpload(input: {
    folder: string;
    subfolder?: string;
    filename: string;
  }): Promise<UploadTarget> {
    this.sequence += 1;
    const prefix = input.subfolder
      ? `${input.folder}/${input.subfolder}`
      : input.folder;
    const key = `${prefix}/${this.sequence}-${input.filename}`;
    return Promise.resolve({
      upload_url: `https://upload.test/${key}`,
      public_url: this.publicUrlFor(key),
      key,
    });
  }

  readObject(key: string): Promise<Buffer> {
    const body = this.objects.get(key);
    if (!body) {
      return Promise.reject(new Error(`no object at ${key}`));
    }
    return Promise.resolve(body);
  }

  deleteObject(key: string): Promise<void> {
    if (this.refuseNextDelete) {
      this.refuseNextDelete = false;
      return Promise.reject(new Error("bucket refused"));
    }
    this.deleted.push(key);
    this.objects.delete(key);
    return Promise.resolve();
  }

  reset(): void {
    this.objects.clear();
    this.deleted.length = 0;
    this.refuseNextDelete = false;
  }
}

// The mail jobs that reached the broker, so a test can count envelopes; only committed work gets here.
export class MailRecorder {
  readonly sent: MailMessage[] = [];

  record(message: MailMessage): void {
    this.sent.push(message);
  }

  reset(): void {
    this.sent.length = 0;
  }

  to(address: string): MailMessage[] {
    return this.sent.filter((message) => message.to === address);
  }
}

class SearchStub {
  rankProducts(): Promise<number[]> {
    return Promise.resolve([]);
  }

  rankEvents(): Promise<number[]> {
    return Promise.resolve([]);
  }

  requestProductIndex(): Promise<void> {
    return Promise.resolve();
  }

  requestEventIndex(): Promise<void> {
    return Promise.resolve();
  }
}

export type Deliver = (job: string, payload: unknown) => Promise<void>;

// No broker in the sandbox, so a test reads the jobs that reached the connection. The real
// QueueService sits in front, so only what was published after a commit (or outside any
// transaction) lands here; anything published mid-transaction is kept aside as a leak.
export class QueueRecorder {
  readonly published: { job: string; payload: unknown }[] = [];
  readonly leaked: { job: string; payload: unknown }[] = [];
  // Set by a test to play the consumer at the moment the job is handed over.
  onPublish: Deliver | null = null;

  record(job: string, payload: unknown, inTransaction: boolean): void {
    const entry = { job, payload };
    this.published.push(entry);
    if (inTransaction) this.leaked.push(entry);
  }

  reset(): void {
    this.published.length = 0;
    this.leaked.length = 0;
    this.onPublish = null;
  }

  productIdsFor(job: string): number[] {
    return this.published
      .filter((entry) => entry.job === job)
      .map((entry) => jobSchemas["notify.back-in-stock"].parse(entry.payload))
      .map((payload) => payload.productId);
  }

  keysFor(job: "upload.expire" | "storage.delete-object"): string[] {
    return this.published
      .filter((entry) => entry.job === job)
      .map((entry) => jobSchemas[job].parse(entry.payload).key);
  }
}

// Stands in for the AMQP connection and fans each publish out to the recorders.
class BrokerStub {
  readonly connected = true;

  constructor(
    private readonly prisma: { current: PrismaService | null },
    private readonly queue: QueueRecorder,
    private readonly mail: MailRecorder,
  ) {}

  async publish(
    exchange: string,
    routingKey: string,
    payload: unknown,
  ): Promise<boolean> {
    // A delayed job is addressed to its delay queue; record it under the job it will become.
    const job =
      exchange === ""
        ? (jobForDelayQueue(routingKey) ?? routingKey)
        : routingKey;
    const prisma = this.prisma.current;
    this.queue.record(job, payload, prisma?.inTransaction ?? false);
    if (job === "mail.send") {
      this.mail.record(jobSchemas["mail.send"].parse(payload));
    }
    const deliver = this.queue.onPublish;
    if (deliver) {
      // Outside any transaction scope, the way a consumer on its own connection would run.
      await (prisma
        ? prisma.txStore.exit(() => deliver(job, payload))
        : deliver(job, payload));
    }
    return true;
  }
}

export interface Harness {
  prisma: PrismaService;
  cart: CartService;
  orders: OrdersService;
  events: EventsService;
  workshops: WorkshopsService;
  wishlist: WishlistService;
  newsletter: NewsletterService;
  notifications: NotificationsService;
  contact: ContactService;
  visits: VisitsService;
  reviews: ReviewsService;
  commissions: CommissionsService;
  users: UsersService;
  uploads: UploadsService;
  adminEvents: AdminEventsService;
  adminProducts: AdminProductsService;
  products: ProductsService;
  queueService: QueueService;
  close: () => Promise<void>;
}

export interface HarnessOptions {
  // Pass a recorder when the test needs to count the mail a service sends.
  mail?: MailRecorder;
  // Pass one when the test needs to read the jobs a service published.
  queue?: QueueRecorder;
  // Pass one when the test needs to put objects in the bucket or see which were deleted.
  storage?: StorageRecorder;
  // Wraps the client, e.g. to count the queries a request makes.
  prisma?: (service: PrismaService) => PrismaService;
}

// A real PrismaService against the sandbox database, the real queue and mail services in front of a
// broker stand-in so publishing goes through the seam, and stand-ins for everything else outside it.
export function outsideWorld(options: HarnessOptions = {}): Provider[] {
  const wrap = options.prisma ?? ((service: PrismaService) => service);
  const prismaRef: { current: PrismaService | null } = { current: null };
  const broker = new BrokerStub(
    prismaRef,
    options.queue ?? new QueueRecorder(),
    options.mail ?? new MailRecorder(),
  );
  return [
    {
      provide: PrismaService,
      useFactory: (): PrismaService => {
        prismaRef.current = wrap(withAmbientTransactions(new PrismaService()));
        return prismaRef.current;
      },
    },
    { provide: WINSTON_MODULE_PROVIDER, useClass: LoggerStub },
    { provide: RedisService, useClass: RedisStub },
    { provide: AmqpConnection, useValue: broker },
    QueueService,
    MailService,
    { provide: SearchService, useClass: SearchStub },
    {
      provide: StorageService,
      useValue: options.storage ?? new StorageRecorder(),
    },
  ];
}

// Real services against the sandbox database; only the outside world is stubbed.
export async function createHarness(
  options: HarnessOptions = {},
): Promise<Harness> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      ...outsideWorld(options),
      SettingsService,
      ShelfService,
      UploadsService,
      NotificationsService,
      CartService,
      OrdersService,
      EventsService,
      ProductsService,
      WorkshopsService,
      WishlistService,
      NewsletterService,
      ContactService,
      VisitsService,
      ReviewsService,
      CommissionsService,
      UsersService,
      AdminEventsService,
      AdminProductsService,
    ],
  }).compile();
  await moduleRef.init();
  return {
    prisma: moduleRef.get(PrismaService),
    queueService: moduleRef.get(QueueService),
    cart: moduleRef.get(CartService),
    orders: moduleRef.get(OrdersService),
    events: moduleRef.get(EventsService),
    workshops: moduleRef.get(WorkshopsService),
    wishlist: moduleRef.get(WishlistService),
    newsletter: moduleRef.get(NewsletterService),
    notifications: moduleRef.get(NotificationsService),
    contact: moduleRef.get(ContactService),
    visits: moduleRef.get(VisitsService),
    reviews: moduleRef.get(ReviewsService),
    commissions: moduleRef.get(CommissionsService),
    users: moduleRef.get(UsersService),
    uploads: moduleRef.get(UploadsService),
    adminEvents: moduleRef.get(AdminEventsService),
    adminProducts: moduleRef.get(AdminProductsService),
    products: moduleRef.get(ProductsService),
    close: () => moduleRef.close(),
  };
}

const TRUNCATED = [
  "studio_visits",
  "cart_items",
  "order_notes",
  "order_items",
  "orders",
  "coupons",
  "workshop_booking_slots",
  "workshop_bookings",
  "workshop_pricing_tiers",
  "workshop_blackouts",
  "workshop_configs",
  "event_registrations",
  "reviews",
  "events",
  "wishlist_items",
  "product_options",
  "product_option_groups",
  "batch_notifications",
  "products",
  "glazes",
  "collections",
  "addresses",
  "newsletter_subscribers",
  "contact_messages",
  "commission_requests",
  "uploads",
  "users",
];

export function resetData(prisma: PrismaService): Promise<number> {
  const tables = TRUNCATED.map((table) => `"${table}"`).join(", ");
  return prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`,
  );
}

let sequence = 0;

function tag(): number {
  sequence += 1;
  return sequence;
}

export interface TestUser {
  id: number;
  address_id: number;
}

export async function makeUsers(
  prisma: PrismaService,
  count: number,
): Promise<TestUser[]> {
  const batch = tag();
  const users = await prisma.user.createManyAndReturn({
    data: Array.from({ length: count }, (_, index) => ({
      auth_id: `auth_${batch}_${index}`,
      email: `guest_${batch}_${index}@example.test`,
      name: `Guest ${index}`,
    })),
    select: { id: true },
  });
  const addresses = await prisma.address.createManyAndReturn({
    data: users.map((user) => ({
      user_id: user.id,
      name: "Guest",
      phone: "9876543210",
      line1: "1 Kiln Lane",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
    })),
    select: { id: true, user_id: true },
  });
  return users.map((user, index) => ({
    id: user.id,
    address_id: addresses[index]?.id ?? 0,
  }));
}

export function makeProduct(
  prisma: PrismaService,
  overrides: Partial<Prisma.ProductCreateInput> = {},
): Promise<{ id: number; price: number; stock: number }> {
  const batch = tag();
  return prisma.product.create({
    data: {
      slug: `piece-${batch}`,
      name: `Piece ${batch}`,
      description: "A thrown piece for the race tests",
      price: 1000,
      material: "Stoneware",
      stock: 1,
      ...overrides,
    },
    select: { id: true, price: true, stock: true },
  });
}

// The only thing that makes a buyer eligible to review a piece: a delivered line for it.
export async function deliverProduct(
  prisma: PrismaService,
  users: TestUser[],
  productId: number,
): Promise<void> {
  for (const user of users) {
    await prisma.order.create({
      data: {
        user_id: user.id,
        status: OrderStatus.DELIVERED,
        subtotal: 1000,
        shipping_fee: 0,
        total: 1000,
        delivered_at: new Date(),
        shipping_address: {
          name: "Guest",
          phone: "9876543210",
          line1: "1 Kiln Lane",
          line2: null,
          landmark: null,
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
        items: {
          create: {
            product_id: productId,
            product_name: "Piece",
            unit_price: 1000,
            quantity: 1,
            line_total: 1000,
          },
        },
      },
    });
  }
}

export function makeEvent(
  prisma: PrismaService,
  seats: number,
): Promise<{ id: number; price: number }> {
  const batch = tag();
  const starts = new Date(Date.now() + 7 * 86_400_000);
  return prisma.event.create({
    data: {
      slug: `evening-${batch}`,
      title: `Evening ${batch}`,
      description: "An evening of clay and verse",
      status: EventStatus.PUBLISHED,
      starts_at: starts,
      ends_at: new Date(starts.getTime() + 7_200_000),
      location: "The studio",
      address: "1 Kiln Lane",
      price: 500,
      total_seats: seats,
      available_seats: seats,
      image_url: "https://example.test/evening.jpg",
    },
    select: { id: true, price: true },
  });
}

export interface StudioConfig {
  id: number;
  slug: string;
  timezone: string;
  opening_minutes: number;
  slot_minutes: number;
  capacity_per_slot: number;
}

export function makeStudio(
  prisma: PrismaService,
  capacityPerSlot: number,
  hours: number[] = [1, 2],
): Promise<StudioConfig> {
  const batch = tag();
  return prisma.workshopConfig.create({
    data: {
      slug: `studio-${batch}`,
      name: `Studio ${batch}`,
      capacity_per_slot: capacityPerSlot,
      slot_span_days: 1,
      tiers: {
        create: hours.map((count) => ({
          hours: count,
          price_per_person: 1500 * count,
          pieces_per_person: count,
        })),
      },
    },
    select: {
      id: true,
      slug: true,
      timezone: true,
      opening_minutes: true,
      slot_minutes: true,
      capacity_per_slot: true,
    },
  });
}

// A bookable studio hour: far enough ahead to clear the lead time, aligned to the opening grid.
export function studioHour(
  config: StudioConfig,
  dayOffset: number,
  hourIndex: number,
): Date {
  const today = toWallClock(new Date(), config.timezone).date;
  return fromWallClock(
    addDays(today, dayOffset),
    config.opening_minutes + hourIndex * config.slot_minutes,
    config.timezone,
  );
}

// A second connection, so a test can hold a row lock while a service call runs.
export async function openWriter(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

export interface RaceOutcome<T> {
  wins: T[];
  errors: string[];
}

// Fires every call at once and reports which ones the services let through.
export async function race<T>(
  tasks: (() => Promise<T>)[],
): Promise<RaceOutcome<T>> {
  const settled = await Promise.allSettled(tasks.map((task) => task()));
  return {
    wins: settled.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    ),
    errors: settled.flatMap((result) =>
      result.status === "rejected" ? [messageOf(result.reason)] : [],
    ),
  };
}

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}
