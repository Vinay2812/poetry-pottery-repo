"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  OptionGroupKind,
  RelatedProductsDocument,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { REFERENCE_CUP, toDrawnVessel } from "@/components/media/vessels";
import { KilnLabels, type KilnLabel } from "@/components/motion/KilnLabels";
import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";

import { toProvenance } from "@/features/archive/types";
import { useAddToCart } from "@/features/cart/hooks";
import { SITE_HEADER_SELECTOR } from "@/features/layout/types";
import { canWatchPiece, NextBatchContainer } from "@/features/notify";
import { useReferencePhotos } from "@/features/products/hooks";
import { ArchiveNotice } from "@/features/products/components/ArchiveNotice";
import { CareNotes } from "@/features/products/components/CareNotes";
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
  hasFailedPhoto,
  isTuckedUnderHeader,
  LG_MEDIA_QUERY,
  STICKY_BAR_SCROLL_PADDING,
  isPhotoUploadPending,
  MAX_REFERENCE_PHOTOS,
  type ProductDetailData,
  REFERENCE_PHOTO_ACCEPT,
  toConfirmedPhotoUrls,
  toArchiveAskUrl,
  toArchiveCommissionPath,
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
import { ReviewsPanelContainer } from "@/features/reviews";
import { useToggleWishlist, useWishlistIds } from "@/features/wishlist/hooks";

export interface ProductDetailContainerProps {
  product: ProductDetailData;
  freeShippingAbove: number | null;
  whatsappNumber: string;
  pageUrl: string;
}

const MAX_QUANTITY = 10;

