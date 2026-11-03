import { siteConfig } from "@/data/site";
import { getMinPrice, type Product } from "@/data/products";

/** إدراج بيانات Schema.org بصيغة JSON-LD */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: siteConfig.nameAr,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.svg`,
  email: siteConfig.email,
  contactPoint: siteConfig.phones.map((p) => ({
    "@type": "ContactPoint",
    telephone: p.tel,
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: ["English", "Arabic"],
  })),
  sameAs: Object.values(siteConfig.social).filter(Boolean),
});

export const localBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  description: siteConfig.description.en,
  url: siteConfig.url,
  image: `${siteConfig.url}/og-image.jpg`,
  telephone: siteConfig.phones[0].tel,
  email: siteConfig.email,
  priceRange: "$$",
  address: { "@type": "PostalAddress", addressRegion: siteConfig.address.region, addressCountry: siteConfig.address.country },
  areaServed: { "@type": "Country", name: "United States" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "12:00", closes: "17:00" },
  ],
});

export const productSchema = (p: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name.en,
  description: p.description.en,
  sku: p.sku,
  image: `${siteConfig.url}${p.image}`,
  brand: { "@type": "Brand", name: siteConfig.name },
  aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: getMinPrice(p),
    highPrice: Math.max(...p.sizes.map((s) => s.price)),
    offerCount: p.sizes.length,
    availability: "https://schema.org/InStock",
    url: `${siteConfig.url}/products/${p.slug}`,
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    },
  },
});
