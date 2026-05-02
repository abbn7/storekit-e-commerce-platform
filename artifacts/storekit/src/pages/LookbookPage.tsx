import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, X, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { luxury, staggerItem } from "@/lib/animations";

interface LookbookTag {
  id: string;
  xPct: number;
  yPct: number;
  product: {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    compareAtPrice?: number | null;
    images: { url: string; alt?: string }[];
    variants: { id: string; size: string; color: string; colorHex: string; stock: number; price: number }[];
  };
}

interface LookbookEntry {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  season: string;
  tags: LookbookTag[];
}

function ProductTagPopover({ tag, onClose }: { tag: LookbookTag; onClose: () => void }) {
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { product } = tag;
  const inWishlist = isInWishlist(product.id);
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;

  const left = tag.xPct > 58;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -6 }}
      transition={{ duration: 0.22, ease: luxury }}
      style={{
        position: "absolute",
        left: left ? "auto" : "calc(100% + 14px)",
        right: left ? "calc(100% + 14px)" : "auto",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
      }}
      className="w-64 bg-background shadow-2xl border border-border/60"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Product image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={getProductImage(product.images[0]?.url, product.id)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, productName: product.name, imageUrl: product.images[0]?.url ?? "", basePrice: product.basePrice, slug: product.slug })}
          className={`absolute top-2 left-2 w-6 h-6 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors ${inWishlist ? "text-red-500" : "text-foreground"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500" : ""}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium leading-snug line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium">{formatPrice(product.basePrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>

        {/* Color dots */}
        {product.variants.length > 0 && (
          <div className="flex gap-1 mt-2">
            {[...new Map(product.variants.filter(v => v.stock > 0).map(v => [v.color, v])).values()].slice(0, 5).map((v) => (
              <div
                key={v.color}
                title={v.color}
                className="w-3.5 h-3.5 rounded-full border border-border/60"
                style={{ backgroundColor: v.colorHex }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 text-center text-[10px] tracking-[0.12em] uppercase border border-border px-2 py-2 hover:bg-muted transition-colors"
          >
            Details
          </Link>
          <button
            disabled={inStockVariants.length === 0}
            onClick={() => {
              const v = inStockVariants[0];
              if (!v) return;
              addItem({
                productId: product.id,
                variantId: v.id,
                productName: product.name,
                variantLabel: `${v.size} / ${v.color}`,
                imageUrl: product.images[0]?.url ?? "",
                price: v.price,
                quantity: 1,
                maxQuantity: v.stock,
              });
              onClose();
              openCart();
            }}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] tracking-[0.12em] uppercase bg-foreground text-background px-2 py-2 hover:bg-foreground/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LookbookCard({ entry, index }: { entry: LookbookEntry; index: number }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const isEven = index % 2 === 0;
  const isFeatured = index === 0;

  return (
    <motion.div
      variants={staggerItem}
      className={`group relative ${isFeatured ? "col-span-2" : ""}`}
    >
      <div
        ref={imgRef}
        className="relative overflow-hidden bg-muted cursor-crosshair"
        style={{ aspectRatio: isFeatured ? "16/9" : isEven ? "3/4" : "4/5" }}
        onClick={() => setActiveTag(null)}
      >
        {/* Editorial image */}
        <motion.img
          src={entry.imageUrl}
          alt={entry.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.7, ease: luxury }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Season badge */}
        <div className="absolute top-4 left-4">
          <span className="text-[10px] tracking-[0.25em] uppercase text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1">
            {entry.season}
          </span>
        </div>

        {/* Product tags */}
        {entry.tags.map((tag) => (
          <div
            key={tag.id}
            className="absolute"
            style={{ left: `${tag.xPct}%`, top: `${tag.yPct}%`, transform: "translate(-50%, -50%)" }}
          >
            {/* Pulse ring */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTag(activeTag === tag.id ? null : tag.id);
              }}
              className="relative w-7 h-7 flex items-center justify-center"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-white/70"
              />
              <span className="w-5 h-5 rounded-full bg-white shadow-lg border-2 border-white/50 flex items-center justify-center z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              </span>
            </motion.button>

            {/* Popover */}
            <AnimatePresence>
              {activeTag === tag.id && (
                <ProductTagPopover tag={tag} onClose={() => setActiveTag(null)} />
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Bottom caption */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
          <p className="text-white/70 text-[10px] tracking-[0.2em] uppercase mb-1">{entry.subtitle}</p>
          <h3 className="text-white text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>
            {entry.title}
          </h3>
          {entry.tags.length > 0 && (
            <p className="text-white/60 text-[10px] mt-2 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white/80 inline-block" />
              {entry.tags.length} shoppable {entry.tags.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function LookbookPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["lookbook"],
    queryFn: async () => {
      const res = await fetch("/api/lookbook");
      if (!res.ok) throw new Error("Failed to fetch lookbook");
      return res.json() as Promise<{ lookbook: LookbookEntry[] }>;
    },
  });

  const entries = data?.lookbook ?? [];
  const seasons = ["all", ...new Set(entries.map((e) => e.season).filter(Boolean))];
  const filtered = activeFilter === "all" ? entries : entries.filter((e) => e.season === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-border/30" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-border/30" />
        </div>
        <div className="text-center max-w-2xl mx-auto px-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] tracking-[0.35em] uppercase text-muted-foreground mb-4"
          >
            Editorial
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl font-light mb-5 leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lookbook
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-sm leading-relaxed"
          >
            Tap the white dots on each image to discover and shop the pieces directly.
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col items-center mt-10 gap-1 text-muted-foreground"
        >
          <span className="text-[9px] tracking-[0.25em] uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Season filter */}
      {seasons.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 pb-10 flex-wrap">
          {seasons.map((s) => (
            <motion.button
              key={s}
              onClick={() => setActiveFilter(s)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`text-[11px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors duration-200 ${
                activeFilter === s
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/60 text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All Seasons" : s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`bg-muted animate-pulse ${i === 0 ? "col-span-2" : ""}`}
                style={{ aspectRatio: i === 0 ? "16/9" : i % 2 === 0 ? "3/4" : "4/5" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>No lookbook entries found.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              {filtered.map((entry, i) => (
                <LookbookCard key={entry.id} entry={entry} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-muted/30 py-16 text-center px-4">
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Shop The Edit</p>
        <h2 className="font-display text-3xl font-light mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Discover All Collections
        </h2>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase border border-foreground px-8 py-3.5 hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          View Collections
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
