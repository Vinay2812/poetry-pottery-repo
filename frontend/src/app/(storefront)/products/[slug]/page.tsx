import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProduct } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata, toSiteUrl } from "@/lib/seo";
import { serializeJsonLd, toProductJsonLd } from "@/lib/structured-data";

import { JsonLd } from "@/components/seo/JsonLd";

import { ProductDetailContainer, toProductPath } from "@/features/products";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  // Thrown here, before anything streams, so a missing piece answers 404 rather than a soft 404.
  if (!product) notFound();
  return pageMetadata({
    title: product.name,
    path: toProductPath(slug),
    description: product.description,
    imageUrl: product.image_urls[0],
  });
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
  const path = toProductPath(slug);

  return (
    <>
      <JsonLd json={serializeJsonLd(toProductJsonLd(product, path))} />
      <ProductDetailContainer
        product={product}
        freeShippingAbove={settings.free_shipping_above}
        whatsappNumber={settings.whatsapp_number}
        pageUrl={toSiteUrl(path)}
      />
    </>
  );
}
