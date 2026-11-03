import { buildMetadata } from "@/lib/seo";
import { ContactContent } from "@/components/sections/contact-content";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Call or WhatsApp AlBarakah Naturals at +1 313-909-8734 or +1 313-455-1054. Orders, wholesale and gifting questions welcome.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactContent />;
}
