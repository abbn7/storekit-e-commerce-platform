import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetStoreConfig, useAdminUpdateStoreConfig } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Palette, ImageIcon, Type, Link2, Truck, Eye, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Shared section card ─────────────────────────────────────── */
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-muted/40">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[13px] font-medium tracking-wide">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

/* ── Live image preview ──────────────────────────────────────── */
function ImagePreviewInput({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [err, setErr] = useState(false);
  return (
    <div className="space-y-2">
      <Label className="text-[12px]">{label}</Label>
      <Input
        value={value}
        onChange={e => { setErr(false); onChange(e.target.value); }}
        placeholder={placeholder ?? "https://..."}
        className="font-mono text-xs"
      />
      <AnimatePresence>
        {value && !err && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="relative mt-2 rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={value}
                alt="Preview"
                onError={() => setErr(true)}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" /> Preview
              </div>
            </div>
          </motion.div>
        )}
        {value && err && (
          <p className="text-xs text-destructive mt-1">Image could not be loaded — check the URL</p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Color swatch input ─────────────────────────────────────── */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-[12px]">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-white"
          />
        </div>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="font-mono text-xs w-32"
          maxLength={7}
        />
        <div className="flex-1 h-10 rounded-lg border border-border" style={{ background: value }} />
      </div>
    </div>
  );
}

/* ── Save bar ────────────────────────────────────────────────── */
function SaveBar({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <motion.div
      initial={false}
      className="sticky bottom-0 z-10 -mx-8 px-8 py-4 bg-white/90 backdrop-blur-xl border-t border-border flex items-center justify-between"
    >
      <p className="text-xs text-muted-foreground">
        {saved ? "All changes saved" : "You have unsaved changes"}
      </p>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-foreground/85 transition-colors disabled:opacity-60"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-background/40 border-t-background rounded-full animate-spin" />
            Saving...
          </span>
        ) : saved ? (
          <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>
        ) : "Save Settings"}
      </button>
    </motion.div>
  );
}

