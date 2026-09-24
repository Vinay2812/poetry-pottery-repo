import { z } from "zod";

export const QUEUE_EXCHANGE = "poetry";
export const DEAD_LETTER_EXCHANGE = "poetry.dlx";
export const DEAD_LETTER_QUEUE = "poetry.dead-letters";

// Every job has a routing key and a zod schema; consumers validate before acting.
export const jobSchemas = {
  "search.index-product": z.object({ productId: z.number().int() }),
  "search.index-event": z.object({ eventId: z.number().int() }),
  // Fired when a piece becomes buyable again: listed, in stock or made to order.
  "notify.back-in-stock": z.object({ productId: z.number().int() }),
  "mail.send": z.object({
    to: z.string().min(1),
    subject: z.string().min(1),
    html: z.string().min(1),
    text: z.string().optional(),
  }),
  // A photo something on the site let go of, once nothing else holds it.
  "storage.delete-object": z.object({ key: z.string().min(1) }),
  // Fired a day after a presign; the upload is deleted if nothing has claimed it by then.
  "upload.expire": z.object({ key: z.string().min(1) }),
} as const;

export type JobName = keyof typeof jobSchemas;

export type JobPayload<Name extends JobName> = z.infer<
  (typeof jobSchemas)[Name]
>;

export const JOB_NAMES = Object.keys(jobSchemas) as JobName[];

// Jobs that wait before they run sit out this long on their own delay queue first.
export const DELAYS = {
  "upload.expire": 24 * 60 * 60 * 1000,
} as const satisfies Partial<Record<JobName, number>>;

export type DelayedJobName = keyof typeof DELAYS;

export const DELAYED_JOB_NAMES = Object.keys(DELAYS) as DelayedJobName[];

export function queueNameFor(job: JobName): string {
  return `${QUEUE_EXCHANGE}.${job}`;
}

// A failed delivery parks here and flows back to the job's own queue once the TTL runs out.
export function retryQueueNameFor(job: JobName): string {
  return `${queueNameFor(job)}.retry`;
}

// A delayed job is published straight to this queue and dead-letters onto its routing key when the TTL runs out.
export function delayQueueNameFor(job: DelayedJobName): string {
  return `${queueNameFor(job)}.delay`;
}

export function jobForDelayQueue(queue: string): DelayedJobName | null {
  return (
    DELAYED_JOB_NAMES.find((job) => delayQueueNameFor(job) === queue) ?? null
  );
}

// Header carrying how many times the job has been handed to a consumer.
export const ATTEMPT_HEADER = "x-attempt";

export const RETRY = { maxAttempts: 5, delayMs: 60_000 } as const;
