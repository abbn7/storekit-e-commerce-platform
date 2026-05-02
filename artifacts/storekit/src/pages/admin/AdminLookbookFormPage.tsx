import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadButton from "@/components/admin/ImageUploadButton";
import { X, Plus, MousePointer, Tag } from "lucide-react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductOption { id: string; slug: string; name: string; basePrice: number; images?: { url: string }[]; }
interface LookbookTag { id: string; xPct: number; yPct: number; productId: string; product?: ProductOption | null; }

async function adminFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`/api/admin/lookbook${path}`, {
    ...opts,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface PendingPin { xPct: number; yPct: number; }

export default function AdminLookbookFormPage() {
  useAdminGuard();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const imgRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [season, setSeason] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tag builder state
  const [tags, setTags] = useState<LookbookTag[]>([]);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isTagMode, setIsTagMode] = useState(false);
  const [addingTag, setAddingTag] = useState(false);

  // Load existing entry
  const { data: existing } = useQuery({
    queryKey: ["admin-lookbook-entry", id],
    queryFn: () => adminFetch(`/${id}`),
    enabled: isEdit,
  });

  // Load all products for tag selector
  const { data: productsData } = useQuery<{ products: ProductOption[] }>({
    queryKey: ["admin-products-simple"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      return res.json();
    },
  });
  const products = (productsData as any)?.products ?? (Array.isArray(productsData) ? productsData : []);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? "");
      setSlug(existing.slug ?? "");
      setSubtitle(existing.subtitle ?? "");
      setImageUrl(existing.imageUrl ?? "");
      setSeason(existing.season ?? "");
      setSortOrder(String(existing.sortOrder ?? 0));
      setIsActive(existing.isActive ?? true);
      setTags(existing.tags ?? []);
    }
  }, [existing]);

  function makeSlug(s: string) {
    return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) { toast({ title: "Please add an editorial image", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { title, slug, subtitle, imageUrl, season, sortOrder: parseInt(sortOrder), isActive };
    try {
      if (isEdit) {
        await adminFetch(`/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Entry updated" });
        qc.invalidateQueries({ queryKey: ["admin-lookbook"] });
        qc.invalidateQueries({ queryKey: ["admin-lookbook-entry", id] });
      } else {
        const created = await adminFetch("/", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Entry created" });
        qc.invalidateQueries({ queryKey: ["admin-lookbook"] });
        setLocation(`/admin/lookbook/${created.id}/edit`);
      }
    } catch (err: any) {
      toast({ title: "Error saving entry", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  // Click on image to place pin
  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isTagMode || !imageUrl) return;
    const rect = imgRef.current!.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ xPct, yPct });
    setSelectedProductId("");
  }

  async function handleAddTag() {
    if (!pendingPin || !selectedProductId || !id) return;
    setAddingTag(true);
    try {
      const tag = await adminFetch(`/${id}/tags`, {
        method: "POST",
        body: JSON.stringify({ productId: selectedProductId, xPct: pendingPin.xPct, yPct: pendingPin.yPct }),
      });
      const product = products.find((p: ProductOption) => p.id === selectedProductId) ?? null;
      setTags(prev => [...prev, { ...tag, product }]);
      setPendingPin(null);
      setSelectedProductId("");
      toast({ title: "Tag added" });
    } catch {
      toast({ title: "Failed to add tag", variant: "destructive" });
    }
    setAddingTag(false);
  }

  async function handleRemoveTag(tagId: string) {
    if (!id) return;
    try {
      await adminFetch(`/${id}/tags/${tagId}`, { method: "DELETE" });
      setTags(prev => prev.filter(t => t.id !== tagId));
    } catch {
      toast({ title: "Failed to remove tag", variant: "destructive" });
    }
  }

  const isLeft = (pct: number) => pct > 60;

  return (
    <AdminLayout title={isEdit ? "Edit Lookbook Entry" : "New Lookbook Entry"} subtitle={isEdit ? "Update editorial details and manage product tags" : "Create a new editorial entry"}>
      <div className="max-w-5xl space-y-8">

        {/* ── Details form ───────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-5">
          <h2 className="text-sm font-medium tracking-wide">Entry Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={e => { setTitle(e.target.value); if (!isEdit) setSlug(makeSlug(e.target.value)); }} required />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Subtitle</Label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Spring/Summer 2025 Editorial" />
            </div>
            <div className="space-y-1.5">
              <Label>Season</Label>
              <Input value={season} onChange={e => setSeason(e.target.value)} placeholder="SS25, AW24, Resort…" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="isActive" className="text-sm cursor-pointer">Active (visible in store)</label>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-3">
            <Label>Editorial Image *</Label>
            {imageUrl && (
              <div className="relative w-40 h-52 border border-border overflow-hidden group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute top-1.5 right-1.5 bg-foreground/80 text-background w-5 h-5 flex items-center justify-center hover:bg-foreground text-xs">×</button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Paste a URL or upload from device</p>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
            <ImageUploadButton label="Upload editorial image" onSuccess={url => setImageUrl(url)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-foreground text-background px-8 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Update Entry" : "Create Entry"}
            </button>
            <button type="button" onClick={() => setLocation("/admin/lookbook")} className="px-8 py-2.5 border border-border text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </form>

        {/* ── Tag Builder (only available after create) ─── */}
        {isEdit && (
          <div className="bg-card border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium tracking-wide flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Product Tags
                  {tags.length > 0 && <span className="text-xs text-muted-foreground font-normal">({tags.length} tags)</span>}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Enable tag mode, then click on the image to place a shoppable pin.</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsTagMode(t => !t); setPendingPin(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-xs tracking-[0.1em] uppercase border transition-colors ${isTagMode ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                {isTagMode ? "Done Tagging" : "Tag Products"}
              </button>
            </div>

            {imageUrl ? (
              <div
                ref={imgRef}
                onClick={handleImageClick}
                className={`relative overflow-hidden bg-muted select-none ${isTagMode ? "cursor-crosshair ring-2 ring-accent ring-offset-2" : "cursor-default"}`}
                style={{ aspectRatio: "16/9", maxHeight: "480px" }}
              >
                <img src={imageUrl} alt="Editorial" className="w-full h-full object-cover pointer-events-none" />

                {/* Tag mode hint */}
                {isTagMode && (
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur-sm">
                    Click anywhere to place a product pin
                  </div>
                )}

                {/* Existing tags */}
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className="absolute group/tag"
                    style={{ left: `${tag.xPct}%`, top: `${tag.yPct}%`, transform: "translate(-50%, -50%)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Pin dot */}
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-foreground shadow-lg flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-foreground" />
                    </div>

                    {/* Tooltip */}
                    <div className={`absolute z-20 bottom-full mb-2 hidden group-hover/tag:flex flex-col bg-background border border-border shadow-xl p-2 w-44 ${isLeft(tag.xPct) ? "right-0" : "left-0"}`}>
                      {tag.product && (
                        <div className="flex gap-2 items-start">
                          {tag.product.images?.[0]?.url && (
                            <img src={getProductImage(tag.product.images[0].url, tag.product.id)} alt="" className="w-10 h-12 object-cover flex-shrink-0 bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium leading-tight line-clamp-2">{tag.product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(tag.product.basePrice)}</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-destructive hover:underline"
                      >
                        <X className="w-3 h-3" /> Remove tag
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pending pin */}
                {pendingPin && (
                  <div
                    className="absolute z-30"
                    style={{ left: `${pendingPin.xPct}%`, top: `${pendingPin.yPct}%`, transform: "translate(-50%, -50%)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute z-30 bottom-full mb-2 bg-background border border-border shadow-2xl p-3 w-56 space-y-2 ${isLeft(pendingPin.xPct) ? "right-0" : "left-0"}`}
                    >
                      <p className="text-xs font-medium">Select a product</p>
                      <select
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                        className="w-full text-xs border border-border px-2 py-1.5 bg-background focus:outline-none focus:border-foreground"
                        autoFocus
                      >
                        <option value="">— Choose product —</option>
                        {products.map((p: ProductOption) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddTag}
                          disabled={!selectedProductId || addingTag}
                          className="flex-1 flex items-center justify-center gap-1 text-[10px] tracking-wide uppercase bg-foreground text-background py-1.5 hover:bg-foreground/80 disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          {addingTag ? "Adding…" : "Add Tag"}
                        </button>
                        <button
                          onClick={() => setPendingPin(null)}
                          className="flex-1 text-[10px] tracking-wide uppercase border border-border py-1.5 hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>

                    {/* Pulsing dot */}
                    <div className="w-6 h-6 rounded-full bg-accent border-2 border-white shadow-lg flex items-center justify-center relative">
                      <motion.div animate={{ scale: [1, 1.8], opacity: [0.6, 0] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 rounded-full bg-accent" />
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 border border-dashed border-border text-muted-foreground text-sm">
                Add an editorial image above first
              </div>
            )}

            {/* Tags list */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tagged Products</p>
                <div className="divide-y divide-border border border-border">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {tag.xPct.toFixed(0)}%, {tag.yPct.toFixed(0)}%
                        </span>
                        <span className="font-medium">{tag.product?.name ?? "Unknown product"}</span>
                        {tag.product && <span className="text-muted-foreground">{formatPrice(tag.product.basePrice)}</span>}
                      </div>
                      <button onClick={() => handleRemoveTag(tag.id)} className="p-1 hover:bg-destructive/10 rounded hover:text-destructive text-muted-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isEdit && (
          <p className="text-xs text-muted-foreground bg-muted/40 border border-border px-4 py-3">
            Save the entry first, then you can tag products by clicking on the editorial image.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
