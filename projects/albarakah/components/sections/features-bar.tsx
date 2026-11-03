"use client";

import { m } from "framer-motion";
import { Leaf, ShieldCheck, Truck, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const icons = [Truck, Leaf, ShieldCheck, Zap];

export function FeaturesBar() {
  const { t } = useI18n();
  return (
    <section aria-label="Features" className="relative z-10 -mt-14 lg:-mt-16">
      <div className="container">
        <ul className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl shadow-luxe lg:grid-cols-4">
          {t.features.map((f, i) => {
            const Icon = icons[i];
            return (
              <m.li
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group flex flex-col items-start gap-3 bg-card/60 p-5 sm:flex-row sm:items-center sm:p-7"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-honey/25 to-gold/10 text-honey-700 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110 dark:text-gold">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight sm:text-base">{f.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{f.text}</p>
                </div>
              </m.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
