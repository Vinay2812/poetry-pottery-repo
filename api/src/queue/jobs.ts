import { z } from "zod";

export const QUEUE_EXCHANGE = "poetry";
export const DEAD_LETTER_EXCHANGE = "poetry.dlx";
export const DEAD_LETTER_QUEUE = "poetry.dead-letters";

// Every job has a routing key and a zod schema; consumers validate before acting.
export const jobSchemas = {
  "search.index-product": z.object({ productId: z.number().int() }),
  "search.index-event": z.object({ eventId: z.number().int() }),
  // Fired when a piece goes from sold out to back on the shelf.
  "notify.back-in-stock": z.object({ productId: z.number().int() }),
  "mail.send": z.object({
    to: z.string().min(1),
    subject: z.string().min(1),
    html: z.string().min(1),
    text: z.string().optional(),
  }),
} as const;

export type JobName = keyof typeof jobSchemas;

export type JobPayload<Name extends JobName> = z.infer<
  (typeof jobSchemas)[Name]
>;

export function queueNameFor(job: JobName): string {
  return `${QUEUE_EXCHANGE}.${job}`;
}
