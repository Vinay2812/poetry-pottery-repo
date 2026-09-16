import { Test, type TestingModule } from "@nestjs/testing";
import { EventStatus, type Prisma } from "@prisma/client";
import { Client } from "pg";

import { CartService } from "@/features/cart/cart.service";
import { ContactService } from "@/features/contact/contact.service";
import { EventsService } from "@/features/events/events.service";
import { NewsletterService } from "@/features/newsletter/newsletter.service";
import { OrdersService } from "@/features/orders/orders.service";
import { SearchService } from "@/features/search/search.service";
import { SettingsService } from "@/features/settings/settings.service";
import {
  addDays,
  fromWallClock,
  toWallClock,
} from "@/features/workshops/schedule";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { WorkshopsService } from "@/features/workshops/workshops.service";
import { MailService, type MailMessage } from "@/mail/mail.service";
import {
  PrismaService,
  withAmbientTransactions,
} from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { StorageService } from "@/storage/storage.service";

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

class MailStub {
  enqueue(): Promise<void> {
    return Promise.resolve();
  }
}

class StorageStub {
  isOwnUrl(): boolean {
    return true;
  }
}

// Same silence as the stub, but it keeps the envelopes so a test can count them.
export class MailRecorder {
  readonly sent: MailMessage[] = [];

  enqueue(message: MailMessage): Promise<void> {
    this.sent.push(message);
    return Promise.resolve();
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
}

export interface Harness {
  prisma: PrismaService;
  cart: CartService;
  orders: OrdersService;
  events: EventsService;
  workshops: WorkshopsService;
  wishlist: WishlistService;
  newsletter: NewsletterService;
  contact: ContactService;
  close: () => Promise<void>;
}

export interface HarnessOptions {
  // Pass a recorder when the test needs to count the mail a service sends.
  mail?: MailRecorder;
}

// Real services and a real PrismaService against the sandbox database; only the outside world is stubbed.
export async function createHarness(
  options: HarnessOptions = {},
): Promise<Harness> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: PrismaService,
        useFactory: (): PrismaService =>
          withAmbientTransactions(new PrismaService()),
      },
      { provide: RedisService, useClass: RedisStub },
      { provide: MailService, useValue: options.mail ?? new MailStub() },
      { provide: SearchService, useClass: SearchStub },
      { provide: StorageService, useClass: StorageStub },
      SettingsService,
      CartService,
      OrdersService,
      EventsService,
      WorkshopsService,
      WishlistService,
      NewsletterService,
      ContactService,
    ],
  }).compile();
  await moduleRef.init();
  return {
    prisma: moduleRef.get(PrismaService),
    cart: moduleRef.get(CartService),
    orders: moduleRef.get(OrdersService),
    events: moduleRef.get(EventsService),
    workshops: moduleRef.get(WorkshopsService),
    wishlist: moduleRef.get(WishlistService),
    newsletter: moduleRef.get(NewsletterService),
    contact: moduleRef.get(ContactService),
    close: () => moduleRef.close(),
  };
}

const TRUNCATED = [
  "cart_items",
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
  "products",
  "collections",
  "addresses",
  "newsletter_subscribers",
  "contact_messages",
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
