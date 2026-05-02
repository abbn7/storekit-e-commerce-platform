import { Router } from "express";
import { db } from "@workspace/db";
import { storeConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const configs = await db.select().from(storeConfigTable).limit(1);
    if (configs.length === 0) {
      const [config] = await db.insert(storeConfigTable).values({}).returning();
      res.json(mapConfig(config));
      return;
    }
    res.json(mapConfig(configs[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get store config");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/testimonials", async (req, res): Promise<void> => {
  try {
    const { testimonialsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const items = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.isVisible, true))
      .orderBy(testimonialsTable.sortOrder);
    res.json(items.map(mapTestimonial));
  } catch (err) {
    req.log.error({ err }, "Failed to get testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

function mapConfig(c: typeof storeConfigTable.$inferSelect) {
  return {
    id: c.id,
    storeName: c.storeName,
    storeTagline: c.storeTagline ?? "",
    logoUrl: c.logoUrl ?? null,
    primaryColor: c.primaryColor ?? "#1a1a1a",
    secondaryColor: c.secondaryColor ?? "#ffffff",
    accentColor: c.accentColor ?? "#c9a96e",
    currency: c.currency ?? "USD",
    currencySymbol: c.currencySymbol ?? "$",
    locale: c.locale ?? "en-US",
    socialLinks: (c.socialLinks as Record<string, string>) ?? {},
    contactEmail: c.contactEmail ?? "",
    shippingThreshold: c.shippingThreshold ?? 10000,
    returnPolicy: c.returnPolicy ?? "",
    aboutText: c.aboutText ?? "",
    heroHeading: c.heroHeading ?? "New Collection",
    heroSubheading: c.heroSubheading ?? "Discover our latest arrivals",
    heroImageUrl: c.heroImageUrl ?? null,
    announcementText: c.announcementText ?? "Free shipping on orders over $100 · New arrivals every week",
  };
}

function mapTestimonial(t: { id: string; authorName: string; authorLocation: string | null; text: string; rating: number | null; isVisible: boolean | null; sortOrder: number | null; createdAt: Date }) {
  return {
    id: t.id,
    authorName: t.authorName,
    authorLocation: t.authorLocation ?? "",
    text: t.text,
    rating: t.rating ?? 5,
    isVisible: t.isVisible ?? true,
    sortOrder: t.sortOrder ?? 0,
    createdAt: t.createdAt.toISOString(),
  };
}

export { mapConfig };
export default router;
