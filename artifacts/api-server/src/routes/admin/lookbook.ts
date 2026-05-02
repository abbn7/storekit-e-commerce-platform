import { Router } from "express";
import { db } from "@workspace/db";
import { lookbookTable, lookbookTagsTable, productsTable } from "@workspace/db";
import { eq, asc, inArray } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

async function buildEntry(entry: typeof lookbookTable.$inferSelect) {
  const tags = await db.select().from(lookbookTagsTable).where(eq(lookbookTagsTable.lookbookId, entry.id));
  if (tags.length === 0) return { ...mapEntry(entry), tags: [] };
  const productIds = [...new Set(tags.map(t => t.productId))];
  const products = await db.select({ id: productsTable.id, slug: productsTable.slug, name: productsTable.name, basePrice: productsTable.basePrice }).from(productsTable).where(inArray(productsTable.id, productIds));
  const pMap = new Map(products.map(p => [p.id, p]));
  return {
    ...mapEntry(entry),
    tags: tags.map(t => ({ id: t.id, xPct: t.xPct, yPct: t.yPct, productId: t.productId, product: pMap.get(t.productId) ?? null })),
  };
}

function mapEntry(e: typeof lookbookTable.$inferSelect) {
  return { id: e.id, slug: e.slug, title: e.title, subtitle: e.subtitle ?? "", imageUrl: e.imageUrl, season: e.season ?? "", sortOrder: e.sortOrder ?? 0, isActive: e.isActive ?? true };
}

// GET /
router.get("/", async (req, res): Promise<void> => {
  try {
    const entries = await db.select().from(lookbookTable).orderBy(asc(lookbookTable.sortOrder));
    const results = await Promise.all(entries.map(buildEntry));
    res.json({ lookbook: results });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list lookbook");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const [entry] = await db.select().from(lookbookTable).where(eq(lookbookTable.id, req.params.id));
    if (!entry) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await buildEntry(entry));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to get lookbook entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /
router.post("/", async (req, res): Promise<void> => {
  try {
    const { slug, title, subtitle, imageUrl, season, sortOrder, isActive } = req.body;
    const [entry] = await db.insert(lookbookTable).values({ slug, title, subtitle: subtitle ?? "", imageUrl, season: season ?? "", sortOrder: sortOrder ?? 0, isActive: isActive ?? true }).returning();
    res.status(201).json(await buildEntry(entry));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to create lookbook entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id
router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { slug, title, subtitle, imageUrl, season, sortOrder, isActive } = req.body;
    const upd: any = {};
    if (slug !== undefined) upd.slug = slug;
    if (title !== undefined) upd.title = title;
    if (subtitle !== undefined) upd.subtitle = subtitle;
    if (imageUrl !== undefined) upd.imageUrl = imageUrl;
    if (season !== undefined) upd.season = season;
    if (sortOrder !== undefined) upd.sortOrder = sortOrder;
    if (isActive !== undefined) upd.isActive = isActive;
    const [entry] = await db.update(lookbookTable).set(upd).where(eq(lookbookTable.id, id)).returning();
    if (!entry) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await buildEntry(entry));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update lookbook entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id
router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(lookbookTable).where(eq(lookbookTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete lookbook entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /:id/tags
router.post("/:id/tags", async (req, res): Promise<void> => {
  try {
    const { productId, xPct, yPct } = req.body;
    const [tag] = await db.insert(lookbookTagsTable).values({ lookbookId: req.params.id, productId, xPct, yPct }).returning();
    res.status(201).json(tag);
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to add tag");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id/tags/:tagId
router.delete("/:id/tags/:tagId", async (req, res): Promise<void> => {
  try {
    await db.delete(lookbookTagsTable).where(eq(lookbookTagsTable.id, req.params.tagId));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete tag");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
