import type { Metadata, Viewport } from "next";
import { Cairo, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { SkipLink } from "@/components/layout/skip-link";
import { JsonLd, localBusinessSchema, organizationSchema } from "@/components/seo/json-ld";

// الخطوط: Inter للإنجليزية، Cairo للعربية، Fraunces للعناوين الفاخرة
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata({}),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline.en}`,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  keywords: ["natural raisins", "raw almonds", "raw honey", "Medjool dates", "natural food USA", "زبيب", "لوز", "عسل", "تمر"],
  authors: [{ name: siteConfig.name }],
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF3E0" },
    { media: "(prefers-color-scheme: dark)", color: "#07140E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${inter.variable} ${cairo.variable} ${fraunces.variable}`}>
      <body>
        <JsonLd data={[organizationSchema(), localBusinessSchema()]} />
        <Providers>
          <SkipLink />
          <Header />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
