"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

/**
 * صورة مع Skeleton أثناء التحميل.
 * الصورة لا تُخفى بـ opacity (حتى لا يتأخر LCP لحين تحميل JavaScript)،
 * بل يظهر الـ Skeleton خلفها ويُزال بعد اكتمال التحميل.
 */
export function SmartImage({ className, wrapperClassName, alt, ...props }: ImageProps & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Image
        alt={alt}
        {...props}
        onLoad={() => setLoaded(true)}
        className={cn("relative transition-transform duration-700", className)}
      />
    </div>
  );
}
