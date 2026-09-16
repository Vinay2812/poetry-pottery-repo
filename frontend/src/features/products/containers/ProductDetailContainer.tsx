"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  OptionGroupKind,
  useRelatedProductsQuery,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { REFERENCE_CUP, toDrawnVessel } from "@/components/media/vessels";
import { KilnLabels, type KilnLabel } from "@/components/motion/KilnLabels";
import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";

import { toProvenance } from "@/features/archive/types";
import { useAddToCart } from "@/features/cart/hooks";
import { canWatchPiece, NextBatchContainer } from "@/features/notify";
import { useReferencePhotos } from "@/features/products/hooks";
import { ArchiveNotice } from "@/features/products/components/ArchiveNotice";
import { GlazeNote } from "@/features/products/components/GlazeNote";
import { KilnCard } from "@/features/products/components/KilnCard";
import { MakerNote } from "@/features/products/components/MakerNote";
import { OptionGroupPicker } from "@/features/products/components/OptionGroupPicker";
import { PieceScale } from "@/features/products/components/PieceScale";
import { ProductBuyBox } from "@/features/products/components/ProductBuyBox";
import { ProductCarousel } from "@/features/products/components/ProductCarousel";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ReferencePhotoPicker } from "@/features/products/components/ReferencePhotoPicker";
import { SecondNotice } from "@/features/products/components/SecondNotice";
import { StickyBuyBar } from "@/features/products/components/StickyBuyBar";
import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import {
  computeUnitPrice,
  isPhotoUploadPending,
  MAX_REFERENCE_PHOTOS,
  type ProductDetailData,
  REFERENCE_PHOTO_ACCEPT,
  toConfirmedPhotoUrls,
  toArchiveAskUrl,
  toArchiveNote,
  type Selections,
  toBatchLabel,
  toDefaultSelections,
  toFactRows,
  toFlawNote,
  toGlazeAskUrl,
  toGlazePath,
  toShortDescription,
  toStockStatus,
  validateSelections,
} from "@/features/products/types";
import { useToggleWishlist, useWishlistIds } from "@/features/wishlist/hooks";

export interface ProductDetailContainerProps {
  product: ProductDetailData;
  freeShippingAbove: number | null;
  whatsappNumber: string;
  pageUrl: string;
}

const MAX_QUANTITY = 10;

// The drawing names three facts. Each leader leaves its dot at the same 25 degrees,
// and each dot is read off the piece itself so "Clay body" never lands on the glaze.
const LEADER_TAN = 0.4663;
// A piece measured in height alone is still drawn in proportion, using the cup's own.
const CUP_WIDTH_RATIO = REFERENCE_CUP.diameterCm / REFERENCE_CUP.heightCm;
const LEADER_RUN: Record<string, number> = {
  "Clay body": -20,
  Glaze: -24,
  Size: 14,
};

