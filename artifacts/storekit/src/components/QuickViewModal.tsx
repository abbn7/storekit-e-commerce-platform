import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ArrowRight, ZoomIn } from "lucide-react";
import { Link } from "wouter";
import { useQuickViewStore } from "@/store/quickViewStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { luxury } from "@/lib/animations";
import SizeGuide from "@/components/SizeGuide";

export default function QuickViewModal() {
  const { product, close } = useQuickViewStore();
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setAdded(false);
  }, [product?.id]);

  // Close on Escape
  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [product, close]);

  // Lock body scroll
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  const images = product?.images?.length
    ? product.images
    : product ? [{ url: getProductImage(null, product.id), alt: product.name }] : [];

  const inWishlist = product ? isInWishlist(product.id) : false;

  const colors = product ? [...new Map(product.variants.map(v => [v.color, v])).values()] : [];
  const sizesForColor = product
    ? product.variants.filter(v => !selectedColor || v.color === selectedColor)
    : [];
  const uniqueSizes = [...new Set(sizesForColor.map(v => v.size))];

  const selectedVariant = product?.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );
  const price = selectedVariant?.price ?? product?.basePrice ?? 0;
  const compareAt = product?.compareAtPrice;
  const hasDiscount = compareAt && compareAt > price;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : true;

  const ctaLabel = added ? "Added to Bag ✓"
    : !selectedColor && !selectedSize ? "Select Options"
    : !selectedColor ? "Select Color"
    : !selectedSize ? "Select Size"
    : !isInStock ? "Out of Stock"
    : "Add to Bag";

  function handleAddToCart() {
    if (!selectedVariant || !product) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: `${selectedVariant.size} / ${selectedVariant.color}`,
      imageUrl: images[0]?.url ?? "",
      price: selectedVariant.price,
      quantity: 1,
      maxQuantity: selectedVariant.stock,
    });
    setAdded(true);
    toast({ title: "Added to bag ✓", description: `${product.name} · ${selectedVariant.size} / ${selectedVariant.color}` });
    setTimeout(() => {
      close();
      openCart();
    }, 700);
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            key="qv-modal"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.97 }}
            transition={{ duration: 0.45, ease: luxury }}
            className="fixed inset-x-3 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[800px] sm:max-h-[90vh] z-[81] bg-background shadow-2xl flex flex-col sm:flex-row overflow-hidden max-h-[92vh]"
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Left: Images ──────────────────────────────── */}
            <div className="sm:w-[45%] flex-shrink-0 bg-muted flex flex-row sm:flex-col">
              {/* Main image */}
              <div className="relative flex-1 aspect-square sm:aspect-[3/4] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={getProductImage(images[selectedImage]?.url, product.id)}
                    alt={images[selectedImage]?.alt ?? product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: luxury }}
                  />
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {hasDiscount && <span className="bg-foreground text-background text-[10px] tracking-[0.12em] px-2 py-0.5 uppercase">Sale</span>}
                  {product.isNewArrival && <span className="bg-accent text-accent-foreground text-[10px] tracking-[0.12em] px-2 py-0.5 uppercase">New</span>}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex flex-col sm:flex-row gap-1.5 p-2 overflow-y-auto sm:overflow-x-auto sm:overflow-y-hidden max-h-[120px] sm:max-h-none sm:max-w-full sm:h-[72px] flex-shrink-0">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex-shrink-0 w-[52px] sm:w-14 aspect-square overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-foreground" : "border-transparent opacity-50 hover:opacity-80"}`}
                    >
                      <img src={getProductImage(img.url)} alt={img.alt ?? product.name} className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Info ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-5">
              {/* Tag + Title */}
              <div>
                <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
                  {product.isNewArrival ? "New Arrival" : "Collection"}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-light leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-medium">{formatPrice(price)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-muted-foreground line-through">{formatPrice(compareAt!)}</span>
                      <span className="text-sm text-accent font-medium">{Math.round((1 - price / compareAt!) * 100)}% off</span>
                    </>
                  )}
                </div>
              </div>

              {/* Color selector */}
              {colors.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase mb-2.5 font-medium">
                    Color: <span className="font-normal text-muted-foreground">{selectedColor ?? "Select"}</span>
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {colors.map((v) => (
                      <motion.button
                        key={v.color}
                        onClick={() => { setSelectedColor(v.color); setSelectedSize(null); }}
                        title={v.color}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${selectedColor === v.color ? "border-foreground shadow-md scale-110" : "border-border hover:border-foreground/50"}`}
                        style={{ backgroundColor: v.colorHex ?? "#000" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {uniqueSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] tracking-[0.15em] uppercase font-medium">
                      Size: <span className="font-normal text-muted-foreground">{selectedSize ?? "Select"}</span>
                    </p>
                    <SizeGuide />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueSizes.map((size) => {
                      const v = sizesForColor.find(sv => sv.size === size);
                      const outOfStock = v ? v.stock === 0 : false;
                      return (
                        <motion.button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          whileHover={!outOfStock ? { scale: 1.04 } : {}}
                          whileTap={!outOfStock ? { scale: 0.96 } : {}}
                          className={`min-w-[48px] h-9 px-3 text-sm border transition-all duration-200 ${
                            selectedSize === size
                              ? "bg-foreground text-background border-foreground"
                              : outOfStock
                                ? "border-border/40 text-muted-foreground/40 line-through cursor-not-allowed"
                                : "border-border hover:border-foreground"
                          }`}
                        >
                          {size}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex gap-2.5 mt-auto pt-2">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || !isInStock || added}
                  whileHover={selectedVariant && isInStock && !added ? { scale: 1.01 } : {}}
                  whileTap={selectedVariant && isInStock && !added ? { scale: 0.98 } : {}}
                  className={`flex-1 h-12 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {ctaLabel}
                </motion.button>

                {/* Wishlist */}
                <motion.button
                  onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                  className="w-12 h-12 border border-border hover:bg-muted transition-colors flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div animate={inWishlist ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.35 }}>
                    <Heart className={`w-4 h-4 transition-colors ${inWishlist ? "fill-foreground text-foreground" : ""}`} />
                  </motion.div>
                </motion.button>
              </div>

              {/* Full details link */}
              <Link
                href={`/products/${product.slug}`}
                onClick={close}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/link w-fit"
              >
                <span className="tracking-wide underline-offset-2 hover:underline">View full details</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
