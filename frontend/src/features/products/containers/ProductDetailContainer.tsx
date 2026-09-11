"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  OptionGroupKind,
  useRelatedProductsQuery,
} from "@/graphql/generated/graphql";
import { formatInr } from "@/lib/format";

import { useRequireAuth } from "@/features/auth";
import { KilnCard } from "@/features/products/components/KilnCard";
import { OptionGroupPicker } from "@/features/products/components/OptionGroupPicker";
import { ProductBuyBox } from "@/features/products/components/ProductBuyBox";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCarousel } from "@/features/products/components/ProductCarousel";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { StickyBuyBar } from "@/features/products/components/StickyBuyBar";
import {
  computeUnitPrice,
  type ProductDetailData,
  type Selections,
  toDiscountPercent,
  toProductPath,
  toStockStatus,
  validateSelections,
} from "@/features/products/types";

export interface ProductDetailContainerProps {
  product: ProductDetailData;
  freeShippingAbove: number | null;
}

const MAX_QUANTITY = 10;

export function ProductDetailContainer({
  product,
  freeShippingAbove,
}: ProductDetailContainerProps) {
  const requireAuth = useRequireAuth();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isBuyBoxVisible, setIsBuyBoxVisible] = useState(true);
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
  const maxQuantity = product.is_customizable
    ? MAX_QUANTITY
    : Math.min(MAX_QUANTITY, product.stock);

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

  // Cart wiring lands with the cart feature; until then the button validates and confirms the intent.
  const handleAddToCart = useCallback(() => {
    if (issues.length > 0) {
      setShowErrors(true);
      return;
    }
    requireAuth(() => {
      toast.success(`${product.name} is ready to add`, {
        description: `${quantity} × ${formatInr(unitPrice)}`,
      });
    });
  }, [issues.length, product.name, quantity, requireAuth, unitPrice]);

  const handleToggleWishlist = useCallback(() => {
    requireAuth(() => toast("Wishlist is coming with the next update"));
  }, [requireAuth]);

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
      value: product.is_customizable ? "About 10 days" : "3 working days",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-6 md:px-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <ProductGallery images={product.image_urls} name={product.name} />
        <div ref={buyBoxRef} className="lg:sticky lg:top-24 lg:self-start">
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
            stockTone={stock.tone}
            stockLabel={stock.label}
            ratingAvg={product.rating_avg}
            ratingCount={product.rating_count}
            quantity={quantity}
            maxQuantity={Math.max(1, maxQuantity)}
            isWishlisted={false}
            isAddingToCart={false}
            canAddToCart={product.stock > 0 || product.is_customizable}
            freeShippingAbove={freeShippingAbove}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            options={
              groups.length > 0 ? (
                <div className="flex flex-col gap-5 rounded-2xl bg-cream/60 p-4">
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
                          selection && "text" in selection ? selection.text : ""
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
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl">About this piece</h2>
          <p className="leading-relaxed whitespace-pre-line text-foreground/85">
            {product.description}
          </p>
          {product.care_notes.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
                Care
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-foreground/80">
                {product.care_notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <KilnCard rows={kilnRows} colorCode={product.color_code} />
      </div>

      {related.length > 0 && (
        <ProductCarousel
          title="Goes well with"
          eyebrow="From the same shelf"
          viewAllHref="/products"
        >
          {related.map((item) => {
            const itemStock = toStockStatus(item.stock, item.is_customizable);
            return (
              <ProductCard
                key={item.id}
                href={toProductPath(item.slug)}
                name={item.name}
                imageUrl={item.image_urls[0] ?? null}
                price={item.price}
                compareAtPrice={item.compare_at_price}
                discountPercent={toDiscountPercent(
                  item.price,
                  item.compare_at_price,
                )}
                material={item.material}
                colorName={item.color_name}
                colorCode={item.color_code}
                stockTone={itemStock.tone}
                stockLabel={itemStock.label}
                ratingAvg={item.rating_avg}
                ratingCount={item.rating_count}
                isWishlisted={false}
              />
            );
          })}
        </ProductCarousel>
      )}

      <StickyBuyBar
        isVisible={!isBuyBoxVisible}
        name={product.name}
        total={unitPrice * quantity}
        isSoldOut={stock.tone === "sold_out"}
        isAddingToCart={false}
        canAddToCart={product.stock > 0 || product.is_customizable}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
