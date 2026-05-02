import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { luxury, staggerContainer } from "@/lib/animations";

interface Props {
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: Props) {
  const { items } = useRecentlyViewedStore();
  const filtered = items.filter((i) => i.id !== excludeId).slice(0, 4);

  if (filtered.length === 0) return null;

  return (
    <section className="border-t border-border pt-16 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: luxury }}
        className="text-center mb-10"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Continue Exploring</p>
        <h2 className="font-display text-4xl font-light" style={{ fontFamily: "var(--font-display)" }}>
          Recently Viewed
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {filtered.map((p, i) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            name={p.name}
            basePrice={p.basePrice}
            compareAtPrice={p.compareAtPrice}
            images={p.images}
            variants={p.variants}
            isFeatured={p.isFeatured}
            isNewArrival={p.isNewArrival}
            index={i}
          />
        ))}
      </motion.div>
    </section>
  );
}
