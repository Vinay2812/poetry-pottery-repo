import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { NestFactory } from "@nestjs/core";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { lexicographicSortSchema, printSchema } from "graphql";
import * as resolvers from "@/resolvers";

const OUTPUT = join(__dirname, "..", "schema.gql");

// Same banner autoSchemaFile writes at boot, so the two writers never diff.
const BANNER = `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

`;

async function emitSchema(): Promise<void> {
  const app = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );
  try {
    const factory = app.get(GraphQLSchemaFactory);
    const schema = await factory.create(Object.values(resolvers));
    await writeFile(
      OUTPUT,
      BANNER + printSchema(lexicographicSortSchema(schema)),
    );
    process.stdout.write(`Wrote ${OUTPUT}\n`);
  } finally {
    await app.close();
  }
}

void emitSchema();
