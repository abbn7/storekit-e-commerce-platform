import { Router } from "express";
import { db } from "@workspace/db";
import { collectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";
import { mapCollection } from "../collections";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const collections = await db.select().from(collectionsTable).orderBy(collectionsTable.sortOrder);
    const mapped = await Promise.all(collections.map(mapCollection));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list collections");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const { name, slug, description, imageUrl, isFeatured, sortOrder, metaTitle, metaDescription } = req.body;
    const [col] = await db.insert(collectionsTable).values({ name, slug, description: description || "", imageUrl, isFeatured: isFeatured || false, sortOrder: sortOrder || 0, metaTitle, metaDescription }).returning();
    res.status(201).json(await mapCollection(col));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to create collection");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, isFeatured, sortOrder, metaTitle, metaDescription } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    const [col] = await db.update(collectionsTable).set(updateData).where(eq(collectionsTable.id, id)).returning();
    if (!col) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await mapCollection(col));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update collection");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(collectionsTable).where(eq(collectionsTable.id, req.params.id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete collection");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
