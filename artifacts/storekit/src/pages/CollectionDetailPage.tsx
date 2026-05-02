import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useGetCollectionBySlug, useListProducts } from "@workspace/api-client-react";
import { getProductImage, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { luxury, staggerContainer } from "@/lib/animations";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="space-y-2">
          <div className="aspect-[3/4] bg-muted overflow-hidden relative">
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--border)/0.5) 50%, transparent 100%)", backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </motion.div>
      ))}
    </div>
  );
}

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $100", min: 0, max: 10000 },
  { label: "$100 – $300", min: 10000, max: 30000 },
  { label: "$300 – $500", min: 30000, max: 50000 },
  { label: "Over $500", min: 50000, max: Infinity },
];

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES

  const { data: collection, isLoading: colLoading } = useGetCollectionBySlug(slug ?? "");
  const { data: productsData, isLoading: productsLoading } = useListProducts({
    collectionSlug: slug, sort, page: String(page), pageSize: "48", status: "active",
  } as any);

  const allProducts = productsData?.products ?? [];

  // Extract filter options from products
  const allColors = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p: any) => p.variants?.forEach((v: any) => { if (v.color) set.add(v.color); }));
    return [...set];
  }, [allProducts]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p: any) => p.variants?.forEach((v: any) => { if (v.size) set.add(v.size); }));
    const order = ["XS", "S", "M", "L", "XL", "XXL"];
    return [...set].sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return ai >= 0 && bi >= 0 ? ai - bi : a.localeCompare(b);
    });
  }, [allProducts]);

  // Apply filters client-side
  const products = useMemo(() => {
    let filtered = allProducts;
    const pr = PRICE_RANGES[priceRange];

    if (pr.min > 0 || pr.max < Infinity) {
      filtered = filtered.filter((p: any) => p.basePrice >= pr.min && p.basePrice <= pr.max);
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p: any) =>
        p.variants?.some((v: any) => selectedColors.includes(v.color))
      );
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p: any) =>
        p.variants?.some((v: any) => selectedSizes.includes(v.size))
      );
    }
    return filtered;
  }, [allProducts, priceRange, selectedColors, selectedSizes]);

  const activeFilterCount = (priceRange > 0 ? 1 : 0) + selectedColors.length + selectedSizes.length;

  function clearFilters() {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange(0);
  }

  function toggleColor(c: string) {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function toggleSize(s: string) {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  return (
    <Layout>
      {/* Collection hero */}
      <AnimatePresence mode="wait">
        {!colLoading && (
          <motion.div
            key={slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: luxury }}
            className="relative h-60 lg:h-80 overflow-hidden mb-12 bg-muted"
          >
            {collection && (
              <>
                <motion.img
                  src={getProductImage(collection.imageUrl, collection.id)}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: luxury }}
                />
                <div className="absolute inset-0 bg-foreground/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-background text-center px-6">
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: luxury }}
                    className="text-[11px] tracking-[0.3em] uppercase text-background/60 mb-3">Collection</motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: luxury }}
                    className="font-display text-5xl lg:text-6xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {collection.name}
                  </motion.h1>
                  {collection.description && (
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease: luxury }}
                      className="text-sm text-background/65 max-w-md leading-relaxed">{collection.description}</motion.p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: luxury }}
          className="flex items-center justify-between mb-6 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 text-xs tracking-[0.12em] uppercase border transition-colors ${filterOpen ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className={`ml-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-medium ${filterOpen ? "bg-background text-foreground" : "bg-foreground text-background"}`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter pills */}
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p key={products.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground hidden sm:block">
                {productsLoading ? "" : `${products.length} products`}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tracking-[0.1em] uppercase hidden sm:block">Sort by</span>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-48 h-9 text-xs tracking-wide">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* ── Filter Panel ─────────────────────────────────── */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: luxury }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-border/60 mb-8">
                {/* Price */}
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Price</p>
                  <div className="flex flex-col gap-1.5">
                    {PRICE_RANGES.map((pr, i) => (
                      <button
                        key={pr.label}
                        onClick={() => setPriceRange(i)}
                        className={`text-left text-xs py-1.5 px-2 transition-colors ${priceRange === i ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                {allColors.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color: string) => {
                        // Find hex for this color from any product
                        const hex = allProducts
                          .flatMap((p: any) => p.variants ?? [])
                          .find((v: any) => v.color === color)?.colorHex ?? "#888";
                        const active = selectedColors.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            title={color}
                            className={`relative w-7 h-7 rounded-full border-2 transition-all ${active ? "border-foreground scale-110" : "border-transparent hover:border-foreground/40"}`}
                            style={{ backgroundColor: hex }}
                          >
                            {active && <span className="absolute inset-0 rounded-full ring-2 ring-offset-1 ring-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size */}
                {allSizes.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSizes.map((size: string) => {
                        const active = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`min-w-[44px] h-9 px-2.5 text-xs border transition-all ${active ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Products grid ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {productsLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductGridSkeleton />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: luxury }} className="text-center py-28">
              <p className="font-display text-3xl font-light text-muted-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
                No products found
              </p>
              <p className="text-sm text-muted-foreground tracking-wide mb-6">Try adjusting your filters or check back soon.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs tracking-[0.15em] uppercase border border-border px-5 py-2.5 hover:bg-muted transition-colors">
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key={`${slug}-${sort}-${page}-${priceRange}-${selectedColors.join()}-${selectedSizes.join()}`}
              variants={staggerContainer} initial="initial" animate="animate"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p: any, i: number) => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} basePrice={p.basePrice}
                  compareAtPrice={p.compareAtPrice} images={p.images} variants={p.variants}
                  isFeatured={p.isFeatured} isNewArrival={p.isNewArrival} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: luxury }}
            className="flex items-center justify-center gap-2 mt-16">
            {[...Array(productsData.totalPages)].map((_, i) => (
              <motion.button key={i} onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                className={`w-10 h-10 text-sm border transition-colors duration-200 ${page === i + 1 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
                {i + 1}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
