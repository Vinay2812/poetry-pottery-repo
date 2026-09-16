"use client";

import { useCallback } from "react";

import { useAddToCart } from "@/features/cart/hooks";
import { ArchiveCard } from "@/features/products/components/ArchiveCard";
import { ProductCard } from "@/features/products/components/ProductCard";
import {
  type ProductCardData,
  toArchiveLabel,
  toProductPath,
  toStockStatus,
} from "@/features/products/types";
import { useToggleWishlist, useWishlistIds } from "@/features/wishlist/hooks";

export interface ProductCardContainerProps {
  product: ProductCardData;
  isPriority?: boolean;
  isEager?: boolean;
}

// One place that turns a product record into a card with live cart and wishlist behaviour.
export function ProductCardContainer({
  product,
  isPriority = false,
  isEager = false,
}: ProductCardContainerProps) {
  const { isWishlisted } = useWishlistIds();
  const { toggle } = useToggleWishlist();
  const { addToCart, isAdding } = useAddToCart();
  const stock = toStockStatus(product.stock, product.is_customizable);
  const href = toProductPath(product.slug);

  const handleToggleWishlist = useCallback(
    () => toggle(product.id, product.name),
    [product.id, product.name, toggle],
  );

  const handleAddToCart = useCallback(
    () => addToCart({ product_id: product.id, quantity: 1 }, product.name),
    [addToCart, product.id, product.name],
  );

  // Archived pieces are past work: no cart, no new saves, just where they went.
  if (product.is_archived) {
    return (
      <ArchiveCard
        href={href}
        name={product.name}
        imageUrl={product.image_urls[0] ?? null}
        price={product.price}
        note={toArchiveLabel(product.stock)}
        isPriority={isPriority}
        isEager={isEager}
        onRemoveFromWishlist={
          isWishlisted(product.id) ? handleToggleWishlist : undefined
        }
      />
    );
  }

  return (
    <ProductCard
      href={href}
      name={product.name}
      imageUrls={product.image_urls}
      price={product.price}
      compareAtPrice={product.compare_at_price}
      stockTone={stock.tone}
      stockLabel={stock.label}
      glazeName={product.glaze?.name ?? null}
      glazeColor={product.glaze?.color_code ?? null}
      isWishlisted={isWishlisted(product.id)}
      isSecond={product.is_second}
      isCustomizable={product.is_customizable}
      isAddingToCart={isAdding}
      isPriority={isPriority}
      isEager={isEager}
      onToggleWishlist={handleToggleWishlist}
      onAddToCart={handleAddToCart}
    />
  );
}
