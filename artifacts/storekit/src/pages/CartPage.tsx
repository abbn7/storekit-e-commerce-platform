import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductImage } from "@/lib/utils";
import { Minus, Plus, X, ArrowRight, Tag, Loader2, Check, AlertCircle } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 10000 ? 0 : 999;
  const tax = Math.round(subtotal * 0.08);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string; discountAmount: number; discountType: string; discountValue: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const discount = appliedPromo?.discountAmount ?? 0;
  const total = subtotal + shippingCost + tax - discount;

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotalCents: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error ?? "Invalid promo code");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoCode("");
      }
    } catch {
      setPromoError("Could not validate code. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  }

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

              {/* Promo Code */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  {appliedPromo ? (
                    <motion.div
                      key="applied"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 rounded-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-medium text-green-700 tracking-widest">{appliedPromo.code}</p>
                          <p className="text-[10px] text-green-600 mt-0.5">
                            {appliedPromo.discountType === "percent"
                              ? `${appliedPromo.discountValue}% off applied`
                              : `${formatPrice(appliedPromo.discountAmount)} off applied`}
                          </p>
                        </div>
                      </div>
                      <button onClick={removePromo} className="text-green-400 hover:text-green-600 transition-colors ml-2">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                            placeholder="Promo code"
                            className="w-full pl-8 pr-3 py-2.5 border border-border bg-background text-xs tracking-widest font-mono uppercase focus:outline-none focus:border-foreground/50 transition-colors placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                          />
                        </div>
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || promoLoading}
                          className="px-4 py-2.5 border border-foreground bg-foreground text-background text-xs tracking-[0.12em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {promoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                      <AnimatePresence>
                        {promoError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 mt-2 text-red-500 text-xs"
                          >
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            {promoError}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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

                {appliedPromo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-sm text-green-600"
                  >
                    <span>Discount ({appliedPromo.code})</span>
                    <span>−{formatPrice(discount)}</span>
                  </motion.div>
                )}

                <div className="flex justify-between font-medium pt-4 border-t border-border text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors"
              >
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
