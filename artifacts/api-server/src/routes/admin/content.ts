import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable, bannersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

function mapTestimonial(t: typeof testimonialsTable.$inferSelect) {
  return { id: t.id, authorName: t.authorName, authorLocation: t.authorLocation ?? "", text: t.text, rating: t.rating ?? 5, isVisible: t.isVisible ?? true, sortOrder: t.sortOrder ?? 0, createdAt: t.createdAt.toISOString() };
}

function mapBanner(b: typeof bannersTable.$inferSelect) {
  return { id: b.id, imageUrl: b.imageUrl, heading: b.heading ?? "", subheading: b.subheading ?? "", ctaText: b.ctaText ?? "", ctaUrl: b.ctaUrl ?? "", sortOrder: b.sortOrder ?? 0, isActive: b.isActive ?? true, createdAt: b.createdAt.toISOString() };
}

// Testimonials
router.get("/testimonials", async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(testimonialsTable).orderBy(testimonialsTable.sortOrder);
    res.json(items.map(mapTestimonial));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/testimonials", async (req, res): Promise<void> => {
  try {
    const { authorName, authorLocation, text, rating, isVisible, sortOrder } = req.body;
    const [item] = await db.insert(testimonialsTable).values({ authorName, authorLocation: authorLocation || "", text, rating: rating || 5, isVisible: isVisible !== undefined ? isVisible : true, sortOrder: sortOrder || 0 }).returning();
    res.status(201).json(mapTestimonial(item));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to create testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/testimonials/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = {};
    const fields = ["authorName", "authorLocation", "text", "rating", "isVisible", "sortOrder"];
    for (const f of fields) if (req.body[f] !== undefined) updateData[f] = req.body[f];
    const [item] = await db.update(testimonialsTable).set(updateData).where(eq(testimonialsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapTestimonial(item));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/testimonials/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, req.params.id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Banners
router.get("/banners", async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(bannersTable).orderBy(bannersTable.sortOrder);
    res.json(items.map(mapBanner));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list banners");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/banners", async (req, res): Promise<void> => {
  try {
    const { imageUrl, heading, subheading, ctaText, ctaUrl, sortOrder, isActive } = req.body;
    const [item] = await db.insert(bannersTable).values({ imageUrl, heading: heading || "", subheading: subheading || "", ctaText: ctaText || "", ctaUrl: ctaUrl || "", sortOrder: sortOrder || 0, isActive: isActive !== undefined ? isActive : true }).returning();
    res.status(201).json(mapBanner(item));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to create banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/banners/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = {};
    const fields = ["imageUrl", "heading", "subheading", "ctaText", "ctaUrl", "sortOrder", "isActive"];
    for (const f of fields) if (req.body[f] !== undefined) updateData[f] = req.body[f];
    const [item] = await db.update(bannersTable).set(updateData).where(eq(bannersTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapBanner(item));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/banners/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, req.params.id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