export default function AdminSettingsPage() {
  useAdminGuard();
  const { toast } = useToast();
  const { data: config, refetch } = useAdminGetStoreConfig();
  const updateConfig = useAdminUpdateStoreConfig();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    storeName: "", storeTagline: "", contactEmail: "",
    currency: "USD", currencySymbol: "$",
    primaryColor: "#0f0f0f", secondaryColor: "#faf9f7", accentColor: "#c9a96e",
    heroHeading: "", heroSubheading: "", heroImageUrl: "", announcementText: "",
    shippingThreshold: "100", returnPolicy: "", aboutText: "", logoUrl: "",
    socialInstagram: "", socialFacebook: "", socialTiktok: "", socialTwitter: "",
  });

  useEffect(() => {
    if (config) {
      const c = config as any;
      const social = c.socialLinks ?? {};
      setForm({
        storeName:         c.storeName ?? "",
        storeTagline:      c.storeTagline ?? "",
        contactEmail:      c.contactEmail ?? "",
        currency:          c.currency ?? "USD",
        currencySymbol:    c.currencySymbol ?? "$",
        primaryColor:      c.primaryColor ?? "#0f0f0f",
        secondaryColor:    c.secondaryColor ?? "#faf9f7",
        accentColor:       c.accentColor ?? "#c9a96e",
        heroHeading:       c.heroHeading ?? "",
        heroSubheading:    c.heroSubheading ?? "",
        heroImageUrl:      c.heroImageUrl ?? "",
        announcementText:  c.announcementText ?? "",
        shippingThreshold: String(((c.shippingThreshold ?? 10000) / 100).toFixed(2)),
        returnPolicy:      c.returnPolicy ?? "",
        aboutText:         c.aboutText ?? "",
        logoUrl:           c.logoUrl ?? "",
        socialInstagram:   social.instagram ?? "",
        socialFacebook:    social.facebook ?? "",
        socialTiktok:      social.tiktok ?? "",
        socialTwitter:     social.twitter ?? "",
      });
    }
  }, [config]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const setVal = (key: keyof typeof form) => (v: string) => {
    setSaved(false);
    setForm(f => ({ ...f, [key]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig.mutateAsync({
        data: {
          storeName:        form.storeName,
          storeTagline:     form.storeTagline,
          contactEmail:     form.contactEmail,
          currency:         form.currency,
          currencySymbol:   form.currencySymbol,
          primaryColor:     form.primaryColor,
          secondaryColor:   form.secondaryColor,
          accentColor:      form.accentColor,
          heroHeading:      form.heroHeading,
          heroSubheading:   form.heroSubheading,
          heroImageUrl:     form.heroImageUrl || null,
          announcementText: form.announcementText,
          shippingThreshold: Math.round(parseFloat(form.shippingThreshold) * 100),
          returnPolicy:     form.returnPolicy,
          aboutText:        form.aboutText,
          logoUrl:          form.logoUrl || null,
          socialLinks: {
            instagram: form.socialInstagram,
            facebook:  form.socialFacebook,
            tiktok:    form.socialTiktok,
            twitter:   form.socialTwitter,
          },
        },
      });
      setSaved(true);
      toast({ title: "Settings saved successfully" });
      refetch();
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <AdminLayout title="Store Settings" subtitle="Control every aspect of your storefront">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

        <Tabs defaultValue="general">
          <TabsList className="mb-6 bg-muted/60 p-1 rounded-xl h-auto gap-1">
            {[
              ["general",   "General"],
              ["hero",      "Hero & Banner"],
              ["branding",  "Colors & Brand"],
              ["social",    "Social Links"],
              ["content",   "Content & Policies"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── GENERAL ──────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-6">
            <Section title="Store Identity" icon={Globe}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-[12px]">Store Name</Label>
                  <Input value={form.storeName} onChange={set("storeName")} placeholder="STOREKIT" />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-[12px]">Contact Email</Label>
                  <Input type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="hello@yourbrand.com" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[12px]">Store Tagline</Label>
                  <Input value={form.storeTagline} onChange={set("storeTagline")} placeholder="Crafted for the conscious few." />
                  <p className="text-[11px] text-muted-foreground">Shown in the footer and meta description</p>
                </div>
              </div>
            </Section>

            <Section title="Logo" icon={ImageIcon}>
              <ImagePreviewInput
                label="Logo Image URL"
                value={form.logoUrl}
                onChange={setVal("logoUrl")}
                placeholder="https://your-cdn.com/logo.svg"
              />
              <p className="text-[11px] text-muted-foreground">Leave empty to show the text logo (STOREKIT)</p>
            </Section>

            <Section title="Currency & Shipping" icon={Truck}>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Currency Code</Label>
                  <Input value={form.currency} onChange={set("currency")} placeholder="USD" maxLength={3} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Currency Symbol</Label>
                  <Input value={form.currencySymbol} onChange={set("currencySymbol")} placeholder="$" maxLength={3} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Free Shipping From ($)</Label>
                  <Input type="number" step="0.01" min="0" value={form.shippingThreshold} onChange={set("shippingThreshold")} />
                </div>
              </div>
            </Section>
          </TabsContent>

          {/* ─── HERO & BANNER ────────────────────────────────── */}
          <TabsContent value="hero" className="space-y-6">
            <Section title="Hero Section" icon={ImageIcon}>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Hero Heading</Label>
                <Textarea
                  value={form.heroHeading}
                  onChange={set("heroHeading")}
                  rows={3}
                  placeholder={"The New Season\nAwaits"}
                  className="font-serif text-lg resize-none"
                />
                <p className="text-[11px] text-muted-foreground">Use line breaks (Enter) for multi-line headings</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Hero Subheading</Label>
                <Input
                  value={form.heroSubheading}
                  onChange={set("heroSubheading")}
                  placeholder="Thoughtfully designed for those who move through the world with intention."
                />
              </div>
              <ImagePreviewInput
                label="Hero Background Image URL"
                value={form.heroImageUrl}
                onChange={setVal("heroImageUrl")}
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Recommended: High-resolution landscape photo (min 1920×1080). Try{" "}
                <a href="https://unsplash.com/s/photos/luxury-fashion" target="_blank" className="text-accent underline underline-offset-2">Unsplash</a>{" "}
                or{" "}
                <a href="https://www.pexels.com/search/fashion/" target="_blank" className="text-accent underline underline-offset-2">Pexels</a>.
              </p>
            </Section>

            <Section title="Announcement Bar" icon={Type}>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Announcement Text</Label>
                <Input
                  value={form.announcementText}
                  onChange={set("announcementText")}
                  placeholder="Free shipping on orders over $100 · New arrivals every week · Sustainably made"
                />
                <p className="text-[11px] text-muted-foreground">Use · (middle dot) to separate items. The bar scrolls automatically.</p>
              </div>
            </Section>
          </TabsContent>

          {/* ─── COLORS & BRAND ───────────────────────────────── */}
          <TabsContent value="branding" className="space-y-6">
            <Section title="Brand Colors" icon={Palette}>
              <p className="text-[12px] text-muted-foreground -mt-1">
                These colors are stored in your settings. For full theme control, edit the CSS variables in <code className="text-[11px] bg-muted px-1 rounded">index.css</code>.
              </p>
              <ColorField label="Primary Color" value={form.primaryColor} onChange={setVal("primaryColor")} />
              <ColorField label="Secondary Color" value={form.secondaryColor} onChange={setVal("secondaryColor")} />
              <ColorField label="Accent / Gold Color" value={form.accentColor} onChange={setVal("accentColor")} />

              <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-[11px] font-medium mb-3">Color Palette Preview</p>
                <div className="flex gap-2">
                  {[
                    { label: "Primary", color: form.primaryColor },
                    { label: "Secondary", color: form.secondaryColor },
                    { label: "Accent", color: form.accentColor },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex-1 text-center">
                      <div className="h-12 rounded-lg border border-border shadow-sm mb-1.5" style={{ background: color }} />
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-[10px] font-mono text-foreground/60">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </TabsContent>

          {/* ─── SOCIAL LINKS ─────────────────────────────────── */}
          <TabsContent value="social" className="space-y-6">
            <Section title="Social Media Links" icon={Link2}>
              <p className="text-[12px] text-muted-foreground -mt-1">Links appear in your footer and about page. Leave empty to hide.</p>
              <div className="space-y-4">
                {[
                  { key: "socialInstagram" as const, label: "Instagram", placeholder: "https://instagram.com/yourbrand" },
                  { key: "socialFacebook"  as const, label: "Facebook",  placeholder: "https://facebook.com/yourbrand" },
                  { key: "socialTiktok"    as const, label: "TikTok",    placeholder: "https://tiktok.com/@yourbrand" },
                  { key: "socialTwitter"   as const, label: "X / Twitter", placeholder: "https://x.com/yourbrand" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="text-[12px] w-24 flex-shrink-0">{label}</Label>
                    <Input
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={placeholder}
                      className="font-mono text-xs"
                    />
                    {form[key] && (
                      <a href={form[key]} target="_blank" rel="noopener noreferrer">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent/10 transition-colors">
                          <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* ─── CONTENT & POLICIES ───────────────────────────── */}
          <TabsContent value="content" className="space-y-6">
            <Section title="About Us" icon={Type}>
              <div className="space-y-1.5">
                <Label className="text-[12px]">About Text</Label>
                <Textarea
                  value={form.aboutText}
                  onChange={set("aboutText")}
                  rows={7}
                  placeholder="Tell your brand story — who you are, what you believe in, and why you create."
                  className="resize-none"
                />
                <p className="text-[11px] text-muted-foreground">Shown on the About page and homepage editorial section.</p>
              </div>
            </Section>

            <Section title="Return Policy" icon={Type}>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Return Policy Text</Label>
                <Textarea
                  value={form.returnPolicy}
                  onChange={set("returnPolicy")}
                  rows={6}
                  placeholder="We accept returns within 30 days of delivery..."
                  className="resize-none"
                />
                <p className="text-[11px] text-muted-foreground">Shown on product pages and the order confirmation email.</p>
              </div>
            </Section>
          </TabsContent>
        </Tabs>

        <SaveBar saving={saving} saved={saved} />
      </form>
    </AdminLayout>
  );
}
