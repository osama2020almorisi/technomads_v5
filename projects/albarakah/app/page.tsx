import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/hero";
import { FeaturesBar } from "@/components/sections/features-bar";
import { ProductsShowcase } from "@/components/sections/products-showcase";
import { Stats } from "@/components/sections/stats";
import { WhyUs } from "@/components/sections/why-us";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";

export const metadata = buildMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesBar />
      <ProductsShowcase />
      <Stats />
      <WhyUs />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
