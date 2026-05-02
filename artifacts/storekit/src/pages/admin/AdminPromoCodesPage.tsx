import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  discountType: "percent" as "percent" | "fixed",
  discountValue: "",
  minOrderDollars: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  }
  return { copy, copied };
}

export default function AdminPromoCodesPage() {
  useAdminGuard();
  const { toast } = useToast();
  const { copy, copied } = useCopy();

  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (loaded) return;
    try {
      const res = await fetch("/api/admin/promo-codes", { credentials: "include" });
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }

  if (!loaded) { load(); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast({ title: "Fill in code and discount value", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountType === "percent"
          ? parseInt(form.discountValue, 10)
          : Math.round(parseFloat(form.discountValue) * 100),
        minOrderCents: form.minOrderDollars ? Math.round(parseFloat(form.minOrderDollars) * 100) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setCodes((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast({ title: `Code ${created.code} created` });
    } catch {
      toast({ title: "Failed to create promo code", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !current } : c));
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete ${code}?`)) return;
    try {
      await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE", credentials: "include" });
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast({ title: `${code} deleted` });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  function formatDiscount(c: PromoCode) {
    return c.discountType === "percent"
      ? `${c.discountValue}% off`
      : `$${(c.discountValue / 100).toFixed(2)} off`;
  }

  return (
    <AdminLayout title="Promo Codes" subtitle="Create and manage discount codes">
      <div className="space-y-6">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Codes", value: codes.length },
            { label: "Active", value: codes.filter((c) => c.isActive).length },
            { label: "Total Uses", value: codes.reduce((s, c) => s + (c.usedCount ?? 0), 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-light font-display" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Create button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.15em] uppercase hover:bg-foreground/85 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Code
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleCreate} className="bg-white border border-border rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-medium tracking-wide mb-2">Create Promo Code</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Code *</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="SUMMER20"
                      className="font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Discount Type *</Label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "percent" | "fixed" }))}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">
                      {form.discountType === "percent" ? "Discount % *" : "Discount Amount ($) *"}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={form.discountType === "percent" ? "100" : undefined}
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      placeholder={form.discountType === "percent" ? "20" : "15.00"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Min Order ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minOrderDollars}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderDollars: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Max Uses (blank = unlimited)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.maxUses}
                      onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Expires At (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  Active (usable immediately)
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="bg-foreground text-background px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-50">
                    {saving ? "Creating…" : "Create Code"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Codes table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          {!loaded ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : codes.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No promo codes yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {["Code", "Discount", "Min Order", "Usage", "Expires", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {codes.map((c) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-medium text-sm bg-muted px-2 py-0.5 rounded">{c.code}</code>
                            <button onClick={() => copy(c.code)} className="text-muted-foreground hover:text-foreground transition-colors">
                              {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-accent">{formatDiscount(c)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.minOrderCents ? `$${(c.minOrderCents / 100).toFixed(0)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(c.id, c.isActive)} className="flex items-center gap-1.5 text-xs transition-colors">
                            {c.isActive
                              ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></>
                              : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground">Inactive</span></>
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(c.id, c.code)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
