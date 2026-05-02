import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`/api${path}`, { credentials: "include", ...opts });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-[hsl(38,72%,55%)] text-[hsl(38,72%,55%)]" : "text-border fill-transparent"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  useAdminGuard();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: () => apiFetch("/admin/reviews"),
  });

  const toggleApproval = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      apiFetch(`/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast({ title: "Review deleted" }); },
  });

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.isApproved;
    if (filter === "pending") return !r.isApproved;
    return true;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <AdminLayout title="Reviews" subtitle="Manage customer product reviews">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Reviews", value: reviews.length },
          { label: "Approved", value: reviews.filter((r) => r.isApproved).length },
          { label: "Pending", value: reviews.filter((r) => !r.isApproved).length },
          { label: "Avg Rating", value: avgRating },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-light mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-muted/40 p-1 rounded-lg w-fit">
        {(["all", "approved", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs tracking-[0.1em] uppercase rounded-md transition-all ${
              filter === f ? "bg-white shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reviews {filter !== "all" ? `(${filter})` : "yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence initial={false}>
              {filtered.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <p className="font-medium text-sm">{review.authorName}</p>
                        <StarDisplay rating={review.rating} />
                        <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${
                          review.isApproved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                        }`}>
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            Verified
                          </span>
                        )}
                      </div>
                      {review.title && <p className="text-sm font-medium mb-0.5">{review.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.body}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1.5">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleApproval.mutate({ id: review.id, isApproved: !review.isApproved })}
                        title={review.isApproved ? "Hide review" : "Approve review"}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {review.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => remove.mutate(review.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-muted-foreground/40 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
