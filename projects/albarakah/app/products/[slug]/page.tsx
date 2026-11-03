import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMinPrice, getProduct, products } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, productSchema } from "@/components/seo/json-ld";
import { ProductDetail } from "@/components/sections/product-detail";

// إنشاء صفحات المنتجات مسبقاً (Static Generation)
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name.en,
    description: `${product.short.en} From $${getMinPrice(product).toFixed(2)} — shipped fresh to all 50 states.`,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  return (
    <>
      <JsonLd data={productSchema(product)} />
      <ProductDetail product={product} />
    </>
  );
}
