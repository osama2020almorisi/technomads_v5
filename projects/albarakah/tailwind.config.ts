import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // ألوان الهوية — عسلي، ذهبي، أخضر داكن، بيج، بني دافئ
        honey: { DEFAULT: "#D4A017", 50: "#FDF8E8", 100: "#FAEEC4", 200: "#F3DB86", 300: "#EBC64C", 400: "#E0B22A", 500: "#D4A017", 600: "#B07F0F", 700: "#8A6110", 800: "#6E4D13", 900: "#5C4014" },
        gold: { DEFAULT: "#F5C518", light: "#FFE27A" },
        forest: { DEFAULT: "#1B4332", 50: "#EAF4EE", 100: "#CBE5D5", 300: "#74B08E", 500: "#2D6A4F", 700: "#1B4332", 800: "#143326", 900: "#0C2118", 950: "#07140E" },
        cream: { DEFAULT: "#FAF3E0", 50: "#FFFCF5", 100: "#FAF3E0", 200: "#F2E6C4", 300: "#E8D5A3" },
        cocoa: { DEFAULT: "#6B4423", light: "#8B5E3C", dark: "#3E2614" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-cairo)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "var(--font-cairo)", "Georgia", "serif"],
        arabic: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,160,23,.25), 0 20px 60px -20px rgba(212,160,23,.55)",
        soft: "0 1px 2px rgba(27,67,50,.04), 0 12px 40px -12px rgba(27,67,50,.18)",
        luxe: "0 30px 80px -30px rgba(12,33,24,.55)",
      },
      keyframes: {
        /* حركات دخول الواجهة بـ CSS (تظهر قبل تحميل JavaScript لأداء أفضل) */
        rise: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        "rise-soft": { from: { transform: "translateY(16px)" }, to: { transform: "none" } },
        "zoom-in": { from: { opacity: "0", transform: "scale(.94)" }, to: { opacity: "1", transform: "none" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "soft-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,160,23,.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(212,160,23,0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        rise: "rise .8s cubic-bezier(.22,1,.36,1) both",
        "rise-soft": "rise-soft .8s cubic-bezier(.22,1,.36,1) both",
        "zoom-in": "zoom-in 1.1s cubic-bezier(.22,1,.36,1) .15s both",
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
        "soft-pulse": "soft-pulse 2.6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
