import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminListCollections, useAdminCreateCollection, useAdminUpdateCollection } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadButton from "@/components/admin/ImageUploadButton";

export default function AdminCollectionFormPage() {
  useAdminGuard();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: collections } = useAdminListCollections();
  const existing = (collections ?? []).find((c: any) => c.id === id);

  const createCollection = useAdminCreateCollection();
  const updateCollection = useAdminUpdateCollection();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setSlug(existing.slug ?? "");
      setDescription(existing.description ?? "");
      setImageUrl(existing.imageUrl ?? "");
      setIsFeatured(existing.isFeatured ?? false);
      setSortOrder(String(existing.sortOrder ?? 0));
    }
  }, [existing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { name, slug, description, imageUrl, isFeatured, sortOrder: parseInt(sortOrder) };
    try {
      if (isEdit) {
        await updateCollection.mutateAsync({ id, data: payload });
        toast({ title: "Collection updated" });
      } else {
        await createCollection.mutateAsync({ data: payload });
        toast({ title: "Collection created" });
        setLocation("/admin/collections");
      }
    } catch {
      toast({ title: "Error saving collection", variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <AdminLayout title={isEdit ? "Edit Collection" : "New Collection"}>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Collection Details</h2>

          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={e => { setName(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} required />
          </div>

          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Image section */}
          <div className="space-y-3">
            <Label>Collection Image</Label>

            {/* Preview */}
            {imageUrl && (
              <div className="relative w-40 h-52 border border-border overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-1.5 right-1.5 bg-foreground/80 text-background w-5 h-5 text-xs flex items-center justify-center hover:bg-foreground transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {/* URL input */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Paste a URL or upload from your device</p>
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="text-sm"
              />
            </div>

            {/* Upload button */}
            <ImageUploadButton
              label="Upload from device"
              onSuccess={(url) => setImageUrl(url)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                Featured on homepage
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Collection" : "Create Collection"}
          </button>
          <button type="button" onClick={() => setLocation("/admin/collections")} className="px-8 py-3 border border-border text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
