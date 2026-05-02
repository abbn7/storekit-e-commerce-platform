import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetStoreConfig, useAdminUpdateStoreConfig } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  useAdminGuard();
  const { toast } = useToast();
  const { data: config, refetch } = useAdminGetStoreConfig();
  const updateConfig = useAdminUpdateStoreConfig();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    storeName: "", storeTagline: "", contactEmail: "", currency: "USD", currencySymbol: "$",
    primaryColor: "#0f0f0f", secondaryColor: "#faf9f7", accentColor: "#c9a96e",
    heroHeading: "", heroSubheading: "", heroImageUrl: "", announcementText: "",
    shippingThreshold: "10000", returnPolicy: "", aboutText: "", logoUrl: "",
  });

  useEffect(() => {
    if (config) {
      setForm({
        storeName: (config as any).storeName ?? "",
        storeTagline: (config as any).storeTagline ?? "",
        contactEmail: (config as any).contactEmail ?? "",
        currency: (config as any).currency ?? "USD",
        currencySymbol: (config as any).currencySymbol ?? "$",
        primaryColor: (config as any).primaryColor ?? "#0f0f0f",
        secondaryColor: (config as any).secondaryColor ?? "#faf9f7",
        accentColor: (config as any).accentColor ?? "#c9a96e",
        heroHeading: (config as any).heroHeading ?? "",
        heroSubheading: (config as any).heroSubheading ?? "",
        heroImageUrl: (config as any).heroImageUrl ?? "",
        announcementText: (config as any).announcementText ?? "",
        shippingThreshold: String(((config as any).shippingThreshold ?? 10000) / 100),
        returnPolicy: (config as any).returnPolicy ?? "",
        aboutText: (config as any).aboutText ?? "",
        logoUrl: (config as any).logoUrl ?? "",
      });
    }
  }, [config]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig.mutateAsync({
        data: {
          ...form,
          shippingThreshold: Math.round(parseFloat(form.shippingThreshold) * 100),
        },
      });
      toast({ title: "Settings saved" });
      refetch();
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <AdminLayout title="Store Settings">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* General */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Store Name</Label>
              <Input value={form.storeName} onChange={set("storeName")} />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contactEmail} onChange={set("contactEmail")} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Tagline</Label>
              <Input value={form.storeTagline} onChange={set("storeTagline")} />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Logo URL</Label>
              <Input value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://..." />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label>Free Shipping Threshold ($)</Label>
              <Input type="number" step="0.01" value={form.shippingThreshold} onChange={set("shippingThreshold")} />
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Brand Colors</h2>
          <div className="grid grid-cols-3 gap-6">
            {([["primaryColor", "Primary Color"], ["secondaryColor", "Secondary Color"], ["accentColor", "Accent Color"]] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-10 h-10 border border-border cursor-pointer rounded" />
                  <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="font-mono text-xs" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hero */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Homepage Hero</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Hero Heading</Label>
              <Textarea value={form.heroHeading} onChange={set("heroHeading")} rows={3} placeholder="The New&#10;Season&#10;Awaits" />
            </div>
            <div className="space-y-1.5">
              <Label>Hero Subheading</Label>
              <Input value={form.heroSubheading} onChange={set("heroSubheading")} />
            </div>
            <div className="space-y-1.5">
              <Label>Hero Image URL</Label>
              <Input value={form.heroImageUrl} onChange={set("heroImageUrl")} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Announcement Bar Text</Label>
              <Input value={form.announcementText} onChange={set("announcementText")} />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-card border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide">Content</h2>
          <div className="space-y-1.5">
            <Label>About Text</Label>
            <Textarea value={form.aboutText} onChange={set("aboutText")} rows={5} />
          </div>
          <div className="space-y-1.5">
            <Label>Return Policy</Label>
            <Textarea value={form.returnPolicy} onChange={set("returnPolicy")} rows={4} />
          </div>
        </section>

        <button type="submit" disabled={saving} className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </AdminLayout>
  );
}
