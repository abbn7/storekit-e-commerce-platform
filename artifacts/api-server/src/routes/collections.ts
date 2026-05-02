import { Router } from "express";
import { db } from "@workspace/db";
import { collectionsTable, productCollectionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function mapCollection(c: typeof collectionsTable.$inferSelect) {
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productCollectionsTable)
    .where(eq(productCollectionsTable.collectionId, c.id));
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? null,
    isFeatured: c.isFeatured ?? false,
    sortOrder: c.sortOrder ?? 0,
    productCount: countResult[0]?.count ?? 0,
    metaTitle: c.metaTitle ?? null,
    metaDescription: c.metaDescription ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const collections = await db.select().from(collectionsTable).orderBy(collectionsTable.sortOrder);
    const mapped = await Promise.all(collections.map(mapCollection));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list collections");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;
    const cols = await db.select().from(collectionsTable).where(eq(collectionsTable.slug, slug)).limit(1);
    if (cols.length === 0) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }
    res.json(await mapCollection(cols[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get collection");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { mapCollection };
export default router;
