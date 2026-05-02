import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, Loader2, X } from "lucide-react";
import { useUser } from "@clerk/react";
import { luxury } from "@/lib/animations";

interface NotifyMeButtonProps {
  variantId: string;
  productId: string;
  variantLabel: string;
}

export default function NotifyMeButton({ variantId, productId, variantLabel }: NotifyMeButtonProps) {
  const { user, isSignedIn } = useUser();
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          productId,
          email: email.trim(),
          userId: user?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubscribed(true);
        setShowInput(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3"
      >
        <Check className="w-4 h-4 flex-shrink-0" />
        <span>
          We'll email <strong className="font-medium">{email}</strong> when this is back in stock.
        </span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {!showInput ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
                setEmail(user.primaryEmailAddress.emailAddress);
              }
              setShowInput(true);
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2.5 border border-dashed border-foreground/30 hover:border-foreground/60 text-foreground/70 hover:text-foreground py-3.5 text-[11px] tracking-[0.18em] uppercase transition-all duration-200 group"
          >
            <Bell className="w-3.5 h-3.5 group-hover:animate-wiggle" />
            Notify Me When Available
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: luxury }}
            className="overflow-hidden"
          >
            <div className="border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.1em] uppercase">Back-in-Stock Alert</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{variantLabel}</p>
                </div>
                <button onClick={() => { setShowInput(false); setError(""); }} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder="your@email.com"
                  autoFocus
                  className="flex-1 border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50 transition-colors"
                />
                <motion.button
                  onClick={handleSubscribe}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-foreground text-background px-5 py-2 text-xs tracking-[0.12em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                  Alert Me
                </motion.button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-[10px] text-muted-foreground">
                One email only. No spam. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
