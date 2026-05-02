import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { luxury, staggerItem } from "@/lib/animations";

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
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  id, slug, name, basePrice, compareAtPrice, images, variants = [],
  isFeatured, isNewArrival, index = 0, viewMode = "grid"
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null);
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const inWishlist = isInWishlist(id);

  const primaryImage = images[0]?.url ? getProductImage(images[0].url) : getProductImage(null, id);
  const secondaryImage = images[1]?.url ? getProductImage(images[1].url) : primaryImage;
  const hasSecondImage = secondaryImage !== primaryImage;

  const hasDiscount = compareAtPrice && compareAtPrice > basePrice;
  const inStockVariants = variants.filter(v => v.stock > 0);
  const uniqueColors = [...new Map(variants.filter(v => v.stock > 0).map(v => [v.color, v])).values()];

  function handleQuickAdd(e: React.MouseEvent, variant: typeof variants[0]) {
    e.preventDefault();
    e.stopPropagation();
    setAddedVariantId(variant.id);
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
    setTimeout(() => {
      openCart();
      setShowSizes(false);
      setAddedVariantId(null);
    }, 500);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) removeFromWishlist(id);
    else addToWishlist(id);
  }

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-60px" }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowSizes(false); }}
    >
      <Link href={`/products/${slug}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {/* Primary image */}
          <motion.img
            src={primaryImage}
            alt={images[0]?.alt ?? name}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{
              opacity: isHovered && hasSecondImage ? 0 : 1,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.6, ease: luxury }}
          />

          {/* Secondary image crossfade */}
          {hasSecondImage && (
            <motion.img
              src={secondaryImage}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1.03 : 1.08,
              }}
              transition={{ duration: 0.6, ease: luxury }}
            />
          )}

          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent pointer-events-none"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-foreground text-background text-[10px] tracking-[0.12em] px-2.5 py-1 uppercase"
              >
                Sale
              </motion.span>
            )}
            {isNewArrival && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-accent text-accent-foreground text-[10px] tracking-[0.12em] px-2.5 py-1 uppercase"
              >
                New
              </motion.span>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 p-2 bg-background/90 backdrop-blur-sm"
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.85 }}
            transition={{ duration: 0.25, ease: luxury }}
            whileTap={{ scale: 0.9 }}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <motion.div
              animate={inWishlist ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.35 }}
            >
              <Heart className={`w-4 h-4 transition-colors duration-200 ${inWishlist ? "fill-foreground text-foreground" : "text-foreground"}`} />
            </motion.div>
          </motion.button>

          {/* Quick add panel */}
          <AnimatePresence>
            {isHovered && inStockVariants.length > 0 && (
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.3, ease: luxury }}
                className="absolute bottom-0 left-0 right-0 bg-background/96 backdrop-blur-sm p-3 z-10"
              >
                <AnimatePresence mode="wait">
                  {!showSizes ? (
                    <motion.button
                      key="quick-add-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizes(true); }}
                      className="w-full flex items-center justify-center gap-2 text-[11px] tracking-[0.18em] uppercase py-2.5 border border-foreground hover:bg-foreground hover:text-background transition-colors duration-200"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Quick Add
                    </motion.button>
                  ) : (
                    <motion.div
                      key="sizes"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-wrap gap-1.5"
                    >
                      {inStockVariants.slice(0, 7).map((v, i) => (
                        <motion.button
                          key={v.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04, ease: luxury }}
                          onClick={(e) => handleQuickAdd(e, v)}
                          className={`text-[10px] border px-2.5 py-1.5 tracking-wide transition-all duration-200 ${
                            addedVariantId === v.id
                              ? "bg-accent border-accent text-accent-foreground"
                              : "border-foreground/40 hover:bg-foreground hover:text-background hover:border-foreground"
                          }`}
                        >
                          {v.size}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Color dots */}
        {uniqueColors.length > 1 && (
          <motion.div
            className="flex gap-1.5 mt-2.5"
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            {uniqueColors.slice(0, 5).map((v) => (
              <div
                key={v.color}
                title={v.color}
                className="w-2.5 h-2.5 rounded-full border border-border/50"
                style={{ backgroundColor: v.colorHex }}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{uniqueColors.length - 5}</span>
            )}
          </motion.div>
        )}

        {/* Product info */}
        <div className="mt-2.5 space-y-1">
          <h3 className="text-sm font-medium tracking-wide text-foreground leading-snug">
            <span className="relative inline-block">
              {name}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px bg-foreground"
                animate={{ width: isHovered ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: luxury }}
              />
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatPrice(basePrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice!)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
