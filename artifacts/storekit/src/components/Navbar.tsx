import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ShoppingBag, Search, Heart, User, Menu, X, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useGetStoreConfig } from "@workspace/api-client-react";
import { luxury } from "@/lib/animations";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const { itemCount, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [location] = useLocation();
  const { data: config } = useGetStoreConfig();

  const isAdminRoute = location.startsWith("/admin");
  if (isAdminRoute) return null;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 60);
      if (currentY > lastScrollY.current && currentY > 160) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Collections", href: "/collections" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-10 left-0 right-0 z-40 transition-colors duration-500 ${
          isScrolled ? "bg-background/96 backdrop-blur-md border-b border-border/60" : "bg-transparent"
        }`}
        animate={{ y: isHidden ? -120 : 0 }}
        transition={{ duration: 0.4, ease: luxury }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.span
                className="font-accent tracking-[0.22em] text-xl"
                style={{ fontFamily: "var(--font-accent)" }}
                whileHover={{ letterSpacing: "0.28em" }}
                transition={{ duration: 0.4, ease: luxury }}
              >
                {config?.storeName ?? "STOREKIT"}
              </motion.span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative text-xs tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-200 py-1"
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {link.label}
                    <motion.span
                      className="absolute -bottom-0.5 left-0 h-px bg-foreground"
                      animate={{ width: isActive || hoveredLink === link.href ? "100%" : "0%" }}
                      transition={{ duration: 0.3, ease: luxury }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Desktop icons */}
            <div className="hidden lg:flex items-center gap-5">
              <Link href="/search">
                <motion.div
                  className="p-1 text-foreground/60 hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
              </Link>

              <Link href="/account/wishlist" className="relative">
                <motion.div
                  className="p-1 text-foreground/60 hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Heart className="w-5 h-5" />
                  <AnimatePresence>
                    {wishlistItems.length > 0 && (
                      <motion.span
                        key={wishlistItems.length}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-medium"
                      >
                        {wishlistItems.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              <Link href="/account">
                <motion.div
                  className="p-1 text-foreground/60 hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <User className="w-5 h-5" />
                </motion.div>
              </Link>

              <Link href="/admin" title="Admin Panel">
                <motion.div
                  className="p-1 text-foreground/30 hover:text-foreground/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </motion.div>
              </Link>

              <motion.button
                onClick={openCart}
                className="relative p-1 text-foreground/60 hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                data-testid="cart-button"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center font-medium"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile icons */}
            <div className="flex lg:hidden items-center gap-4">
              <motion.button
                onClick={openCart}
                className="relative p-1"
                whileTap={{ scale: 0.92 }}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-1"
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isMobileOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: luxury }}
            className="fixed inset-0 z-30 bg-background pt-[calc(40px+64px)] flex flex-col"
          >
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ease: luxury, duration: 0.5 }}
                >
                  <Link
                    href={link.href}
                    className="font-display text-4xl font-light tracking-wide hover:text-foreground/60 transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, ease: luxury, duration: 0.5 }}
                className="flex items-center gap-8 mt-4"
              >
                <Link href="/search"><Search className="w-6 h-6" /></Link>
                <Link href="/account/wishlist"><Heart className="w-6 h-6" /></Link>
                <Link href="/account"><User className="w-6 h-6" /></Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
