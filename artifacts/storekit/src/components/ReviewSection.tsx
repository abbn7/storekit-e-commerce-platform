import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/react";
import { luxury, staggerItem } from "@/lib/animations";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

function Stars({ rating, interactive = false, size = "sm", onRate }: {
  rating: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = (interactive ? hovered || rating : rating) >= s;
        return (
          <motion.button
            key={s}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRate?.(s)}
            onMouseEnter={() => interactive && setHovered(s)}
            onMouseLeave={() => interactive && setHovered(0)}
            whileTap={interactive ? { scale: 0.85 } : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
          >
            <Star
              className={`${sz} transition-colors duration-150 ${
                filled ? "fill-[hsl(38,72%,55%)] text-[hsl(38,72%,55%)]" : "text-border fill-transparent"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-4 text-right text-muted-foreground">{star}</span>
      <Star className="w-3 h-3 fill-[hsl(38,72%,55%)] text-[hsl(38,72%,55%)] flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[hsl(38,72%,55%)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: luxury }}
        />
      </div>
      <span className="w-7 text-muted-foreground">{pct}%</span>
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews() {
    if (loaded) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/reviews/${productId}`);
      const data = await r.json();
      setReviews(data.reviews ?? []);
      setAvgRating(data.averageRating ?? 0);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useState(() => { loadReviews(); });

  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRating) { setError("Please select a star rating."); return; }
    if (!formBody.trim()) { setError("Please write something about this product."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.id,
          authorName: user!.fullName ?? user!.username ?? "Anonymous",
          rating: formRating,
          title: formTitle,
          body: formBody,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const newReview: Review = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setAvgRating((prev) => (prev * reviews.length + formRating) / (reviews.length + 1));
      setSubmitted(true);
      setShowForm(false);
      setFormRating(0); setFormTitle(""); setFormBody("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border pt-16 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: luxury }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Customer Feedback</p>
            <h2 className="font-display text-4xl font-light" style={{ fontFamily: "var(--font-display)" }}>
              Reviews
            </h2>
          </div>
          {isSignedIn && !submitted && (
            <motion.button
              onClick={() => setShowForm((v) => !v)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 border border-foreground px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </motion.button>
          )}
          {submitted && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" /> Thank you for your review!
            </div>
          )}
        </div>

        {/* Review form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              key="review-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: luxury }}
              onSubmit={handleSubmit}
              className="bg-muted/30 border border-border p-6 mb-10 space-y-5 overflow-hidden"
            >
              <div>
                <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2">Your Rating *</p>
                <Stars rating={formRating} interactive size="lg" onRate={setFormRating} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs tracking-[0.12em] uppercase font-medium">Review Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarise your experience"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs tracking-[0.12em] uppercase font-medium">Your Review *</label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Tell others about this product..."
                  rows={4}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/50 transition-colors resize-none"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Review
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {loaded && (
          <>
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 pb-12 border-b border-border">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display text-7xl font-light leading-none" style={{ fontFamily: "var(--font-display)" }}>
                      {avgRating.toFixed(1)}
                    </p>
                    <Stars rating={Math.round(avgRating)} size="md" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {ratingCounts.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={reviews.length} />
                  ))}
                </div>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-display text-2xl font-light text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  No reviews yet
                </p>
                {isSignedIn && (
                  <p className="text-sm text-muted-foreground mt-2">Be the first to share your thoughts.</p>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    variants={staggerItem}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    custom={i}
                    className="pb-8 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-medium text-sm">{review.authorName}</p>
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-[10px] tracking-[0.1em] uppercase text-green-600 bg-green-50 px-2 py-0.5">
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <Stars rating={review.rating} size="sm" />
                    </div>
                    {review.title && (
                      <p className="font-medium text-sm mb-1.5">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