// The first control a reader needs to fix: an invalid text field, an unanswered choice, or the photo picker.
const FIRST_ISSUE_SELECTOR =
  '[aria-invalid="true"], [role="radiogroup"][aria-describedby] [tabindex="0"], button[aria-describedby]';

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
  const [isActionsVisible, setIsActionsVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const isActionsVisibleRef = useRef(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const addToCartRef = useRef<HTMLButtonElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const { data: relatedData } = useQuery(RelatedProductsDocument, {
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
        isArchived: product.is_archived,
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

  // Measured each scroll frame below lg, where the bar lives; an IntersectionObserver misses jumps.
  useEffect(() => {
    const node = actionsRef.current;
    if (!node) return;
    const wide = window.matchMedia(LG_MEDIA_QUERY);
    const header = document.querySelector(SITE_HEADER_SELECTOR);
    let frame = 0;
    const show = (isVisible: boolean) => {
      if (isActionsVisibleRef.current === isVisible) return;
      isActionsVisibleRef.current = isVisible;
      // The bar is about to go inert; a reader on its button lands on the main one, shown in full.
      const main = addToCartRef.current;
      if (
        isVisible &&
        main &&
        stickyBarRef.current?.contains(document.activeElement)
      ) {
        main.focus({ preventScroll: true });
        // scroll-padding-top keeps it clear of the sticky header.
        main.scrollIntoView({ block: "nearest" });
      }
      setIsActionsVisible(isVisible);
    };
    const measure = () => {
      frame = 0;
      show(
        !isTuckedUnderHeader(
          node.getBoundingClientRect().bottom,
          header?.getBoundingClientRect().bottom ?? 0,
        ),
      );
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };
    const detach = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => {
      detach();
      if (wide.matches) {
        show(true);
        return;
      }
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    };
    sync();
    wide.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      detach();
    };
  }, []);

  // The bar steps aside at the footer, so its last line (privacy, terms) stays tappable.
  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsFooterVisible(entry?.isIntersecting ?? false),
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // While the bar is up, focused and scrolled-to controls stop above it rather than under it.
  const isStickyBarShown =
    !isArchived && !isActionsVisible && !isFooterVisible;
  useEffect(() => {
    if (!isStickyBarShown) return;
    const root = document.documentElement;
    root.style.scrollPaddingBottom = STICKY_BAR_SCROLL_PADDING;
    return () => {
      root.style.scrollPaddingBottom = "";
    };
  }, [isStickyBarShown]);

  const handleSelectOption = useCallback(
    (groupId: number, optionId: number) => {
      setSelections((current) => ({ ...current, [groupId]: { optionId } }));
    },
    [],
  );
  const handleTextChange = useCallback((groupId: number, text: string) => {
    setSelections((current) => ({ ...current, [groupId]: { text } }));
  }, []);

  // The message sits beside the field, which can be a screen away from the button pressed.
  const revealFirstIssue = useCallback((block: ScrollLogicalPosition) => {
    window.requestAnimationFrame(() => {
      const options = optionsRef.current;
      if (!options) return;
      options.scrollIntoView({ block });
      options
        .querySelector<HTMLElement>(FIRST_ISSUE_SELECTOR)
        ?.focus({ preventScroll: true });
    });
  }, []);

  // False when something in the options has to be fixed first.
  const tryAddToCart = useCallback((): boolean => {
    if (issues.length > 0) {
      setShowErrors(true);
      return false;
    }
    if (isPhotoUploadPending(photos)) {
      setPhotoError("Wait for the photos to finish uploading");
      return false;
    }
    // A failed photo would otherwise be dropped from the line without a word.
    if (hasFailedPhoto(photos)) {
      setPhotoError("Remove the photo that did not upload, or try it again");
      return false;
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
    return true;
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

  const handleAddToCart = useCallback(() => {
    if (!tryAddToCart()) revealFirstIssue("nearest");
  }, [revealFirstIssue, tryAddToCart]);

  const handleStickyAddToCart = useCallback(() => {
    if (!tryAddToCart()) revealFirstIssue("center");
  }, [revealFirstIssue, tryAddToCart]);

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
    <PageShell className="flex flex-col gap-16 pb-8 sm:pt-8 md:py-12">
      {/* minmax(0, …) keeps a tall buy box from widening the gallery column through its square ratio. */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        {/* Edge to edge on a phone; on a tablet the photo, the shorter column, stays put. */}
        <div className="-mx-4 sm:mx-0 md:sticky md:top-24 md:self-start lg:static lg:self-auto">
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
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          {isArchived ? (
            <ArchiveNotice
              name={product.name}
              priceLabel={formatInr(product.price)}
              collectionName={product.collection?.name ?? null}
              provenance={toProvenance(
                product.created_at,
                product.color_name,
                product.material,
              )}
              note={toArchiveNote(product.stock)}
              commissionHref={toArchiveCommissionPath(product.slug)}
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
              // The glaze is what the piece is dipped in; the card shows the same swatch.
              colorCode={product.glaze?.color_code ?? product.color_code}
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
              actionsRef={actionsRef}
              addToCartRef={addToCartRef}
              options={
                groups.length > 0 || product.is_customizable ? (
                  <div
                    ref={optionsRef}
                    className="flex flex-col gap-5 border-y border-ash py-6"
                  >
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
            product.is_active,
          ) && (
            <div className="mt-6">
              <NextBatchContainer productId={product.id} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-12 border-t border-ash pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl tracking-tight">
            About this piece
          </h2>
          <p className="max-w-[62ch] text-[15px] leading-relaxed whitespace-pre-line">
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
          {product.maker_note && <MakerNote note={product.maker_note} />}
          {product.is_second && (
            <SecondNotice flawNote={toFlawNote(product.flaw_note)} />
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
          {product.care_notes.length > 0 && (
            <CareNotes notes={product.care_notes} />
          )}
        </div>
      </div>

      <ReviewsPanelContainer
        kind="product"
        subjectId={product.id}
        slug={product.slug}
        subjectName={product.name}
      />

      {related.length > 0 && (
        <div className="border-t border-ash pt-12">
          <Reveal isGroup>
            <ProductCarousel
              title="From the same shelf"
              viewAllHref="/products"
            >
              {related.map((item) => (
                <ProductCardContainer
                  key={item.id}
                  product={item}
                  hasPhotoCarousel={false}
                />
              ))}
            </ProductCarousel>
          </Reveal>
        </div>
      )}

      <StickyBuyBar
        barRef={stickyBarRef}
        isVisible={isStickyBarShown}
        name={product.name}
        quantity={quantity}
        total={unitPrice * quantity}
        isSoldOut={stock.tone === "sold_out"}
        isAddingToCart={isAdding}
        canAddToCart={product.stock > 0 || product.is_customizable}
        onAddToCart={handleStickyAddToCart}
      />
    </PageShell>
  );
}
