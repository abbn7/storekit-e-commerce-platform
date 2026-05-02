import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { luxury } from "@/lib/animations";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.3, ease: luxury }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-foreground text-background flex items-center justify-center shadow-lg hover:bg-foreground/85 transition-colors"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
