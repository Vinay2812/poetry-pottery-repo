import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProduct } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { toAbsoluteUrl } from "@/lib/site-url";

import { ProductDetailContainer, toProductPath } from "@/features/products";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.image_urls.slice(0, 1) },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProduct(slug),
    getSiteSettings(),
  ]);
  if (!product) notFound();

  return (
    <ProductDetailContainer
      product={product}
      freeShippingAbove={settings.free_shipping_above}
      whatsappNumber={settings.whatsapp_number}
      pageUrl={await toAbsoluteUrl(toProductPath(slug))}
    />
  );
}
