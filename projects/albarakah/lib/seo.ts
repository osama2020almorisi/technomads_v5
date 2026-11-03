import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

/** إنشاء Metadata موحّد لكل صفحة (Open Graph + Twitter) */
export function buildMetadata({
  title,
  description = siteConfig.description.en,
  path = "/",
  image = "/og-image.jpg",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline.en}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: path,
      locale: "en_US",
      alternateLocale: ["ar_AR"],
      images: [image === "/og-image.jpg" ? { url: image, width: 1200, height: 630, alt: siteConfig.name } : { url: image, alt: title ?? siteConfig.name }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}
