import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Heart, User, Menu, X, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useGetStoreConfig } from "@workspace/api-client-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
      if (currentY > lastScrollY.current && currentY > 120) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Collections", href: "/collections" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span
                className="font-accent tracking-[0.2em] text-xl"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {config?.storeName ?? "STOREKIT"}
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop icons */}
            <div className="hidden lg:flex items-center gap-5">
              <Link href="/search" className="p-1 text-foreground/70 hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <Link href="/account/wishlist" className="relative p-1 text-foreground/70 hover:text-foreground transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link href="/account" className="p-1 text-foreground/70 hover:text-foreground transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/admin" className="p-1 text-foreground/40 hover:text-foreground/70 transition-colors" title="Admin Panel">
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              <button
                onClick={openCart}
                className="relative p-1 text-foreground/70 hover:text-foreground transition-colors"
                data-testid="cart-button"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center font-medium"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile icons */}
            <div className="flex lg:hidden items-center gap-4">
              <button onClick={openCart} className="relative p-1">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-1">
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-16"
          >
            <div className="flex flex-col items-center justify-center h-full gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="font-display text-4xl font-light tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-8 mt-4">
                <Link href="/search" onClick={() => setIsMobileOpen(false)}><Search className="w-6 h-6" /></Link>
                <Link href="/account/wishlist" onClick={() => setIsMobileOpen(false)}><Heart className="w-6 h-6" /></Link>
                <Link href="/account" onClick={() => setIsMobileOpen(false)}><User className="w-6 h-6" /></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
