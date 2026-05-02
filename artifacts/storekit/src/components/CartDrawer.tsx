import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { luxury } from "@/lib/animations";

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, itemCount } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 10000;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent side="right" className="w-full max-w-[420px] p-0 flex flex-col border-l border-border">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-light tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
              Your Bag
              <AnimatePresence mode="wait">
                <motion.span
                  key={itemCount}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="ml-2 text-sm font-normal text-muted-foreground"
                >
                  ({itemCount})
                </motion.span>
              </AnimatePresence>
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Free shipping bar */}
        <div className="px-6 py-3.5 bg-muted/40 border-b border-border/40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] tracking-[0.12em] text-muted-foreground mb-2 uppercase"
          >
            {toFreeShipping > 0
              ? <span>Add <span className="text-foreground font-medium">{formatPrice(toFreeShipping)}</span> for free shipping</span>
              : <span className="text-accent font-medium">You've unlocked free shipping!</span>}
          </motion.div>
          <div className="h-px bg-border/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: luxury }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: luxury }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-5 text-muted-foreground/30"
                >
                  <ShoppingBag className="w-12 h-12" />
                </motion.div>
                <p className="font-display text-xl font-light text-muted-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Your bag is empty
                </p>
                <p className="text-xs text-muted-foreground tracking-wide">
                  Add something beautiful to get started.
                </p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 24, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -24, height: 0 }}
                  transition={{ duration: 0.35, ease: luxury }}
                  className="flex gap-4 overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/products/${item.productId}`} onClick={closeCart}>
                    <div className="w-[88px] h-[110px] bg-muted flex-shrink-0 overflow-hidden">
                      <motion.img
                        src={getProductImage(item.imageUrl, item.productId)}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: luxury }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium leading-snug">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">{item.variantLabel}</p>
                      </div>
                      <motion.button
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border/60">
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          whileTap={{ scale: 0.88 }}
                        >
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={item.quantity}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="w-8 text-center text-sm tabular-nums"
                          >
                            {item.quantity}
                          </motion.span>
                        </AnimatePresence>
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
                          disabled={item.quantity >= item.maxQuantity}
                          whileTap={{ scale: 0.88 }}
                        >
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>

                      {/* Price */}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={item.price * item.quantity}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium"
                        >
                          {formatPrice(item.price * item.quantity)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: luxury }}
              className="px-6 py-6 border-t border-border/60 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={subtotal}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {formatPrice(subtotal)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="text-[11px] text-muted-foreground tracking-wide">Shipping and taxes calculated at checkout</p>
              </div>

              <div className="flex gap-2.5">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex-1 text-center py-3.5 border border-border text-[11px] tracking-[0.14em] uppercase hover:bg-muted transition-colors duration-200"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-foreground text-background text-[11px] tracking-[0.14em] uppercase hover:bg-foreground/85 transition-colors duration-200"
                >
                  Checkout
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
