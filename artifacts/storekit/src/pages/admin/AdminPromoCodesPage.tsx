import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PromoCode {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`/api${path}`, { credentials: "include", ...opts });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

function usePromoCodes() {
  return useQuery<PromoCode[]>({ queryKey: ["admin-promo-codes"], queryFn: () => apiFetch("/admin/promo-codes") });
}

export default function AdminPromoCodesPage() {
  useAdminGuard();
  const { data: codes = [], isLoading } = usePromoCodes();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    code: "", discountType: "percent" as "percent" | "fixed",
    discountValue: "", minOrderCents: "", maxUses: "", expiresAt: "",
  });

  const create = useMutation({
    mutationFn: (data: typeof form) => apiFetch("/admin/promo-codes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }); setOpen(false); toast({ title: "Promo code created" }); },
    onError: () => toast({ title: "Failed to create code", variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/admin/promo-codes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/promo-codes/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }); toast({ title: "Promo code deleted" }); },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.discountValue) return;
    create.mutate(form);
  }

  function discountLabel(c: PromoCode) {
    return c.discountType === "percent" ? `${c.discountValue}% off` : `$${(c.discountValue / 100).toFixed(2)} off`;
  }

  const active = codes.filter((c) => c.isActive).length;

  return (
    <AdminLayout title="Promo Codes" subtitle="Create and manage discount codes for your store">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Codes", value: codes.length },
          { label: "Active", value: active },
          { label: "Total Uses", value: codes.reduce((s, c) => s + (c.usedCount ?? 0), 0) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-light mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium">All Codes</h2>
        <button
          onClick={() => { setForm({ code: "", discountType: "percent", discountValue: "", minOrderCents: "", maxUses: "", expiresAt: "" }); setOpen(true); }}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-foreground/85 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Code
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No promo codes yet</p>
            <button onClick={() => setOpen(true)} className="mt-4 text-xs underline text-muted-foreground hover:text-foreground">Create your first code</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-normal px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {codes.map((c) => (
                  <motion.tr
                    key={c.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <code className="bg-muted px-2 py-1 text-xs font-mono tracking-widest">{c.code}</code>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-accent">{discountLabel(c)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {c.minOrderCents ? `$${(c.minOrderCents / 100).toFixed(0)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggle.mutate({ id: c.id, isActive: !c.isActive })} className="flex items-center gap-1.5 text-xs">
                        {c.isActive
                          ? <ToggleRight className="w-4 h-4 text-green-500" />
                          : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        <span className={c.isActive ? "text-green-600" : "text-muted-foreground"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => remove.mutate(c.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base font-medium tracking-wide">New Promo Code</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="font-mono tracking-widest uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Discount Type</Label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "percent" | "fixed" }))}
                  className="w-full border border-input bg-background rounded-md px-3 h-9 text-sm"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">
                  {form.discountType === "percent" ? "Percent off *" : "Amount off (cents) *"}
                </Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === "percent" ? "15" : "1000"}
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Min Order (cents)</Label>
                <Input type="number" value={form.minOrderCents} onChange={(e) => setForm((f) => ({ ...f, minOrderCents: e.target.value }))} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Max Uses</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Expiry Date</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={create.isPending} className="flex-1 bg-foreground text-background py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-foreground/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Code
              </button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-border py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-muted transition-colors">Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
