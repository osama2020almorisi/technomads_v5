import { buildMetadata } from "@/lib/seo";
import { ShippingContent } from "@/components/sections/shipping-content";

export const metadata = buildMetadata({
  title: "Shipping & Returns",
  description: "Free shipping over $75, delivery to all 50 US states in 2–5 business days, and a 14-day satisfaction guarantee.",
  path: "/shipping-returns",
});

export default function ShippingPage() {
  return <ShippingContent />;
}
