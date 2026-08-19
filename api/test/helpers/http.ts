import type { Server } from "node:http";

import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { z } from "zod";

export interface RawResponse {
  status: number;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

// supertest exposes `body` as `any`; narrow it to `unknown` so callers must validate.
export function server(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

export async function getJson(
  app: INestApplication,
  path: string,
): Promise<RawResponse> {
  const response = await request(server(app)).get(path);
  return {
    status: response.status,
    body: response.body as unknown,
    headers: response.headers,
  };
}

export async function postGraphql(
  app: INestApplication,
  query: string,
): Promise<RawResponse> {
  const response = await request(server(app))
    .post("/graphql")
    .set("content-type", "application/json")
    .send({ query });
  return {
    status: response.status,
    body: response.body as unknown,
    headers: response.headers,
  };
}

export const graphqlErrorSchema = z.object({
  errors: z
    .array(
      z.object({
        message: z.string(),
        extensions: z.looseObject({ code: z.string().optional() }).optional(),
      }),
    )
    .min(1),
});

export const healthSchema = z.object({
  status: z.string(),
  info: z.record(z.string(), z.object({ status: z.string() })).optional(),
  details: z.record(z.string(), z.object({ status: z.string() })),
});
