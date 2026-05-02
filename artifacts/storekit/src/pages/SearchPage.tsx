import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useSearchProducts } from "@workspace/api-client-react";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useSearchProducts({ q: debouncedQ, pageSize: "24" } as any, {
    query: { enabled: debouncedQ.length > 0 } as any,
  });

  const products = data?.products ?? [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <h1 className="font-display text-4xl lg:text-5xl font-light text-center mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Search
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="w-full pl-12 pr-4 py-4 border-b-2 border-foreground bg-transparent text-lg focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}
          </div>
        ) : debouncedQ && products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl font-light text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
              No results for &ldquo;{debouncedQ}&rdquo;
            </p>
            <p className="text-sm text-muted-foreground mt-3">Try a different search term.</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-8">{data?.total} results for &ldquo;{debouncedQ}&rdquo;</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} id={p.id} slug={p.slug} name={p.name} basePrice={p.basePrice} compareAtPrice={p.compareAtPrice} images={p.images} variants={p.variants} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-light text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Start typing to search our collection
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
