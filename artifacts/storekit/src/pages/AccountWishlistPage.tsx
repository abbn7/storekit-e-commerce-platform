import { motion } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useListProducts } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

function WishlistContent() {
  const { items: wishlistIds } = useWishlistStore();
  const { data: productsData } = useListProducts({ pageSize: "100", status: "active" } as any);

  const wishlistProducts = (productsData?.products ?? []).filter((p: any) => wishlistIds.includes(p.id));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-10">
            <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Account</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Wishlist</span>
          </div>
          <h1 className="font-display text-4xl font-light mb-10" style={{ fontFamily: "var(--font-display)" }}>My Wishlist</h1>

          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-2xl font-light text-muted-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Your wishlist is empty
              </p>
              <Link href="/collections" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {wishlistProducts.map((p: any, i: number) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  basePrice={p.basePrice}
                  compareAtPrice={p.compareAtPrice}
                  images={p.images}
                  variants={p.variants}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

export default function AccountWishlistPage() {
  return (
    <>
      <SignedIn><WishlistContent /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
