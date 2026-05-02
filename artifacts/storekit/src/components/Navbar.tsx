import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, Heart, User, Menu, X,
  LayoutDashboard, Sun, Moon, Globe,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useGetStoreConfig } from "@workspace/api-client-react";
import { luxury } from "@/lib/animations";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/i18n";

export default function Navbar() {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [isHidden, setIsHidden]         = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink]   = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const lastScrollY = useRef(0);

  const { itemCount, openCart }       = useCartStore();
  const { items: wishlistItems }      = useWishlistStore();
  const [location]                    = useLocation();
  const { data: config }              = useGetStoreConfig();
  const { theme, toggleTheme }        = useTheme();
  const { t, i18n }                   = useTranslation();
  const currentLang                   = i18n.language as "en" | "ar";

  const isAdminRoute = location.startsWith("/admin");
  if (isAdminRoute) return null;

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 60);
      setIsHidden(y > lastScrollY.current && y > 160);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [location]);

  const navLinks = [
    { label: t("nav.collections"),  href: "/collections" },
    { label: t("nav.newArrivals"),   href: "/collections/new-arrivals" },
    { label: t("nav.about"),         href: "/about" },
  ];

  function handleLangSwitch(lang: "en" | "ar") {
    setLanguage(lang);
    setShowLangMenu(false);
  }

  /* ── Shared icon button ─────────────────────────────────────── */
  const iconBtn = "p-1.5 text-foreground/60 hover:text-foreground transition-colors";

  return (
    <>
      <motion.nav
        className={`fixed top-10 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
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

            {/* Desktop nav links */}
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
            <div className="hidden lg:flex items-center gap-1">

              {/* Search */}
              <Link href="/search">
                <motion.div className={iconBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <Search className="w-[18px] h-[18px]" />
                </motion.div>
              </Link>

              {/* Wishlist */}
              <Link href="/account/wishlist" className="relative">
                <motion.div className={iconBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <Heart className="w-[18px] h-[18px]" />
                  <AnimatePresence>
                    {wishlistItems.length > 0 && (
                      <motion.span
                        key={wishlistItems.length}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-medium"
                      >
                        {wishlistItems.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Account */}
              <Link href="/account">
                <motion.div className={iconBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <User className="w-[18px] h-[18px]" />
                </motion.div>
              </Link>

              {/* ── Language toggle ────────────────────────────────── */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowLangMenu(v => !v)}
                  className={`${iconBtn} flex items-center gap-1`}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  title="Switch language"
                >
                  <Globe className="w-[17px] h-[17px]" />
                  <span className="text-[10px] tracking-widest font-medium uppercase">
                    {currentLang}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      onMouseLeave={() => setShowLangMenu(false)}
                      className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-lg overflow-hidden min-w-[120px]"
                    >
                      {(["en", "ar"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLangSwitch(lang)}
                          className={`w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-2.5 transition-colors hover:bg-muted ${
                            currentLang === lang ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-base">{lang === "en" ? "🇺🇸" : "🇸🇦"}</span>
                          {lang === "en" ? "English" : "العربية"}
                          {currentLang === lang && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Theme toggle ──────────────────────────────────── */}
              <motion.button
                onClick={toggleTheme}
                className={iconBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.25 }}
                  >
                    {theme === "dark"
                      ? <Sun className="w-[18px] h-[18px]" />
                      : <Moon className="w-[18px] h-[18px]" />
                    }
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Admin */}
              <Link href="/admin" title="Admin Panel">
                <motion.div className={`${iconBtn} !text-foreground/25 hover:!text-foreground/50`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <LayoutDashboard className="w-4 h-4" />
                </motion.div>
              </Link>

              {/* Cart */}
              <motion.button
                onClick={openCart}
                className={`relative ${iconBtn}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
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
            <div className="flex lg:hidden items-center gap-2">
              {/* Theme toggle mobile */}
              <motion.button onClick={toggleTheme} className={iconBtn} whileTap={{ scale: 0.92 }}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              <motion.button onClick={openCart} className={`relative ${iconBtn}`} whileTap={{ scale: 0.92 }}>
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </motion.button>

              <motion.button onClick={() => setIsMobileOpen(!isMobileOpen)} className={iconBtn} whileTap={{ scale: 0.92 }}>
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

              {/* Language switch mobile */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, ease: luxury, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                {(["en", "ar"] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLangSwitch(lang)}
                    className={`px-4 py-2 text-sm border rounded-full transition-all ${
                      currentLang === lang
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {lang === "en" ? "English" : "العربية"}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, ease: luxury, duration: 0.5 }}
                className="flex items-center gap-8"
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
