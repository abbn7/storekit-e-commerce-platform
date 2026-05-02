import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import { useGetProductBySlug } from "@workspace/api-client-react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, Package, RotateCcw, Truck, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { luxury, staggerItem } from "@/lib/animations";

function Skeleton() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-muted animate-[shimmer_1.8s_infinite]" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)", backgroundSize: "200% 100%" }} />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-24 bg-muted animate-pulse" />)}
          </div>
        </div>
        <div className="space-y-6 pt-4">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-10 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-7 bg-muted animate-pulse rounded w-1/3" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useGetProductBySlug(slug ?? "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [product]);

  if (isLoading) return <Skeleton />;

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-display text-2xl text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>Product not found</p>
        </div>
      </Layout>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length > 0
    ? [...product.images].sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    : [{ url: getProductImage(null, product.id), alt: product.name, isPrimary: true, sortOrder: 0, id: "0" }];

  const colors = [...new Set(product.variants?.map((v: any) => v.color) ?? [])];
  const sizesForColor = product.variants
    ?.filter((v: any) => !selectedColor || v.color === selectedColor)
    .map((v: any) => v.size) ?? [];
  const uniqueSizes = [...new Set(sizesForColor)];

  const selectedVariant = product.variants?.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const isInStock = selectedVariant ? (selectedVariant.stock ?? 0) > 0 : true;
  const stockStatus = selectedVariant
    ? (selectedVariant.stock ?? 0) === 0 ? "Out of Stock"
      : (selectedVariant.stock ?? 0) < 5 ? `Only ${selectedVariant.stock} left`
        : "In Stock"
    : null;

  const price = selectedVariant?.price ?? product.basePrice;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  function handleAddToCart() {
    if (!selectedVariant) {
      toast({ title: "Please select size and color", variant: "destructive" });
      return;
    }
    addItem({
      productId: product!.id,
      variantId: selectedVariant.id,
      productName: product!.name,
      variantLabel: `${selectedVariant.size} / ${selectedVariant.color}`,
      imageUrl: images[0]?.url ?? "",
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice ?? undefined,
      quantity: qty,
      maxQuantity: selectedVariant.stock ?? 1,
    });
    openCart();
    toast({ title: "Added to bag ✓", description: `${product!.name} · ${selectedVariant.size} / ${selectedVariant.color}` });
  }

  const ctaLabel = !selectedColor && !selectedSize ? "Select Options"
    : !selectedColor ? "Select Color"
    : !selectedSize ? "Select Size"
    : !isInStock ? "Out of Stock"
    : "Add to Bag";

  const infoItems = [
    { key: "tag", delay: 0 },
    { key: "title", delay: 0.07 },
    { key: "price", delay: 0.14 },
    { key: "desc", delay: 0.21 },
    { key: "colors", delay: 0.28 },
    { key: "sizes", delay: 0.35 },
    { key: "cta", delay: 0.42 },
  ];

  return (
    <Layout>
      {/* Sticky buy bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: luxury }}
            className="fixed top-[calc(40px+80px)] left-0 right-0 z-30 bg-background/96 backdrop-blur-md border-b border-border shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={getProductImage(images[0]?.url, product.id)}
                  alt={product.name}
                  className="w-9 h-11 object-cover bg-muted flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(price)}</p>
                </div>
              </div>
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !isInStock}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 bg-foreground text-background px-6 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ctaLabel}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">

          {/* Image gallery */}
          <div className="flex gap-3">
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
                {images.map((img: any, i: number) => (
                  <motion.button
                    key={img.id ?? i}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-colors duration-300 ${
                      selectedImage === i ? "border-foreground" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={getProductImage(img.url)}
                      alt={img.alt ?? product.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-muted cursor-zoom-in group"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={getProductImage(images[selectedImage]?.url, product.id)}
                    alt={images[selectedImage]?.alt ?? product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: isZoomed ? 1.18 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: luxury }}
                  />
                </AnimatePresence>

                {/* Zoom hint */}
                <motion.div
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 pointer-events-none"
                  animate={{ opacity: isZoomed ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ZoomIn className="w-4 h-4 text-foreground/60" />
                </motion.div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {hasDiscount && (
                    <span className="bg-foreground text-background text-[10px] tracking-[0.12em] px-2.5 py-1 uppercase">Sale</span>
                  )}
                  {product.isNewArrival && (
                    <span className="bg-accent text-accent-foreground text-[10px] tracking-[0.12em] px-2.5 py-1 uppercase">New</span>
                  )}
                </div>

                {/* Nav arrows for mobile */}
                {images.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none lg:hidden">
                    <motion.button
                      className="p-2 bg-background/80 pointer-events-auto"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i => Math.max(0, i - 1)); }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-background/80 pointer-events-auto"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i => Math.min(images.length - 1, i + 1)); }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="flex gap-1.5 justify-center mt-3">
                  {images.map((_: any, i: number) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className="rounded-full bg-foreground"
                      animate={{ width: selectedImage === i ? 20 : 6, height: 6, opacity: selectedImage === i ? 1 : 0.25 }}
                      transition={{ duration: 0.3, ease: luxury }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="lg:pt-2">
            {/* Tag */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0, ease: luxury }}
              className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-3"
            >
              {product.tags?.[0] ?? "New Arrival"}
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: luxury }}
              className="font-display text-3xl lg:text-4xl font-light leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: luxury }}
              className="flex items-baseline gap-3 mb-6"
            >
              <span className="text-2xl font-medium">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAtPrice!)}</span>
              )}
              {hasDiscount && (
                <span className="text-sm text-accent font-medium">
                  {Math.round((1 - price / compareAtPrice!) * 100)}% off
                </span>
              )}
            </motion.div>

            {/* Short description */}
            {product.shortDescription && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: luxury }}
                className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm"
              >
                {product.shortDescription}
              </motion.p>
            )}

            {/* Color selector */}
            {colors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.27, ease: luxury }}
                className="mb-6"
              >
                <p className="text-[11px] tracking-[0.15em] uppercase mb-3 font-medium">
                  Color: <span className="font-normal text-muted-foreground">{selectedColor ?? "Select"}</span>
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {colors.map((color: any) => {
                    const variant = product.variants?.find((v: any) => v.color === color);
                    return (
                      <motion.button
                        key={color}
                        onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                        title={color}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                          selectedColor === color
                            ? "border-foreground shadow-md scale-110"
                            : "border-border hover:border-foreground/50"
                        }`}
                        style={{ backgroundColor: variant?.colorHex ?? "#000" }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Size selector */}
            {uniqueSizes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.34, ease: luxury }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] tracking-[0.15em] uppercase font-medium">
                    Size: <span className="font-normal text-muted-foreground">{selectedSize ?? "Select"}</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size: any) => {
                    const v = product.variants?.find((v: any) => v.size === size && (!selectedColor || v.color === selectedColor));
                    const outOfStock = v ? (v.stock ?? 0) === 0 : false;
                    return (
                      <motion.button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        whileHover={!outOfStock ? { scale: 1.04 } : {}}
                        whileTap={!outOfStock ? { scale: 0.96 } : {}}
                        className={`min-w-[52px] h-10 px-3 text-sm border transition-all duration-200 ${
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
              </motion.div>
            )}

            {/* Stock status */}
            <AnimatePresence mode="wait">
              {stockStatus && (
                <motion.p
                  key={stockStatus}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className={`text-xs mb-4 tracking-wide ${
                    stockStatus === "Out of Stock" ? "text-destructive"
                      : stockStatus.startsWith("Only") ? "text-accent"
                        : "text-muted-foreground"
                  }`}
                >
                  {stockStatus}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Quantity + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: luxury }}
              className="space-y-3 mb-8"
            >
              <div className="flex gap-3">
                {/* Qty */}
                <div className="flex items-center border border-border h-12">
                  <motion.button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 h-full hover:bg-muted transition-colors text-lg leading-none"
                    whileTap={{ scale: 0.88 }}
                  >
                    −
                  </motion.button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={qty}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="px-4 text-sm tabular-nums min-w-[3rem] text-center"
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                  <motion.button
                    onClick={() => setQty(q => Math.min(selectedVariant?.stock ?? 10, q + 1))}
                    className="px-3 h-full hover:bg-muted transition-colors text-lg leading-none"
                    whileTap={{ scale: 0.88 }}
                  >
                    +
                  </motion.button>
                </div>

                {/* Add to bag */}
                <motion.button
                  ref={ctaRef}
                  onClick={handleAddToCart}
                  disabled={!isInStock && !!selectedVariant}
                  className="flex-1 h-12 bg-foreground text-background text-[11px] tracking-[0.2em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="add-to-cart"
                >
                  {ctaLabel}
                </motion.button>

                {/* Wishlist */}
                <motion.button
                  onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                  className="w-12 h-12 border border-border hover:bg-muted transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div animate={inWishlist ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.35 }}>
                    <Heart className={`w-5 h-5 transition-colors ${inWishlist ? "fill-foreground text-foreground" : ""}`} />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: luxury }}
              className="flex flex-col gap-3 mb-8 pb-8 border-b border-border/60"
            >
              {([
                [Truck, "Free shipping on orders over $100"],
                [RotateCcw, "Free returns within 30 days"],
                [Package, "Ships in 2–3 business days"],
              ] as const).map(([Icon, text]: any, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="tracking-wide">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Accordion */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55, ease: luxury }}
            >
              <Accordion type="single" collapsible className="w-full">
                {product.description && (
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-[11px] tracking-[0.18em] uppercase font-medium py-4 hover:no-underline">
                      Description
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {product.description}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(product.material || product.careInstructions) && (
                  <AccordionItem value="materials">
                    <AccordionTrigger className="text-[11px] tracking-[0.18em] uppercase font-medium py-4 hover:no-underline">
                      Materials & Care
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 space-y-2">
                      {product.material && <p><strong className="text-foreground font-medium">Material:</strong> {product.material}</p>}
                      {product.careInstructions && <p><strong className="text-foreground font-medium">Care:</strong> {product.careInstructions}</p>}
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-[11px] tracking-[0.18em] uppercase font-medium py-4 hover:no-underline">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    Free standard shipping on orders over $100. Express options available at checkout.
                    Returns accepted within 30 days of purchase. Items must be unworn and in original condition.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
