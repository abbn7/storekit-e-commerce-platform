import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeftRight, Trash2 } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { formatPrice, getProductImage } from "@/lib/utils";
import { luxury } from "@/lib/animations";

export default function CompareBar() {
  const { items, remove, clear, openModal } = useCompareStore();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: luxury }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
            {/* Label */}
            <div className="hidden sm:block flex-shrink-0">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Comparing</p>
              <p className="text-sm font-medium">{items.length} / 3 items</p>
            </div>

            <div className="h-10 w-px bg-border hidden sm:block flex-shrink-0" />

            {/* Product thumbnails */}
            <div className="flex items-center gap-3 flex-1 overflow-x-auto">
              {items.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex-shrink-0 flex items-center gap-2.5 border border-border pr-3 bg-muted/30"
                >
                  <div className="w-12 h-14 flex-shrink-0 overflow-hidden bg-muted">
                    <img
                      src={getProductImage(product.images[0]?.url, product.id)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate max-w-[120px]">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(product.basePrice)}</p>
                  </div>
                  <motion.button
                    onClick={() => remove(product.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-shrink-0 w-12 h-14 border border-dashed border-border/60 bg-muted/20 flex items-center justify-center"
                >
                  <span className="text-muted-foreground/30 text-lg">+</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                onClick={clear}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 border border-border/60 hover:border-border"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </motion.button>

              <motion.button
                onClick={openModal}
                disabled={items.length < 2}
                whileHover={items.length >= 2 ? { scale: 1.02 } : {}}
                whileTap={items.length >= 2 ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-foreground/85 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Compare {items.length >= 2 ? `(${items.length})` : ""}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
