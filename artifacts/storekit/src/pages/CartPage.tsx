import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductImage } from "@/lib/utils";
import { Minus, Plus, X, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 10000 ? 0 : 999;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl lg:text-5xl font-light mb-12"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your Bag
        </motion.h1>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="font-display text-3xl font-light text-muted-foreground mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Your bag is empty
            </p>
            <Link href="/collections" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence initial={false}>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-6 pb-6 border-b border-border"
                  >
                    <div className="w-28 h-36 bg-muted flex-shrink-0 overflow-hidden">
                      <img src={getProductImage(item.imageUrl, item.productId)} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium leading-snug">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.variantLabel}</p>
                        </div>
                        <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 py-2 hover:bg-muted transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-4 py-2 text-sm tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxQuantity} className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-40">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-28 h-fit bg-card border border-border p-8">
              <h2 className="font-medium text-sm tracking-[0.1em] uppercase mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (est.)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-medium pt-4 border-t border-border text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/collections" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 tracking-wide">
                Continue Shopping
              </Link>
              {subtotal < 10000 && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Add {formatPrice(10000 - subtotal)} more for free shipping
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
