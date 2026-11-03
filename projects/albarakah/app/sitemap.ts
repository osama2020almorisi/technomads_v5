import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { products } from "@/data/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/products", "/about", "/contact", "/shipping-returns"].map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const items = products.map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  return [...pages, ...items];
}
