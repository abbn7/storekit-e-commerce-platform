import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import {
  useAdminListTestimonials, useAdminCreateTestimonial, useAdminUpdateTestimonial, useAdminDeleteTestimonial,
  useAdminListBanners, useAdminCreateBanner, useAdminUpdateBanner, useAdminDeleteBanner,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, MessageSquare, Image, Eye, EyeOff, Mail, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

/* ── Section card ────────────────────────────────────────────── */
function SectionWrap({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">{children}</div>;
}

export default function AdminContentPage() {
  useAdminGuard();
  return (
    <AdminLayout title="Content" subtitle="Manage testimonials, banners and page content">
      <Tabs defaultValue="testimonials">
        <TabsList className="mb-6 bg-muted/60 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger value="testimonials" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Testimonials
          </TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Image className="w-3.5 h-3.5 mr-1.5" />Banners
          </TabsTrigger>
          <TabsTrigger value="emails" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Mail className="w-3.5 h-3.5 mr-1.5" />Email Templates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        <TabsContent value="banners"><BannersTab /></TabsContent>
        <TabsContent value="emails"><EmailTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

/* ════════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════════ */
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
  function openEdit(t: any) { setEditing(t); setForm({ authorName: t.authorName, authorLocation: t.authorLocation ?? "", text: t.text, rating: String(t.rating), isVisible: t.isVisible }); setOpen(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, rating: parseInt(form.rating) };
    if (editing) { await updateTestimonial.mutateAsync({ id: editing.id, data }); toast({ title: "Updated" }); }
    else { await createTestimonial.mutateAsync({ data }); toast({ title: "Created" }); }
    setOpen(false); refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial.mutateAsync({ id }); toast({ title: "Deleted" }); refetch();
  }

  async function toggleVisibility(t: any) {
    await updateTestimonial.mutateAsync({ id: t.id, data: { isVisible: !t.isVisible } });
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{(items ?? []).length} testimonials</p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs tracking-[0.1em] uppercase rounded-sm hover:bg-foreground/85 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Testimonial
        </button>
      </div>

      <SectionWrap>
        <div className="divide-y divide-border">
          <AnimatePresence>
            {(items ?? []).length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm">No testimonials yet</div>
            )}
            {(items ?? []).map((t: any) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-4 p-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < t.rating ? "fill-[hsl(38,52%,55%)] text-[hsl(38,52%,55%)]" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground line-clamp-2 mb-1.5">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-medium">{t.authorName}
                    {t.authorLocation && <span className="text-muted-foreground font-normal"> · {t.authorLocation}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleVisibility(t)}
                    title={t.isVisible ? "Hide" : "Show"}
                    className={`p-2 rounded-lg transition-colors ${t.isVisible ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {t.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openEdit(t)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SectionWrap>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">{editing ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Author Name</Label>
                <Input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Location</Label>
                <Input value={form.authorLocation} onChange={e => setForm(f => ({ ...f, authorLocation: e.target.value }))} placeholder="New York, USA" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Review Text</Label>
              <Textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required rows={4} placeholder="The quality is extraordinary..." className="resize-none" />
            </div>
            <div className="flex items-center gap-6">
              <div className="space-y-1.5 flex-1">
                <Label className="text-[12px]">Rating</Label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, rating: String(n) }))}
                      className="p-0.5"
                    >
                      <Star className={`w-5 h-5 transition-colors ${n <= parseInt(form.rating) ? "fill-[hsl(38,52%,55%)] text-[hsl(38,52%,55%)]" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="rounded" />
                Visible
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-foreground text-background py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-foreground/85 transition-colors">Save</button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-border py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-muted transition-colors">Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BANNERS
════════════════════════════════════════════════════════════════ */
function BannersTab() {
  const { toast } = useToast();
  const { data: items, refetch } = useAdminListBanners();
  const createBanner = useAdminCreateBanner();
  const updateBanner = useAdminUpdateBanner();
  const deleteBanner = useAdminDeleteBanner();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imgErr, setImgErr] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", heading: "", subheading: "", ctaText: "", ctaUrl: "", isActive: true });

  function openNew() { setEditing(null); setForm({ imageUrl: "", heading: "", subheading: "", ctaText: "", ctaUrl: "", isActive: true }); setImgErr(false); setOpen(true); }
  function openEdit(b: any) { setEditing(b); setForm({ imageUrl: b.imageUrl, heading: b.heading ?? "", subheading: b.subheading ?? "", ctaText: b.ctaText ?? "", ctaUrl: b.ctaUrl ?? "", isActive: b.isActive }); setImgErr(false); setOpen(true); }

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

  async function toggleActive(b: any) {
    await updateBanner.mutateAsync({ id: b.id, data: { isActive: !b.isActive } }); refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{(items ?? []).length} banners</p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs tracking-[0.1em] uppercase rounded-sm hover:bg-foreground/85 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Banner
        </button>
      </div>

      <SectionWrap>
        <div className="divide-y divide-border">
          {(items ?? []).length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">No banners yet</div>
          )}
          {(items ?? []).map((b: any) => (
            <div key={b.id} className="flex items-start gap-4 p-5">
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                {b.imageUrl && <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{b.heading || <span className="text-muted-foreground italic">No heading</span>}</p>
                {b.subheading && <p className="text-xs text-muted-foreground mt-0.5">{b.subheading}</p>}
                {b.ctaText && (
                  <p className="text-xs text-[hsl(38,52%,55%)] mt-1">{b.ctaText} → {b.ctaUrl}</p>
                )}
                <span className={`text-[10px] mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${b.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-muted text-muted-foreground"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? "bg-green-500" : "bg-muted-foreground"}`} />
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleActive(b)} className="p-2 hover:bg-muted rounded-lg transition-colors" title={b.isActive ? "Deactivate" : "Activate"}>
                  {b.isActive ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-green-600" />}
                </button>
                <button onClick={() => openEdit(b)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionWrap>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">{editing ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Image URL *</Label>
              <Input value={form.imageUrl} onChange={e => { setImgErr(false); setForm(f => ({ ...f, imageUrl: e.target.value })); }} required className="font-mono text-xs" />
              <AnimatePresence>
                {form.imageUrl && !imgErr && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <img src={form.imageUrl} alt="" onError={() => setImgErr(true)} className="mt-1.5 w-full h-28 object-cover rounded-lg border border-border" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Heading</Label>
                <Input value={form.heading} onChange={e => setForm(f => ({ ...f, heading: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Subheading</Label>
                <Input value={form.subheading} onChange={e => setForm(f => ({ ...f, subheading: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">CTA Button Text</Label>
                <Input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Shop Now" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">CTA URL</Label>
                <Input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} placeholder="/collections/new" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
              Active (visible on site)
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-foreground text-background py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-foreground/85 transition-colors">Save</button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-border py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-muted transition-colors">Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
════════════════════════════════════════════════════════════════ */
function EmailTab() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Automatic Order Confirmations</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
            When a customer places an order and provides their email at checkout, a branded confirmation is sent automatically.
            In development, emails are captured by Ethereal — check the API server logs for a preview link.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Order Confirmation</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sent immediately after a successful order</p>
          </div>
          <a
            href="/api/admin/email-preview/order-confirmation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Email
          </a>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Brand header",    value: "Dark luxury header with store name" },
              { label: "Order details",   value: "Number, date, items with images" },
              { label: "Cost breakdown",  value: "Subtotal, shipping, tax, total" },
              { label: "Ship address",    value: "Full delivery address + ETA" },
            ].map(f => (
              <div key={f.label} className="bg-muted/40 rounded-lg p-3">
                <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-medium mb-1">{f.label}</p>
                <p className="text-xs text-foreground leading-snug">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <p className="text-sm font-medium">SMTP Configuration</p>
          <p className="text-xs text-muted-foreground mt-0.5">Set these environment secrets to deliver real emails</p>
        </div>
        <div className="p-5 space-y-2">
          {[
            { key: "SMTP_HOST",   ex: "smtp.sendgrid.net",               desc: "SMTP server hostname" },
            { key: "SMTP_PORT",   ex: "587",                              desc: "587 for TLS · 465 for SSL" },
            { key: "SMTP_USER",   ex: "apikey",                           desc: "SMTP username" },
            { key: "SMTP_PASS",   ex: "SG.xxxx…",                        desc: "Password or API key" },
            { key: "SMTP_FROM",   ex: '"Store" <orders@store.com>',       desc: "Sender display name + address" },
            { key: "SMTP_SECURE", ex: "false",                            desc: "true if using port 465 (SSL)" },
            { key: "STORE_URL",   ex: "https://mystore.replit.app",       desc: "Production store URL for links" },
          ].map(item => (
            <div key={item.key} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
              <code className="text-xs bg-muted px-2 py-1 font-mono flex-shrink-0 min-w-[130px]">{item.key}</code>
              <div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                <p className="text-[11px] text-foreground/40 font-mono mt-0.5">{item.ex}</p>
              </div>
            </div>
          ))}
          <p className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
            Compatible with SendGrid, Resend, Mailgun, Postmark, Gmail, or any SMTP server.
            Without SMTP config, emails go to a free Ethereal test inbox — preview URL appears in API server logs.
          </p>
        </div>
      </div>
    </div>
  );
}
