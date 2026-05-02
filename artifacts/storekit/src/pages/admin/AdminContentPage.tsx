import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import {
  useAdminListTestimonials, useAdminCreateTestimonial, useAdminUpdateTestimonial, useAdminDeleteTestimonial,
  useAdminListBanners, useAdminCreateBanner, useAdminUpdateBanner, useAdminDeleteBanner,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminContentPage() {
  useAdminGuard();
  return (
    <AdminLayout title="Content">
      <Tabs defaultValue="testimonials">
        <TabsList className="mb-6">
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>
        <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        <TabsContent value="banners"><BannersTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function TestimonialsTab() {
  const { toast } = useToast();
  const { data: items, refetch } = useAdminListTestimonials();
  const createTestimonial = useAdminCreateTestimonial();
  const updateTestimonial = useAdminUpdateTestimonial();
  const deleteTestimonial = useAdminDeleteTestimonial();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ authorName: "", authorLocation: "", text: "", rating: "5", isVisible: true });

  function openNew() { setEditing(null); setForm({ authorName: "", authorLocation: "", text: "", rating: "5", isVisible: true }); setOpen(true); }
  function openEdit(t: any) { setEditing(t); setForm({ authorName: t.authorName, authorLocation: t.authorLocation, text: t.text, rating: String(t.rating), isVisible: t.isVisible }); setOpen(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, rating: parseInt(form.rating) };
    if (editing) {
      await updateTestimonial.mutateAsync({ id: editing.id, data });
      toast({ title: "Updated" });
    } else {
      await createTestimonial.mutateAsync({ data });
      toast({ title: "Created" });
    }
    setOpen(false); refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial.mutateAsync({ id });
    toast({ title: "Deleted" }); refetch();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.1em] uppercase hover:bg-foreground/80">
          <Plus className="w-4 h-4" /> New Testimonial
        </button>
      </div>
      <div className="space-y-3">
        {(items ?? []).map((t: any) => (
          <div key={t.id} className="bg-card border border-border p-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}</div>
              <p className="text-sm italic text-muted-foreground mb-2">&ldquo;{t.text}&rdquo;</p>
              <p className="text-xs font-medium">{t.authorName} · {t.authorLocation}</p>
              <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full ${t.isVisible ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {t.isVisible ? "Visible" : "Hidden"}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Author Name</Label><Input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.authorLocation} onChange={e => setForm(f => ({ ...f, authorLocation: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Review</Label><Textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
              <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} />Visible</label></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-foreground text-background py-2 text-xs tracking-[0.15em] uppercase">Save</button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-border py-2 text-xs tracking-[0.15em] uppercase">Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BannersTab() {
  const { toast } = useToast();
  const { data: items, refetch } = useAdminListBanners();
  const createBanner = useAdminCreateBanner();
  const updateBanner = useAdminUpdateBanner();
  const deleteBanner = useAdminDeleteBanner();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ imageUrl: "", heading: "", subheading: "", ctaText: "", ctaUrl: "", isActive: true });

  function openNew() { setEditing(null); setForm({ imageUrl: "", heading: "", subheading: "", ctaText: "", ctaUrl: "", isActive: true }); setOpen(true); }
  function openEdit(b: any) { setEditing(b); setForm({ imageUrl: b.imageUrl, heading: b.heading, subheading: b.subheading, ctaText: b.ctaText, ctaUrl: b.ctaUrl, isActive: b.isActive }); setOpen(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { await updateBanner.mutateAsync({ id: editing.id, data: form }); toast({ title: "Updated" }); }
    else { await createBanner.mutateAsync({ data: form }); toast({ title: "Created" }); }
    setOpen(false); refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner.mutateAsync({ id }); toast({ title: "Deleted" }); refetch();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.1em] uppercase hover:bg-foreground/80">
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>
      <div className="space-y-3">
        {(items ?? []).map((b: any) => (
          <div key={b.id} className="bg-card border border-border p-5 flex items-start justify-between gap-4">
            <div className="flex gap-4 flex-1">
              {b.imageUrl && <img src={b.imageUrl} alt="" className="w-24 h-16 object-cover flex-shrink-0 border border-border" />}
              <div>
                <p className="font-medium text-sm">{b.heading}</p>
                <p className="text-xs text-muted-foreground">{b.subheading}</p>
                <p className="text-xs text-accent mt-1">{b.ctaText} → {b.ctaUrl}</p>
                <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full ${b.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Banner" : "New Banner"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5"><Label>Image URL *</Label><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Heading</Label><Input value={form.heading} onChange={e => setForm(f => ({ ...f, heading: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Subheading</Label><Input value={form.subheading} onChange={e => setForm(f => ({ ...f, subheading: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>CTA Text</Label><Input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>CTA URL</Label><Input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />Active</label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-foreground text-background py-2 text-xs tracking-[0.15em] uppercase">Save</button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-border py-2 text-xs tracking-[0.15em] uppercase">Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
