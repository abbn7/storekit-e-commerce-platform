import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useGetCollectionBySlug, useListProducts } from "@workspace/api-client-react";
import { getProductImage } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { luxury, staggerContainer } from "@/lib/animations";

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-2"
        >
          <div className="aspect-[3/4] bg-muted overflow-hidden relative">
            <motion.div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, hsl(var(--border)/0.5) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
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

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: collection, isLoading: colLoading } = useGetCollectionBySlug(slug ?? "");
  const { data: productsData, isLoading: productsLoading } = useListProducts({
    collectionSlug: slug,
    sort,
    page: String(page),
    pageSize: "24",
    status: "active",
  } as any);

  const products = productsData?.products ?? [];

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
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: luxury }}
                    className="text-[11px] tracking-[0.3em] uppercase text-background/60 mb-3"
                  >
                    Collection
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: luxury }}
                    className="font-display text-5xl lg:text-6xl font-light mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {collection.name}
                  </motion.h1>
                  {collection.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.45, ease: luxury }}
                      className="text-sm text-background/65 max-w-md leading-relaxed"
                    >
                      {collection.description}
                    </motion.p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        {/* Filter / sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: luxury }}
          className="flex items-center justify-between mb-10 pb-5 border-b border-border/60"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={productsData?.total ?? "loading"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground tracking-wide"
            >
              {productsLoading ? "Loading..." : `${productsData?.total ?? 0} products`}
            </motion.p>
          </AnimatePresence>

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

        {/* Products grid */}
        <AnimatePresence mode="wait">
          {productsLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductGridSkeleton />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: luxury }}
              className="text-center py-28"
            >
              <p className="font-display text-3xl font-light text-muted-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
                No products found
              </p>
              <p className="text-sm text-muted-foreground tracking-wide">Try adjusting your filters or check back soon.</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${slug}-${sort}-${page}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {products.map((p, i) => (
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
          )}
        </AnimatePresence>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: luxury }}
            className="flex items-center justify-center gap-2 mt-16"
          >
            {[...Array(productsData.totalPages)].map((_, i) => (
              <motion.button
                key={i}
                onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className={`w-10 h-10 text-sm border transition-colors duration-200 ${
                  page === i + 1 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
