import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { getCommissionOptions, getCommissionPieces } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";

import {
  COMMISSION_STEPS,
  CommissionBriefContainer,
  CommissionSteps,
  toGlazeChoices,
} from "@/features/commissions";
import {
  ProductCardContainer,
  ProductGrid,
  toCardPhotoLoading,
} from "@/features/products";

export const metadata: Metadata = {
  title: "Commission a piece",
  description:
    "Tell us the piece, the size, the glaze and the words. A sketch comes back in two days and the piece ships in about ten.",
};

export default async function CustomPage() {
  const [options, pieces, settings] = await Promise.all([
    getCommissionOptions(),
    getCommissionPieces(6),
    getSiteSettings(),
  ]);

  return (
    <PageShell className="flex flex-col gap-12 py-8 md:gap-16 md:py-12">
      <Reveal>
        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl md:text-5xl">
            Commission a piece
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Tell us what to make, how big and in which glaze. We sketch it,
            throw it and fire it, and it reaches you in about ten days.
          </p>
        </header>
      </Reveal>

      <Reveal>
        <section className="flex flex-col gap-5 border-t border-ash pt-10">
          <h2 className="font-heading text-2xl tracking-tight">
            How a commission runs
          </h2>
          <CommissionSteps steps={COMMISSION_STEPS} />
        </section>
      </Reveal>

      {pieces.length > 0 && (
        <Reveal isGroup>
          <section className="flex flex-col gap-5 border-t border-ash pt-10">
            <h2 className="font-heading text-2xl tracking-tight">
              Pieces we have made this way
            </h2>
            <ProductGrid>
              {pieces.map((piece, index) => (
                <ProductCardContainer
                  key={piece.id}
                  product={piece}
                  isPriority={toCardPhotoLoading(index).isPriority}
                  isEager={toCardPhotoLoading(index).isEager}
                />
              ))}
            </ProductGrid>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section className="flex flex-col gap-5 border-t border-ash pt-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl tracking-tight">
              Send us the brief
            </h2>
            <p className="max-w-2xl text-[15px] text-muted-foreground">
              The sizes and glazes here are the ones the studio is firing now.
            </p>
          </div>
          <div className="max-w-2xl">
            <CommissionBriefContainer
              pieceTypes={options.piece_types}
              sizes={options.sizes}
              glazes={toGlazeChoices(options.glazes)}
              whatsappNumber={settings.whatsapp_number}
            />
          </div>
        </section>
      </Reveal>
    </PageShell>
  );
}
