import { buildMetadata } from "@/lib/seo";
import { ProductsCatalog } from "@/components/sections/products-catalog";

export const metadata = buildMetadata({
  title: "Shop All Products",
  description: "Shop 100% natural raisins, raw almonds, raw wildflower honey and premium Medjool dates. Fast delivery to all 50 US states.",
  path: "/products",
});

export default function ProductsPage() {
  return <ProductsCatalog />;
}
