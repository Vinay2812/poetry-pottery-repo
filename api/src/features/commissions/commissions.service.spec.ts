import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CommissionStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { PendingUploadsService } from "@/storage/pending-uploads.service";
import { StorageService } from "@/storage/storage.service";
import { CommissionsService } from "./commissions.service";
import type { CommissionRequestInput } from "./commissions.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  commissionRequest: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  category: { findMany: vi.fn() },
  productOption: { findMany: vi.fn() },
  product: { findMany: vi.fn() },
  glaze: { findMany: vi.fn() },
};

const mailMock = { enqueue: vi.fn() };
const storageMock = {
  isOwnUrl: vi.fn((url: string) => url.startsWith("https://cdn.studio/")),
};
const pendingUploadsMock = { keep: vi.fn(), track: vi.fn(), sweep: vi.fn() };

const row = {
  id: "abc123def456",
  piece_type: "Mug",
  size: "Short (150 ml)",
  glaze: "Ocean Blue",
  carved_words: "for Aai",
  notes: null,
  name: "Maya",
  email: "maya@example.com",
  phone: "9123456789",
  reference_image_urls: [],
  is_read: false,
  user_id: null,
  created_at: new Date("2026-09-17T00:00:00.000Z"),
};

function input(
  overrides: Partial<CommissionRequestInput> = {},
): CommissionRequestInput {
  return {
    piece_type: "Mug",
    size: "Short (150 ml)",
    glaze: "Ocean Blue",
    carved_words: "for Aai",
    name: "Maya",
    email: "Maya@Example.com",
    phone: "+91 91234-56789",
    ...overrides,
  };
}

