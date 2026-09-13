"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  OptionGroupKind,
  useRelatedProductsQuery,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";

import { KilnLabels, type KilnLabel } from "@/components/motion/KilnLabels";
import { Reveal } from "@/components/motion/Reveal";

import { useAddToCart } from "@/features/cart/hooks";
import { ArchiveNotice } from "@/features/products/components/ArchiveNotice";
import { KilnCard } from "@/features/products/components/KilnCard";
import { OptionGroupPicker } from "@/features/products/components/OptionGroupPicker";
import { ProductBuyBox } from "@/features/products/components/ProductBuyBox";
import { ProductCarousel } from "@/features/products/components/ProductCarousel";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { StickyBuyBar } from "@/features/products/components/StickyBuyBar";
import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import {
  computeUnitPrice,
  type ProductDetailData,
  toArchiveAskUrl,
  toArchiveNote,
  type Selections,
  toBatchLabel,
  toGlazeAskUrl,
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

// Anchors sit on the drawn piece, which fills the middle 60% of the square.
const LABEL_POSITIONS = [
  { x: 30, y: 26, anchorX: 38, anchorY: 38 },
  { x: 68, y: 52, anchorX: 62, anchorY: 55 },
  { x: 62, y: 82, anchorX: 50, anchorY: 72 },
];

export function ProductDetailContainer({
  product,
  freeShippingAbove,
  whatsappNumber,
  pageUrl,
}: ProductDetailContainerProps) {
  const { addToCart, isAdding } = useAddToCart();
  const { isWishlisted } = useWishlistIds();
  const { toggle } = useToggleWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>({});
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
  const kilnLabels = useMemo<KilnLabel[]>(() => {
    const texts = [
      product.material ? "Clay body" : null,
      product.color_name ? "Glaze" : null,
      product.dimensions ? "Size" : null,
    ].filter((text): text is string => Boolean(text));
    return texts.map((text, index) => ({
      text,
      ...(LABEL_POSITIONS[index] ?? LABEL_POSITIONS[0]!),
    }));
  }, [product.color_name, product.dimensions, product.material]);

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
    addToCart(
      {
        product_id: product.id,
        quantity,
        selections: Object.entries(selections).map(([groupId, value]) => ({
          group_id: Number(groupId),
          option_id: "optionId" in value ? value.optionId : null,
          text: "text" in value ? value.text : null,
        })),
      },
      product.name,
    );
  }, [
    addToCart,
    issues.length,
    product.id,
    product.name,
    quantity,
    selections,
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
    ? kilnLabels.map((label) => label.text)
    : [];
  const kilnRows = [
    { label: "Clay body", value: product.material },
    ...(product.color_name
      ? [{ label: "Glaze", value: product.color_name }]
      : []),
    ...(product.dimensions
      ? [{ label: "Size", value: product.dimensions }]
      : []),
    { label: "Made in", value: "Sangli, Maharashtra" },
    {
      label: "Ships in",
      value: product.is_customizable ? "About ten days" : "Three working days",
    },
  ].map((row) => ({ ...row, isLinked: linkedLabels.includes(row.label) }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 md:px-8 md:py-12">
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
              ratingAvg={product.rating_avg}
              ratingCount={product.rating_count}
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
                groups.length > 0 ? (
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
                  </div>
                ) : undefined
              }
            />
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
        <KilnCard
          rows={kilnRows}
          colorCode={product.color_code}
          activeLabel={activeFact}
          onActivate={hasKilnDiagram ? setActiveFact : undefined}
        />
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
    </div>
  );
}
