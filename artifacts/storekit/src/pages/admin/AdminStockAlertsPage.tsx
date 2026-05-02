import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, Send, Loader2, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StockAlert {
  id: string;
  variantId: string;
  productId: string;
  email: string;
  userId: string | null;
  isNotified: boolean;
  notifiedAt: string | null;
  createdAt: string;
  variantSize: string | null;
  variantColor: string | null;
  variantStock: number | null;
  productName: string | null;
  productSlug: string | null;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`/api${path}`, { credentials: "include", ...opts });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

type GroupedAlerts = Record<string, { variantId: string; productName: string; size: string; color: string; stock: number; alerts: StockAlert[] }>;

export default function AdminStockAlertsPage() {
  useAdminGuard();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const { data: alerts = [], isLoading } = useQuery<StockAlert[]>({
    queryKey: ["admin-stock-alerts"],
    queryFn: () => apiFetch("/admin/stock-alerts"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/stock-alerts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stock-alerts"] }),
  });

  async function handleNotify(variantId: string) {
    setNotifyingId(variantId);
    try {
      const data = await apiFetch(`/admin/stock-alerts/notify/${variantId}`, { method: "POST" });
      qc.invalidateQueries({ queryKey: ["admin-stock-alerts"] });
      toast({ title: `${data.sent} email${data.sent !== 1 ? "s" : ""} sent successfully` });
    } catch {
      toast({ title: "Failed to send notifications", variant: "destructive" });
    } finally {
      setNotifyingId(null);
    }
  }

  // Group alerts by variantId
  const grouped: GroupedAlerts = {};
  for (const a of alerts) {
    if (!grouped[a.variantId]) {
      grouped[a.variantId] = {
        variantId: a.variantId,
        productName: a.productName ?? "Unknown",
        size: a.variantSize ?? "?",
        color: a.variantColor ?? "?",
        stock: a.variantStock ?? 0,
        alerts: [],
      };
    }
    grouped[a.variantId].alerts.push(a);
  }

  const totalPending = alerts.filter((a) => !a.isNotified).length;
  const totalNotified = alerts.filter((a) => a.isNotified).length;
  const uniqueVariants = Object.keys(grouped).length;

  return (
    <AdminLayout title="Stock Alerts" subtitle="Back-in-stock notification subscribers">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Subscribers", value: alerts.length },
          { label: "Pending Alerts", value: totalPending },
          { label: "Variants Watched", value: uniqueVariants },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-light mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white border border-border rounded-xl text-center py-20">
          <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No stock alert subscribers yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Customers will see a "Notify Me" button on out-of-stock products</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(grouped).map((group) => {
            const pending = group.alerts.filter((a) => !a.isNotified);
            const isInStock = group.stock > 0;
            const isSending = notifyingId === group.variantId;

            return (
              <motion.div
                key={group.variantId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{group.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.size} / {group.color}
                        <span className={`ml-2 ${isInStock ? "text-green-600" : "text-red-500"}`}>
                          · {isInStock ? `${group.stock} in stock` : "Out of stock"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {group.alerts.length} subscriber{group.alerts.length !== 1 ? "s" : ""}
                      {pending.length > 0 && (
                        <span className="ml-1 text-orange-500 font-medium">({pending.length} pending)</span>
                      )}
                    </span>
                    {pending.length > 0 && (
                      <button
                        onClick={() => handleNotify(group.variantId)}
                        disabled={isSending}
                        className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase rounded-sm hover:bg-foreground/85 transition-colors disabled:opacity-50"
                      >
                        {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {isSending ? "Sending..." : "Send Alerts"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subscriber list */}
                <div className="divide-y divide-border/30">
                  <AnimatePresence initial={false}>
                    {group.alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.isNotified ? "bg-green-400" : "bg-orange-400"}`} />
                          <p className="text-sm font-medium">{alert.email}</p>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/50">
                            {alert.isNotified ? `Notified ${new Date(alert.notifiedAt!).toLocaleDateString()}` : `Waiting since ${new Date(alert.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>
                        <button
                          onClick={() => remove.mutate(alert.id)}
                          className="text-muted-foreground/30 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