describe("CommissionsService", () => {
  let service: CommissionsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommissionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
        { provide: StorageService, useValue: storageMock },
        { provide: PendingUploadsService, useValue: pendingUploadsMock },
      ],
    }).compile();
    service = moduleRef.get(CommissionsService);
  });

  it("files a normalised brief and writes back to the customer", async () => {
    prismaMock.commissionRequest.create.mockResolvedValue(row);

    await expect(service.create(input(), 7)).resolves.toBe(row);

    expect(prismaMock.commissionRequest.create).toHaveBeenCalledWith({
      data: containing({
        email: "maya@example.com",
        phone: "9123456789",
        user_id: 7,
        reference_image_urls: [],
      }),
    });
    expect(mailMock.enqueue).toHaveBeenCalledWith(
      containing({ to: "maya@example.com" }),
    );
  });

  it("stops sweeping the photos a signed-in brief kept", async () => {
    prismaMock.commissionRequest.create.mockResolvedValue(row);

    await service.create(
      input({ reference_image_urls: ["https://cdn.studio/1.jpg"] }),
      7,
    );

    expect(pendingUploadsMock.keep).toHaveBeenCalledWith(7, [
      "https://cdn.studio/1.jpg",
    ]);
  });

  it("has nothing to untrack for a brief sent by a stranger", async () => {
    prismaMock.commissionRequest.create.mockResolvedValue(row);

    await service.create(input(), null);

    expect(pendingUploadsMock.keep).not.toHaveBeenCalled();
  });

  it("tells the studio about a new brief when an address is configured", async () => {
    prismaMock.commissionRequest.create.mockResolvedValue(row);
    env.BUSINESS_EMAIL = "studio@example.com";

    try {
      await service.create(input(), null);
    } finally {
      env.BUSINESS_EMAIL = undefined;
    }

    expect(mailMock.enqueue).toHaveBeenCalledWith(
      containing({ to: "studio@example.com" }),
    );
  });

  it("refuses reference photos that did not come from the studio's uploader", async () => {
    await expect(
      service.create(
        input({ reference_image_urls: ["https://elsewhere.test/a.jpg"] }),
        null,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.commissionRequest.create).not.toHaveBeenCalled();
  });

  it("keeps at most three reference photos", async () => {
    await expect(
      service.create(
        input({
          reference_image_urls: [
            "https://cdn.studio/1.jpg",
            "https://cdn.studio/2.jpg",
            "https://cdn.studio/3.jpg",
            "https://cdn.studio/4.jpg",
          ],
        }),
        null,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects carved words longer than the rim can hold", async () => {
    await expect(
      service.create(input({ carved_words: "x".repeat(41) }), null),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("treats blank words and notes as absent", async () => {
    prismaMock.commissionRequest.create.mockResolvedValue(row);

    await service.create(input({ carved_words: "  ", notes: "" }), null);

    expect(prismaMock.commissionRequest.create).toHaveBeenCalledWith({
      data: containing({ carved_words: null, notes: null }),
    });
  });

  it("offers the pieces the shelf carries, each with its own sizes, and the glazes the studio fires", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        name: "Mugs",
        products: [
          {
            option_groups: [
              {
                options: [
                  { name: "Espresso (30 ml)" },
                  { name: "Short (150 ml)" },
                ],
              },
            ],
          },
          { option_groups: [{ options: [{ name: "Short (150 ml)" }] }] },
        ],
      },
      { name: "Bowls", products: [{ option_groups: [] }] },
    ]);
    prismaMock.glaze.findMany.mockResolvedValue([
      { slug: "ocean-blue", name: "Ocean Blue", color_code: "#2f5d7c" },
      { slug: "wood-fired", name: "Wood Fired", color_code: null },
    ]);

    await expect(service.options()).resolves.toEqual({
      piece_types: [
        { name: "Mugs", sizes: ["Espresso (30 ml)", "Short (150 ml)"] },
        { name: "Bowls", sizes: [] },
      ],
      glazes: [
        { slug: "ocean-blue", name: "Ocean Blue", color_code: "#2f5d7c" },
        { slug: "wood-fired", name: "Wood Fired", color_code: null },
      ],
    });
    // The glaze list is the studio's own table, not a distinct over whatever is on the shelf.
    expect(prismaMock.glaze.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, color_code: true },
    });
  });

  it("reads the options straight from the tables, with nothing cached in between", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { name: "Mugs", products: [] },
    ]);
    prismaMock.glaze.findMany.mockResolvedValue([]);

    await service.options();
    await service.options();

    // Nothing in the API writes glazes, categories or options, so a cache could never be
    // told to drop; both calls have to go to the database.
    expect(prismaMock.category.findMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.glaze.findMany).toHaveBeenCalledTimes(2);
  });

  it("shows flagged commissions, and the made-to-order shelf until there are any", async () => {
    const flagged = [
      {
        id: 1,
        categories: [],
        collection: null,
        height_cm: null,
        diameter_cm: null,
      },
    ];
    prismaMock.product.findMany.mockResolvedValueOnce(flagged);

    await expect(service.pieces(6)).resolves.toEqual(flagged);
    expect(prismaMock.product.findMany).toHaveBeenCalledTimes(1);

    prismaMock.product.findMany.mockReset();
    const madeToOrder = [
      {
        id: 2,
        categories: [],
        collection: null,
        height_cm: null,
        diameter_cm: null,
      },
    ];
    prismaMock.product.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(madeToOrder);

    await expect(service.pieces(6)).resolves.toEqual(madeToOrder);
    expect(prismaMock.product.findMany).toHaveBeenLastCalledWith(
      containing({ where: containing({ is_customizable: true }) }),
    );
  });

  it("lists newest briefs first with page info", async () => {
    prismaMock.commissionRequest.findMany.mockResolvedValue([row]);
    prismaMock.commissionRequest.count.mockResolvedValue(1);

    const result = await service.list({ page: 1, limit: 20 });

    expect(prismaMock.commissionRequest.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { created_at: "desc" },
      skip: 0,
      take: 20,
    });
    expect(result.page_info).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      has_more: false,
    });
  });

  it("narrows the inbox by status and by the words in a brief", async () => {
    prismaMock.commissionRequest.findMany.mockResolvedValue([]);
    prismaMock.commissionRequest.count.mockResolvedValue(0);

    await service.list({ status: CommissionStatus.SKETCHED, search: " maya " });

    expect(prismaMock.commissionRequest.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({ status: CommissionStatus.SKETCHED }),
      }),
    );
    const call = prismaMock.commissionRequest.findMany.mock.calls.at(
      -1,
    )?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toHaveLength(3);
  });

  it("counts a brief as read once it leaves NEW", async () => {
    prismaMock.commissionRequest.update.mockResolvedValue(row);

    await service.setStatus(row.id, CommissionStatus.ACCEPTED);
    expect(prismaMock.commissionRequest.update).toHaveBeenCalledWith({
      where: { id: row.id },
      data: { status: CommissionStatus.ACCEPTED, is_read: true },
    });

    await service.setStatus(row.id, CommissionStatus.NEW);
    expect(prismaMock.commissionRequest.update).toHaveBeenLastCalledWith({
      where: { id: row.id },
      data: { status: CommissionStatus.NEW },
    });
  });

  it("marks a brief read", async () => {
    prismaMock.commissionRequest.update.mockResolvedValue({
      ...row,
      is_read: true,
    });

    await expect(service.markRead(row.id)).resolves.toMatchObject({
      is_read: true,
    });
  });
});
