import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useGetCollectionBySlug, useListProducts } from "@workspace/api-client-react";
import { getProductImage } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      {collection && (
        <div className="relative h-64 lg:h-80 overflow-hidden mb-12 bg-muted">
          <img
            src={getProductImage(collection.imageUrl, collection.id)}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-background text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl lg:text-6xl font-light mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {collection.name}
            </motion.h1>
            {collection.description && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-sm text-background/70 max-w-md"
              >
                {collection.description}
              </motion.p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">
            {productsLoading ? "Loading..." : `${productsData?.total ?? 0} products`}
          </p>
          <div className="flex items-center gap-4">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 h-9 text-sm">
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
        </div>

        {/* Products grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl font-light text-muted-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
              No products found
            </p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
          </div>
        )}

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {[...Array(productsData.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 text-sm border transition-colors ${
                  page === i + 1 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
