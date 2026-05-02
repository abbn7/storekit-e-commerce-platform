import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import { useGetProductBySlug } from "@workspace/api-client-react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, ChevronDown, Package, RotateCcw, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useGetProductBySlug(slug ?? "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-24 bg-muted animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
            <div className="h-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-display text-2xl text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Product not found
          </p>
        </div>
      </Layout>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const images = product.images?.length > 0
    ? product.images.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
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
    toast({ title: "Added to bag", description: `${product!.name} — ${selectedVariant.size} / ${selectedVariant.color}` });
  }

  const price = selectedVariant?.price ?? product.basePrice;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Image gallery */}
          <div className="flex gap-4">
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-20 flex-shrink-0">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-foreground" : "border-transparent"}`}
                  >
                    <img src={getProductImage(img.url)} alt={img.alt ?? product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 relative aspect-[3/4] overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={getProductImage(images[selectedImage]?.url, product.id)}
                  alt={images[selectedImage]?.alt ?? product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {compareAtPrice && compareAtPrice > price && (
                  <span className="bg-foreground text-background text-[10px] tracking-[0.1em] px-2 py-1 uppercase">Sale</span>
                )}
                {product.isNewArrival && (
                  <span className="bg-accent text-accent-foreground text-[10px] tracking-[0.1em] px-2 py-1 uppercase">New</span>
                )}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="lg:pt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {product.tags?.[0] ?? "New Arrival"}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-light leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-medium">{formatPrice(price)}</span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
                )}
              </div>
              {product.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.shortDescription}</p>
              )}

              {/* Color selector */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs tracking-[0.1em] uppercase mb-3 font-medium">
                    Color: <span className="font-normal text-muted-foreground">{selectedColor ?? "Select"}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color: any) => {
                      const variant = product.variants?.find((v: any) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                          title={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? "border-foreground scale-110" : "border-border hover:border-foreground/50"}`}
                          style={{ backgroundColor: variant?.colorHex ?? "#000" }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {uniqueSizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs tracking-[0.1em] uppercase mb-3 font-medium">
                    Size: <span className="font-normal text-muted-foreground">{selectedSize ?? "Select"}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueSizes.map((size: any) => {
                      const v = product.variants?.find((v: any) => v.size === size && (!selectedColor || v.color === selectedColor));
                      const outOfStock = v ? (v.stock ?? 0) === 0 : false;
                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={`min-w-[52px] h-10 px-3 text-sm border transition-all ${
                            selectedSize === size ? "bg-foreground text-background border-foreground"
                              : outOfStock ? "border-border text-muted-foreground line-through cursor-not-allowed"
                                : "border-border hover:border-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock status */}
              {stockStatus && (
                <p className={`text-xs mb-4 ${stockStatus === "Out of Stock" ? "text-destructive" : stockStatus.startsWith("Only") ? "text-accent" : "text-muted-foreground"}`}>
                  {stockStatus}
                </p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors text-lg leading-none">−</button>
                  <span className="px-4 py-2 text-sm tabular-nums min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(selectedVariant?.stock ?? 10, q + 1))} className="px-3 py-2 hover:bg-muted transition-colors text-lg leading-none">+</button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock && !!selectedVariant}
                  className="flex-1 bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="add-to-cart"
                >
                  {!selectedSize || !selectedColor ? "Select Options" : !isInStock ? "Out of Stock" : "Add to Bag"}
                </button>
                <button
                  onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                  className="p-4 border border-border hover:bg-muted transition-colors"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? "fill-foreground" : ""}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-border">
                {[
                  [Truck, "Free shipping on orders over $100"],
                  [RotateCcw, "Free returns within 30 days"],
                  [Package, "Ships in 2-3 business days"],
                ].map(([Icon, text]: any, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Accordion details */}
              <Accordion type="single" collapsible className="w-full">
                {product.description && (
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-xs tracking-[0.15em] uppercase font-medium py-4">Description</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {product.description}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(product.material || product.careInstructions) && (
                  <AccordionItem value="materials">
                    <AccordionTrigger className="text-xs tracking-[0.15em] uppercase font-medium py-4">Materials & Care</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 space-y-2">
                      {product.material && <p><strong>Material:</strong> {product.material}</p>}
                      {product.careInstructions && <p><strong>Care:</strong> {product.careInstructions}</p>}
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-xs tracking-[0.15em] uppercase font-medium py-4">Shipping & Returns</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    Free standard shipping on orders over $100. Express options available at checkout. Returns accepted within 30 days of purchase. Items must be unworn and in original condition.
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
