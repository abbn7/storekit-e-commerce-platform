import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, CheckCircle2, ChevronDown, ChevronUp, Pen } from "lucide-react";
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

function Stars({ rating, size = "sm", interactive = false, onRate }: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = interactive ? (hovered || rating) >= i : rating >= i;
        const half = !interactive && rating >= i - 0.5 && rating < i;
        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => onRate?.(i)}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star
              className={`${sz} transition-colors ${filled || half ? "fill-amber-400 text-amber-400" : "fill-transparent text-border"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-3">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: luxury, delay: 0.1 * (6 - star) }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ rating: 0, title: "", body: "" });
  const [formError, setFormError] = useState("");

  async function load() {
    if (loaded) return;
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setAverageRating(data.averageRating ?? 0);
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }

  function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) load();
  }

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.rating) { setFormError("Please select a star rating"); return; }
    if (!form.body.trim()) { setFormError("Please write a review"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "guest",
          authorName: user?.fullName ?? user?.username ?? "Anonymous",
          rating: form.rating,
          title: form.title,
          body: form.body,
        }),
      });
      if (!res.ok) throw new Error();
      const review = await res.json();
      setReviews((prev) => [review, ...prev]);
      setAverageRating((prev) => {
        const newTotal = reviews.length + 1;
        return parseFloat(((prev * reviews.length + form.rating) / newTotal).toFixed(1));
      });
      setSubmitted(true);
      setShowForm(false);
      setForm({ rating: 0, title: "", body: "" });
    } catch {
      setFormError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border pt-10 mt-10">
      {/* Toggle header */}
      <button
        type="button"
        onClick={handleExpand}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium">Customer Reviews</h2>
          {loaded && (
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(averageRating)} />
              <span className="text-sm text-muted-foreground">
                {averageRating > 0 ? `${averageRating.toFixed(1)} · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}` : "No reviews yet"}
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: luxury }}
            className="overflow-hidden"
          >
            <div className="pt-8 space-y-8">
              {/* Summary + Write review */}
              {loaded && reviews.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-border">
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center gap-2 sm:w-40 flex-shrink-0">
                    <span className="font-display text-6xl font-light" style={{ fontFamily: "var(--font-display)" }}>
                      {averageRating.toFixed(1)}
                    </span>
                    <Stars rating={averageRating} size="md" />
                    <span className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 space-y-2">
                    {starCounts.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={reviews.length} />
                    ))}
                  </div>
                </div>
              )}

              {/* Write Review CTA */}
              {!submitted && (
                <div>
                  {!showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase border border-border px-4 py-2.5 hover:bg-muted transition-colors"
                    >
                      <Pen className="w-3.5 h-3.5" />
                      Write a Review
                    </button>
                  ) : (
                    <AnimatePresence>
                      <motion.form
                        key="review-form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: luxury }}
                        onSubmit={handleSubmit}
                        className="bg-muted/30 border border-border p-6 space-y-4"
                      >
                        <h3 className="text-sm font-medium tracking-wide">Share Your Experience</h3>

                        {/* Star picker */}
                        <div>
                          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Your Rating *</p>
                          <Stars rating={form.rating} size="lg" interactive onRate={(r) => setForm((f) => ({ ...f, rating: r }))} />
                        </div>

                        {/* Title */}
                        <div>
                          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-1.5">Review Title</p>
                          <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Summarise your experience"
                            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                          />
                        </div>

                        {/* Body */}
                        <div>
                          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-1.5">Review *</p>
                          <textarea
                            rows={4}
                            value={form.body}
                            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                            placeholder="What did you love? What could be improved?"
                            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                          />
                        </div>

                        {!isSignedIn && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            You'll submit as "Anonymous". Sign in to attach your name.
                          </p>
                        )}

                        {formError && <p className="text-xs text-red-500">{formError}</p>}

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-foreground text-background px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50"
                          >
                            {submitting ? "Submitting…" : "Submit Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="border border-border px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.form>
                    </AnimatePresence>
                  )}
                </div>
              )}

              {/* Success message */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Thank you! Your review has been submitted.
                </motion.div>
              )}

              {/* Review list */}
              {!loaded ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your thoughts.</p>
                </div>
              ) : (
                <motion.div className="space-y-6">
                  {reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      variants={staggerItem}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: i * 0.04 }}
                      className="pb-6 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <Stars rating={review.rating} />
                            {review.isVerifiedPurchase && (
                              <span className="flex items-center gap-1 text-[10px] text-green-700 dark:text-green-400 tracking-wide">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <p className="font-medium text-sm mt-1.5">{review.title}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      {review.body && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{review.body}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60">{review.authorName}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
