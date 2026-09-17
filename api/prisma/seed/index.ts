import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/config/env";
import { contentPages, siteSettings, workshopConfig } from "./content";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

async function seedWorkshop(): Promise<number> {
  const { tiers, ...config } = workshopConfig;
  const row = await prisma.workshopConfig.upsert({
    where: { slug: config.slug },
    create: { ...config, tiers: { create: tiers } },
    update: config,
  });
  return row.id;
}

async function seedContent(): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...siteSettings },
    update: siteSettings,
  });

  for (const page of contentPages) {
    const data = {
      title: page.title,
      subtitle: page.subtitle,
      hero_image_url: page.hero_image_url || null,
      sections: page.sections,
    };
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      create: { slug: page.slug, ...data },
      update: data,
    });
  }
}

// Site scaffolding only: settings, public pages and the studio config. Catalogue comes from `pnpm import:legacy`.
async function main(): Promise<void> {
  await seedWorkshop();
  await seedContent();
  process.stdout.write(`Seeded settings, ${contentPages.length} pages\n`);
}

main()
  .catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack : String(error)}\n`,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
