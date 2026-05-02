import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-lg"
        >
          {/* Large 404 */}
          <div className="overflow-hidden mb-6">
            <motion.p
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="font-accent text-[140px] leading-none tracking-wider text-foreground/8 select-none"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              404
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-5">Page Not Found</p>
            <h1
              className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Lost in the collection?
            </h1>
            <p className="text-muted-foreground text-base mb-10 max-w-sm mx-auto leading-relaxed">
              The page you're looking for has moved or doesn't exist. Let us guide you back.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ x: -3 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-sm tracking-[0.12em] uppercase border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </motion.button>
              </Link>
              <Link href="/collections">
                <button className="bg-foreground text-background text-sm tracking-[0.12em] uppercase px-6 py-3 hover:bg-foreground/85 transition-colors duration-300">
                  Shop Collections
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
