import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string }[];
  variants?: { id: string; size: string; color: string; colorHex: string; stock: number; price: number }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  index?: number;
}

export default function ProductCard({
  id, slug, name, basePrice, compareAtPrice, images, variants = [], isFeatured, isNewArrival, index = 0
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const inWishlist = isInWishlist(id);

  const primaryImage = images[0]?.url ? getProductImage(images[0].url) : getProductImage(null, id);
  const secondaryImage = images[1]?.url ? getProductImage(images[1].url) : primaryImage;

  const hasDiscount = compareAtPrice && compareAtPrice > basePrice;
  const inStockVariants = variants.filter(v => v.stock > 0);

  function handleQuickAdd(e: React.MouseEvent, variant: typeof variants[0]) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      variantId: variant.id,
      productName: name,
      variantLabel: `${variant.size} / ${variant.color}`,
      imageUrl: primaryImage,
      price: variant.price,
      quantity: 1,
      maxQuantity: variant.stock,
    });
    openCart();
    setShowQuickAdd(false);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) removeFromWishlist(id);
    else addToWishlist(id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowQuickAdd(false); }}
    >
      <Link href={`/products/${slug}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {/* Primary image */}
          <motion.img
            src={primaryImage}
            alt={images[0]?.alt ?? name}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: isHovered && secondaryImage !== primaryImage ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          />
          {/* Secondary image crossfade */}
          {secondaryImage !== primaryImage && (
            <motion.img
              src={secondaryImage}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="bg-foreground text-background text-[10px] tracking-[0.1em] px-2 py-1 uppercase">
                Sale
              </span>
            )}
            {isNewArrival && (
              <span className="bg-accent text-accent-foreground text-[10px] tracking-[0.1em] px-2 py-1 uppercase">
                New
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-foreground text-foreground" : "text-foreground"}`} />
          </button>

          {/* Quick add */}
          <AnimatePresence>
            {isHovered && inStockVariants.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-3"
              >
                {!showQuickAdd ? (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickAdd(true); }}
                    className="w-full text-xs tracking-[0.15em] uppercase py-2 border border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    Quick Add
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {inStockVariants.slice(0, 6).map(v => (
                      <button
                        key={v.id}
                        onClick={(e) => handleQuickAdd(e, v)}
                        className="text-[10px] border border-foreground/30 px-2 py-1 hover:bg-foreground hover:text-background transition-colors tracking-wide"
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium tracking-wide text-foreground group-hover:text-foreground/70 transition-colors leading-snug">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {formatPrice(basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
