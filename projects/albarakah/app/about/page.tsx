import { buildMetadata } from "@/lib/seo";
import { AboutContent } from "@/components/sections/about-content";

export const metadata = buildMetadata({
  title: "About Us",
  description: "The story behind AlBarakah Naturals — hand-selected natural raisins, almonds, honey and dates delivered with care across America.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutContent />;
}
