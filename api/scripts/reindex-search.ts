import { NestFactory } from "@nestjs/core";

import { AppModule } from "@/app.module";
import { SearchService } from "@/features/search/search.service";

// Rebuilds every product and event embedding in place: `pnpm search:reindex`.
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });
  try {
    const counts = await app.get(SearchService).reindexAll();
    process.stdout.write(
      `Indexed ${counts.products} products and ${counts.events} events\n`,
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
