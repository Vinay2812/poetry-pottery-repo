"use client";

import { useCallback } from "react";

import { useAddToCart } from "@/features/cart/hooks";
import { ProductCard } from "@/features/products/components/ProductCard";
import {
  type ProductCardData,
  toDiscountPercent,
  toProductPath,
  toStockStatus,
} from "@/features/products/types";
import { useToggleWishlist, useWishlistIds } from "@/features/wishlist/hooks";

export interface ProductCardContainerProps {
  product: ProductCardData;
  isPriority?: boolean;
}

// One place that turns a product record into a card with live cart and wishlist behaviour.
export function ProductCardContainer({
  product,
  isPriority = false,
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

  return (
    <ProductCard
      href={href}
      name={product.name}
      imageUrl={product.image_urls[0] ?? null}
      secondImageUrl={product.image_urls[1] ?? null}
      price={product.price}
      compareAtPrice={product.compare_at_price}
      discountPercent={toDiscountPercent(
        product.price,
        product.compare_at_price,
      )}
      material={product.material}
      colorName={product.color_name}
      colorCode={product.color_code}
      stockTone={stock.tone}
      stockLabel={stock.label}
      ratingAvg={product.rating_avg}
      ratingCount={product.rating_count}
      isWishlisted={isWishlisted(product.id)}
      isCustomizable={product.is_customizable}
      isAddingToCart={isAdding}
      isPriority={isPriority}
      onToggleWishlist={handleToggleWishlist}
      onAddToCart={handleAddToCart}
    />
  );
}
