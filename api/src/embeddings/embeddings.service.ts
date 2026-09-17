import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { env } from "@/config/env";

export const EMBEDDING_DIMENSIONS = 384;

type Extractor = (
  text: string,
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array | number[] }>;

@Injectable()
export class EmbeddingsService {
  private extractor: Promise<Extractor> | null = null;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // The model loads once, on first use, so boot stays fast and tests never touch it.
  private load(): Promise<Extractor> {
    this.extractor ??= (async () => {
      const transformers = await import("@huggingface/transformers");
      transformers.env.cacheDir = env.EMBEDDINGS_CACHE_DIR;
      this.logger.info("loading embeddings model", {
        model: env.EMBEDDINGS_MODEL,
      });
      const pipe = await transformers.pipeline(
        "feature-extraction",
        env.EMBEDDINGS_MODEL,
        {
          dtype: "q8",
        },
      );
      return (text, options) =>
        pipe(text, options) as Promise<{ data: Float32Array | number[] }>;
    })();
    return this.extractor;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.load();
    const output = await extractor(text.trim().slice(0, 2000), {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output.data);
  }
}

// pgvector accepts its text literal form, which Prisma can pass as a string parameter.
export function toVectorLiteral(values: number[]): string {
  return `[${values.map((value) => value.toFixed(6)).join(",")}]`;
}
