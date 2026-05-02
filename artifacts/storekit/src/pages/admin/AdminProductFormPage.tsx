import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetProduct, useAdminCreateProduct, useAdminUpdateProduct, useAdminListCollections } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Variant { size: string; color: string; colorHex: string; sku: string; stock: number; price: number; compareAtPrice?: number; }
interface ImageField { url: string; alt: string; isPrimary: boolean; sortOrder: number; }

export default function AdminProductFormPage() {
  useAdminGuard();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: existing } = useAdminGetProduct(id ?? "", { query: { enabled: isEdit } });
  const { data: collectionsData } = useAdminListCollections();
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<ImageField[]>([{ url: "", alt: "", isPrimary: true, sortOrder: 0 }]);
  const [variants, setVariants] = useState<Variant[]>([{ size: "S", color: "Black", colorHex: "#1a1a1a", sku: "", stock: 10, price: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setSlug(existing.slug ?? "");
      setDescription(existing.description ?? "");
      setShortDescription(existing.shortDescription ?? "");
      setBasePrice(existing.basePrice ? String(existing.basePrice / 100) : "");
      setCompareAtPrice(existing.compareAtPrice ? String(existing.compareAtPrice / 100) : "");
      setStatus(existing.status ?? "draft");
      setIsFeatured(existing.isFeatured ?? false);
      setIsNewArrival(existing.isNewArrival ?? false);
      setMaterial(existing.material ?? "");
      setCareInstructions(existing.careInstructions ?? "");
      setCollectionIds(existing.collectionIds ?? []);
      setTags((existing.tags ?? []).join(", "));
      if (existing.images?.length) setImages(existing.images.map((img: any) => ({ url: img.url, alt: img.alt ?? "", isPrimary: img.isPrimary ?? false, sortOrder: img.sortOrder ?? 0 })));
      if (existing.variants?.length) setVariants(existing.variants.map((v: any) => ({ size: v.size, color: v.color, colorHex: v.colorHex ?? "#000", sku: v.sku, stock: v.stock ?? 0, price: v.price / 100, compareAtPrice: v.compareAtPrice ? v.compareAtPrice / 100 : undefined })));
    }
  }, [existing]);

  function autoSlug(n: string) {
    if (!isEdit) setSlug(n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name, slug, description, shortDescription,
      basePrice: Math.round(parseFloat(basePrice) * 100),
      compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined,
      status, isFeatured, isNewArrival, material, careInstructions,
      collectionIds,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      images: images.filter(i => i.url),
      variants: variants.map(v => ({ ...v, price: Math.round(v.price * 100), compareAtPrice: v.compareAtPrice ? Math.round(v.compareAtPrice * 100) : undefined })),
    };
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id, data: payload });
        toast({ title: "Product updated" });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: "Product created" });
        setLocation("/admin/products");
      }
    } catch (err) {
      toast({ title: "Error saving product", variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <AdminLayout title={isEdit ? "Edit Product" : "New Product"}>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-10">
        {/* Basic Info */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Name *</Label>
              <Input value={name} onChange={e => { setName(e.target.value); autoSlug(e.target.value); }} required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Slug *</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Short Description</Label>
              <Input value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Price ($) *</Label>
              <Input type="number" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Compare At Price ($)</Label>
              <Input type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm bg-background">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="wool, coat, outerwear" />
            </div>
            <div className="flex items-center gap-6 col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="rounded" />
                New Arrival
              </label>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Collections</h2>
          <div className="flex flex-wrap gap-2">
            {(collectionsData ?? []).map((col: any) => (
              <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer border border-border px-3 py-1.5 hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={collectionIds.includes(col.id)}
                  onChange={e => setCollectionIds(ids => e.target.checked ? [...ids, col.id] : ids.filter(i => i !== col.id))}
                />
                {col.name}
              </label>
            ))}
          </div>
        </section>

        {/* Images */}
        <section className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide">Images</h2>
            <button type="button" onClick={() => setImages(imgs => [...imgs, { url: "", alt: "", isPrimary: false, sortOrder: imgs.length }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>
          {images.map((img, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2 space-y-1.5">
                <Label>Image URL</Label>
                <Input value={img.url} onChange={e => setImages(imgs => imgs.map((im, idx) => idx === i ? { ...im, url: e.target.value } : im))} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Alt Text</Label>
                <Input value={img.alt} onChange={e => setImages(imgs => imgs.map((im, idx) => idx === i ? { ...im, alt: e.target.value } : im))} />
              </div>
              {i > 0 && (
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 col-span-3">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Variants */}
        <section className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide">Variants</h2>
            <button type="button" onClick={() => setVariants(vs => [...vs, { size: "M", color: "Black", colorHex: "#1a1a1a", sku: "", stock: 10, price: 0 }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Plus className="w-4 h-4" /> Add Variant
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">{["Size", "Color", "Hex", "SKU", "Stock", "Price ($)", ""].map(h => <th key={h} className="text-left text-xs text-muted-foreground pb-2 pr-2">{h}</th>)}</tr></thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-b border-border">
                    {[
                      <Input key="size" value={v.size} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, size: e.target.value } : vv))} className="h-8 text-xs" />,
                      <Input key="color" value={v.color} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, color: e.target.value } : vv))} className="h-8 text-xs" />,
                      <input key="hex" type="color" value={v.colorHex} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, colorHex: e.target.value } : vv))} className="w-8 h-8 border border-border cursor-pointer rounded" />,
                      <Input key="sku" value={v.sku} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, sku: e.target.value } : vv))} className="h-8 text-xs" />,
                      <Input key="stock" type="number" value={v.stock} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))} className="h-8 text-xs w-20" />,
                      <Input key="price" type="number" step="0.01" value={v.price} onChange={e => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, price: parseFloat(e.target.value) || 0 } : vv))} className="h-8 text-xs w-24" />,
                    ].map((cell, j) => <td key={j} className="py-2 pr-2">{cell}</td>)}
                    <td className="py-2">
                      {variants.length > 1 && (
                        <button type="button" onClick={() => setVariants(vs => vs.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Materials */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Materials & Care</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Material</Label>
              <Input value={material} onChange={e => setMaterial(e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Care Instructions</Label>
              <Input value={careInstructions} onChange={e => setCareInstructions(e.target.value)} />
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => setLocation("/admin/products")} className="px-8 py-3 border border-border text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