export function ProductDetailContainer({
  product,
  freeShippingAbove,
  whatsappNumber,
  pageUrl,
}: ProductDetailContainerProps) {
  const { addToCart, isAdding } = useAddToCart();
  const {
    photos,
    error: photoError,
    setError: setPhotoError,
    addFiles,
    removePhoto,
    clearPhotos,
  } = useReferencePhotos();
  const { isWishlisted } = useWishlistIds();
  const { toggle } = useToggleWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>(() =>
    toDefaultSelections(product.option_groups),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isBuyBoxVisible, setIsBuyBoxVisible] = useState(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  const { data: relatedData } = useRelatedProductsQuery({
    variables: { slug: product.slug, limit: 8 },
  });
  const related = relatedData?.relatedProducts ?? [];

  const groups = product.option_groups;
  const unitPrice = useMemo(
    () => computeUnitPrice(product.price, groups, selections),
    [groups, product.price, selections],
  );
  const issues = useMemo(
    () => validateSelections(groups, selections),
    [groups, selections],
  );
  const stock = toStockStatus(product.stock, product.is_customizable);
  const batchLabel = toBatchLabel(product.stock, product.is_customizable);
  const maxQuantity = product.is_customizable
    ? MAX_QUANTITY
    : Math.min(MAX_QUANTITY, product.stock);
  const description = useMemo(
    () => toShortDescription(product.description),
    [product.description],
  );
  const askUrl = toGlazeAskUrl(whatsappNumber, product.name);
  const isArchived = product.is_archived;
  const archiveAskUrl = toArchiveAskUrl(whatsappNumber, product.name, pageUrl);

  // The device only reads over the drawn placeholder; a real photo keeps the frame clean
  // and the fact list carries clay body, glaze and size instead.
  const hasPhoto = product.image_urls.length > 0;
  const glaze = product.glaze;
  const factRows = useMemo(
    () =>
      toFactRows({
        material: product.material,
        glazeName: glaze?.name ?? product.color_name,
        dimensions: product.dimensions,
        heightCm: product.height_cm,
        diameterCm: product.diameter_cm,
        capacityMl: product.capacity_ml,
        weightG: product.weight_g,
        isCustomizable: product.is_customizable,
        sizeChoices: groups.flatMap((group) =>
          group.options.map((option) => option.name),
        ),
      }),
    [glaze, groups, product],
  );
  const kilnLabels = useMemo<KilnLabel[]>(() => {
    const anchors = toDrawnVessel(toPotteryIconKind(product.name)).anchors;
    const named = new Set(factRows.map((row) => row.label));
    const spots = [
      { text: "Clay body", anchor: anchors.clay },
      { text: "Glaze", anchor: anchors.glaze },
      { text: "Size", anchor: anchors.size },
    ];
    return spots
      .filter((spot) => named.has(spot.text))
      .map(({ text, anchor }) => {
        const run = LEADER_RUN[text] ?? 18;
        // The two upper labels climb away from the piece, the clay body falls away.
        const rise = text === "Clay body" ? 1 : -1;
        return {
          text,
          anchorX: anchor.x,
          anchorY: anchor.y,
          x: anchor.x + run,
          y: anchor.y + Math.abs(run) * LEADER_TAN * rise,
        };
      });
  }, [factRows, product.name]);

  useEffect(() => {
    const node = buyBoxRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsBuyBoxVisible(entry?.isIntersecting ?? true),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSelectOption = useCallback(
    (groupId: number, optionId: number) => {
      setSelections((current) => ({ ...current, [groupId]: { optionId } }));
    },
    [],
  );
  const handleTextChange = useCallback((groupId: number, text: string) => {
    setSelections((current) => ({ ...current, [groupId]: { text } }));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (issues.length > 0) {
      setShowErrors(true);
      return;
    }
    if (isPhotoUploadPending(photos)) {
      setPhotoError("Wait for the photos to finish uploading");
      return;
    }
    addToCart(
      {
        product_id: product.id,
        quantity,
        selections: Object.entries(selections).map(([groupId, value]) => ({
          group_id: Number(groupId),
          option_id: "optionId" in value ? value.optionId : null,
          text: "text" in value ? value.text : null,
        })),
        reference_image_urls: toConfirmedPhotoUrls(photos),
      },
      product.name,
    );
    clearPhotos();
  }, [
    addToCart,
    clearPhotos,
    issues.length,
    photos,
    product.id,
    product.name,
    quantity,
    selections,
    setPhotoError,
  ]);

  const handleToggleWishlist = useCallback(() => {
    toggle(product.id, product.name);
  }, [product.id, product.name, toggle]);

  const handleToggleDescription = useCallback(() => {
    setIsDescriptionOpen((current) => !current);
  }, []);

  // Only the facts the drawing also names can light up with it.
  const hasKilnDiagram = !hasPhoto && kilnLabels.length > 0;
  const linkedLabels = hasKilnDiagram
    ? new Set(kilnLabels.map((label) => label.text))
    : new Set<string>();
  const kilnRows = factRows.map((row) => ({
    ...row,
    isLinked: linkedLabels.has(row.label),
  }));

  return (
    <PageShell className="flex flex-col gap-16 py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery
          images={product.image_urls}
          name={product.name}
          overlay={
            hasKilnDiagram ? (
              <KilnLabels
                labels={kilnLabels}
                isAnimated
                activeText={activeFact}
                onActivate={setActiveFact}
                className="hidden text-ink lg:block"
              />
            ) : undefined
          }
        />
        <div ref={buyBoxRef} className="lg:sticky lg:top-24 lg:self-start">
          {isArchived ? (
            <ArchiveNotice
              name={product.name}
              priceLabel={formatInr(product.price)}
              collectionName={product.collection?.name ?? null}
              provenance={toProvenance(
                product.created_at,
                product.color_name,
                product.material,
                product.stock,
              )}
              note={toArchiveNote(product.stock)}
              askUrl={archiveAskUrl}
            />
          ) : (
            <ProductBuyBox
              name={product.name}
              collectionName={product.collection?.name ?? null}
              collectionHref={
                product.collection
                  ? `/products?collection=${product.collection.slug}`
                  : null
              }
              unitPrice={unitPrice}
              compareAtPrice={product.compare_at_price}
              material={product.material}
              colorName={product.color_name}
              colorCode={product.color_code}
              sizeLine={product.dimensions}
              stockTone={stock.tone}
              stockLabel={batchLabel}
              quantity={quantity}
              maxQuantity={Math.max(1, maxQuantity)}
              isWishlisted={isWishlisted(product.id)}
              isAddingToCart={isAdding}
              canAddToCart={product.stock > 0 || product.is_customizable}
              freeShippingAbove={freeShippingAbove}
              askUrl={askUrl}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              options={
                groups.length > 0 || product.is_customizable ? (
                  <div className="flex flex-col gap-5 border-y border-ash py-6">
                    {groups.map((group) => {
                      const selection = selections[group.id];
                      const issue = showErrors
                        ? (issues.find(
                            (candidate) => candidate.groupId === group.id,
                          )?.message ?? null)
                        : null;
                      return (
                        <OptionGroupPicker
                          key={group.id}
                          groupId={group.id}
                          name={group.name}
                          kind={
                            group.kind === OptionGroupKind.Text
                              ? "TEXT"
                              : "CHOICE"
                          }
                          isRequired={group.is_required}
                          priceModifier={group.price_modifier}
                          maxLength={group.max_length}
                          choices={group.options.map((option) => ({
                            id: option.id,
                            name: option.name,
                            priceModifier: option.price_modifier,
                          }))}
                          selectedOptionId={
                            selection && "optionId" in selection
                              ? selection.optionId
                              : null
                          }
                          text={
                            selection && "text" in selection
                              ? selection.text
                              : ""
                          }
                          error={issue}
                          onSelectOption={(optionId) =>
                            handleSelectOption(group.id, optionId)
                          }
                          onTextChange={(text) =>
                            handleTextChange(group.id, text)
                          }
                        />
                      );
                    })}
                    {product.is_customizable && (
                      <ReferencePhotoPicker
                        photos={photos.map((photo) => ({
                          id: photo.id,
                          name: photo.name,
                          previewUrl: photo.previewUrl,
                          progress: photo.progress,
                          error: photo.error,
                          isUploaded: photo.url !== null,
                        }))}
                        maxPhotos={MAX_REFERENCE_PHOTOS}
                        accept={REFERENCE_PHOTO_ACCEPT}
                        error={photoError}
                        onAddFiles={addFiles}
                        onRemove={removePhoto}
                      />
                    )}
                  </div>
                ) : undefined
              }
            />
          )}
          {canWatchPiece(
            product.stock,
            product.is_customizable,
            isArchived,
          ) && (
            <div className="mt-6">
              <NextBatchContainer productId={product.id} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-10 border-t border-ash pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl tracking-tight">
            About this piece
          </h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-line">
            {isDescriptionOpen ? product.description : description.short}
          </p>
          {description.hasMore && (
            <button
              type="button"
              onClick={handleToggleDescription}
              aria-expanded={isDescriptionOpen}
              className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
            >
              {isDescriptionOpen ? "Read less" : "Read more"}
            </button>
          )}
          {product.is_second && (
            <SecondNotice
              name={product.name}
              flawNote={toFlawNote(product.flaw_note)}
              flawPhotoUrl={product.image_urls[0] ?? null}
            />
          )}
          {product.care_notes.length > 0 && (
            <div className="flex flex-col gap-2 pt-4">
              <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Care
              </h3>
              <ul className="flex flex-col gap-1 text-[13px] text-muted-foreground">
                {product.care_notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <KilnCard
                rows={kilnRows}
                activeLabel={activeFact}
                onActivate={hasKilnDiagram ? setActiveFact : undefined}
              />
            </div>
            {product.height_cm !== null && (
              <PieceScale
                kind={toPotteryIconKind(product.name)}
                heightCm={product.height_cm}
                diameterCm={
                  product.diameter_cm ?? product.height_cm * CUP_WIDTH_RATIO
                }
                className="w-full max-w-[200px] shrink-0 sm:w-[180px]"
              />
            )}
          </div>
          {product.maker_note && <MakerNote note={product.maker_note} />}
          {glaze && (
            <GlazeNote
              name={glaze.name}
              colorCode={glaze.color_code}
              swatchUrl={glaze.swatch_url}
              description={glaze.description}
              variationNote={glaze.variation_note}
              href={toGlazePath(glaze.slug)}
            />
          )}
        </div>
      </div>

      {related.length > 0 && (
        <Reveal isGroup>
          <ProductCarousel title="From the same shelf" viewAllHref="/products">
            {related.map((item) => (
              <ProductCardContainer key={item.id} product={item} />
            ))}
          </ProductCarousel>
        </Reveal>
      )}

      <StickyBuyBar
        isVisible={!isArchived && !isBuyBoxVisible}
        name={product.name}
        total={unitPrice * quantity}
        isSoldOut={stock.tone === "sold_out"}
        isAddingToCart={isAdding}
        canAddToCart={product.stock > 0 || product.is_customizable}
        onAddToCart={handleAddToCart}
      />
    </PageShell>
  );
}
