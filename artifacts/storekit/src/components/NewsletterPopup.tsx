import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { luxury } from "@/lib/animations";

const STORAGE_KEY = "sk-newsletter-dismissed";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 6000;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ts = parseInt(raw, 10);
      if (Date.now() - ts < DISMISS_DAYS * 86_400_000) return;
    }
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setTimeout(() => setVisible(false), 2500);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ duration: 0.5, ease: luxury }}
            className="fixed inset-x-4 bottom-6 sm:inset-auto sm:bottom-8 sm:right-8 sm:left-auto sm:w-[420px] z-[61] bg-background border border-border shadow-2xl overflow-hidden"
          >
            {/* Image strip */}
            <div className="relative h-32 bg-foreground overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/60" />
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 bg-background/20 hover:bg-background/40 text-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {!submitted ? (
                <>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Exclusive Access</p>
                  <h3
                    className="font-display text-3xl font-light mb-2 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    15% Off Your First Order
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Subscribe for early access to new collections, exclusive offers, and editorial updates.
                  </p>
                  <form onSubmit={handleSubmit} className="flex gap-0">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 border border-border border-r-0 px-4 py-3 text-sm bg-background focus:outline-none focus:border-foreground/50 transition-colors"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-foreground text-background px-4 py-3 flex items-center"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>
                  <button
                    onClick={dismiss}
                    className="mt-3 w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    No thanks, I'll pay full price
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-4"
                >
                  <div className="w-12 h-12 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent text-xl">✓</span>
                  </div>
                  <h3 className="font-display text-2xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    Welcome to the circle.
                  </h3>
                  <p className="text-sm text-muted-foreground">Your 15% discount code is on its way.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
