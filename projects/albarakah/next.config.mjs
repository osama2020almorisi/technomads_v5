/** @type {import('next').NextConfig} */

// عند تشغيل `npm run export` يتم إنشاء نسخة ثابتة (Static HTML) في مجلد out/
// الوضع الافتراضي مناسب للنشر على Vercel مع تحسين الصور تلقائياً.
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
