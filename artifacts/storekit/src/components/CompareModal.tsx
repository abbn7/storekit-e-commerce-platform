import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Minus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useCompareStore } from "@/store/compareStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductImage } from "@/lib/utils";
import { luxury } from "@/lib/animations";
import { useEffect } from "react";

const ROW_LABELS = [
  { key: "image",       label: "" },
  { key: "name",        label: "Product" },
  { key: "price",       label: "Price" },
  { key: "discount",    label: "Discount" },
  { key: "newArrival",  label: "New Arrival" },
  { key: "featured",    label: "Featured" },
  { key: "colors",      label: "Colors" },
  { key: "sizes",       label: "Sizes" },
  { key: "inStock",     label: "In Stock" },
  { key: "variants",    label: "Variants" },
  { key: "cta",         label: "" },
];

function Cell({ rowKey, product }: { rowKey: string; product: any }) {
  const { addItem, openCart } = useCartStore();
  const { closeModal } = useCompareStore();

  const inStockVariants = product.variants?.filter((v: any) => v.stock > 0) ?? [];
  const colors = [...new Map(product.variants?.map((v: any) => [v.color, v]) ?? []).values()];
  const sizes = [...new Set(product.variants?.map((v: any) => v.size) ?? [])];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPct = hasDiscount ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100) : 0;

  switch (rowKey) {
    case "image":
      return (
        <div className="relative aspect-[3/4] overflow-hidden bg-muted w-full">
          <img
            src={getProductImage(product.images?.[0]?.url, product.id)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.isNewArrival && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[9px] tracking-[0.1em] px-2 py-0.5 uppercase">New</span>
          )}
        </div>
      );

    case "name":
      return (
        <p className="text-sm font-medium leading-snug text-center">{product.name}</p>
      );

    case "price":
      return (
        <div className="text-center">
          <p className="text-base font-medium">{formatPrice(product.basePrice)}</p>
          {hasDiscount && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
          )}
        </div>
      );

    case "discount":
      return hasDiscount ? (
        <span className="inline-block text-xs font-medium text-accent bg-accent/10 px-2 py-1">−{discountPct}%</span>
      ) : (
        <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />
      );

    case "newArrival":
      return product.isNewArrival
        ? <Check className="w-4 h-4 text-green-500 mx-auto" />
        : <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />;

    case "featured":
      return product.isFeatured
        ? <Check className="w-4 h-4 text-green-500 mx-auto" />
        : <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />;

    case "colors":
      return (
        <div className="flex gap-1.5 flex-wrap justify-center">
          {(colors as any[]).map((v: any) => (
            <div key={v.color} title={v.color} className="w-5 h-5 rounded-full border border-border/60" style={{ backgroundColor: v.colorHex ?? "#888" }} />
          ))}
          {colors.length === 0 && <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
        </div>
      );

    case "sizes":
      return (
        <div className="flex gap-1 flex-wrap justify-center">
          {(sizes as string[]).map((s) => (
            <span key={s} className="text-[10px] border border-border/60 px-1.5 py-0.5">{s}</span>
          ))}
          {sizes.length === 0 && <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
        </div>
      );

    case "inStock":
      return inStockVariants.length > 0
        ? <span className="text-xs text-green-600 dark:text-green-400 font-medium">In Stock</span>
        : <span className="text-xs text-destructive font-medium">Out of Stock</span>;

    case "variants":
      return (
        <span className="text-sm text-muted-foreground">{product.variants?.length ?? 0} options</span>
      );

    case "cta":
      return (
        <div className="flex flex-col gap-2 w-full">
          <Link
            href={`/products/${product.slug}`}
            onClick={closeModal}
            className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.15em] uppercase border border-foreground px-3 py-2.5 hover:bg-foreground hover:text-background transition-colors duration-200"
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </Link>
          {inStockVariants.length > 0 && (
            <button
              onClick={() => {
                const v = inStockVariants[0];
                addItem({
                  productId: product.id,
                  variantId: v.id,
                  productName: product.name,
                  variantLabel: `${v.size} / ${v.color}`,
                  imageUrl: product.images?.[0]?.url ?? "",
                  price: v.price,
                  quantity: 1,
                  maxQuantity: v.stock,
                });
                closeModal();
                openCart();
              }}
              className="text-[10px] tracking-[0.15em] uppercase bg-foreground text-background px-3 py-2.5 hover:bg-foreground/85 transition-colors"
            >
              Quick Add
            </button>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default function CompareModal() {
  const { items, isOpen, closeModal, remove } = useCompareStore();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const cols = items.length;

  return (
    <AnimatePresence>
      {isOpen && items.length >= 2 && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] bg-foreground/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            key="cm-modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.45, ease: luxury }}
            className="fixed inset-3 sm:inset-6 lg:inset-10 z-[91] bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Side by Side</p>
                <h2 className="font-display text-2xl font-light" style={{ fontFamily: "var(--font-display)" }}>
                  Compare Products
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse min-w-[480px]">
                <colgroup>
                  <col className="w-[140px] sm:w-[180px]" />
                  {items.map((p) => <col key={p.id} />)}
                </colgroup>

                <tbody>
                  {ROW_LABELS.map((row, ri) => (
                    <motion.tr
                      key={row.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ri * 0.03, duration: 0.3 }}
                      className={row.key === "image" || row.key === "cta" ? "" : "border-b border-border/40 hover:bg-muted/20 transition-colors"}
                    >
                      {/* Row label */}
                      <td className={`py-3 px-4 sm:px-6 text-left align-middle ${row.key === "image" || row.key === "cta" ? "py-0" : ""}`}>
                        {row.label && (
                          <span className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-medium">
                            {row.label}
                          </span>
                        )}
                      </td>

                      {/* Product cells */}
                      {items.map((product) => (
                        <td
                          key={product.id}
                          className={`py-3 px-3 sm:px-5 text-center align-middle relative ${row.key === "image" ? "pt-0" : ""}`}
                        >
                          {/* Remove product (only on image row) */}
                          {row.key === "image" && (
                            <motion.button
                              onClick={() => remove(product.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-foreground/80 text-background rounded-full flex items-center justify-center hover:bg-foreground transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          )}
                          <Cell rowKey={row.key} product={product} />
                        </td>
                      ))}

                      {/* Empty column if only 2 products */}
                      {cols === 2 && (
                        <td className="py-3 px-3 sm:px-5 text-center align-middle">
                          <div className="text-muted-foreground/20 text-xs italic">—</div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
