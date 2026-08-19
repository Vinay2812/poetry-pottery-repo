import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AppModule } from "@/app.module";
import { clerkAuthMiddleware } from "@/common/clerk/clerk.util";
import { REQUEST_ID_HEADER } from "@/common/middleware/request-id.middleware";
import { PrismaService } from "@/prisma/prisma.service";
import {
  getJson,
  graphqlErrorSchema,
  healthSchema,
  postGraphql,
} from "./helpers/http";

const prismaMock = {
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]),
  user: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn(),
  },
  productCategory: {
    findMany: vi.fn().mockResolvedValue([{ category: "Mugs" }]),
  },
};

const categoriesSchema = z.object({
  data: z.object({ categories: z.array(z.string()) }),
});

describe("API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    // Same auth middleware as main.ts, so guards see a real Clerk auth state.
    app.use(clerkAuthMiddleware());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("reports a healthy database on GET /health", async () => {
    const response = await getJson(app, "/health");

    expect(response.status).toBe(200);
    const health = healthSchema.parse(response.body);
    expect(health.status).toBe("ok");
    expect(health.details.database?.status).toBe("up");
  });

  it("sets a request id header", async () => {
    const response = await getJson(app, "/health");

    expect(response.headers[REQUEST_ID_HEADER]).toBeTypeOf("string");
  });

  it("serves the public categories query without authentication", async () => {
    const response = await postGraphql(app, "{ categories }");

    expect(response.status).toBe(200);
    const { data } = categoriesSchema.parse(response.body);
    expect(data.categories).toEqual(["Mugs"]);
  });

  it("rejects the users query when unauthenticated", async () => {
    const response = await postGraphql(app, "{ users { total } }");

    const { errors } = graphqlErrorSchema.parse(response.body);
    expect(errors[0]?.message).toBe("Authentication required");
    expect(errors[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });
});
