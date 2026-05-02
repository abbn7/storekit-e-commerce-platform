import { Router } from "express";
import { db } from "@workspace/db";
import { lookbookTable, lookbookTagsTable } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productVariantsTable,
} from "@workspace/db";
import { eq, asc, inArray } from "drizzle-orm";

const router = Router();

async function buildLookbookEntry(entry: typeof lookbookTable.$inferSelect) {
  const tags = await db
    .select()
    .from(lookbookTagsTable)
    .where(eq(lookbookTagsTable.lookbookId, entry.id));

  if (tags.length === 0) return { ...mapEntry(entry), tags: [] };

  const productIds = [...new Set(tags.map((t) => t.productId))];
  const [products, images, variants] = await Promise.all([
    db.select().from(productsTable).where(inArray(productsTable.id, productIds)),
    db.select().from(productImagesTable).where(inArray(productImagesTable.productId, productIds)).orderBy(productImagesTable.sortOrder),
    db.select().from(productVariantsTable).where(inArray(productVariantsTable.productId, productIds)),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const imageMap = new Map<string, typeof productImagesTable.$inferSelect[]>();
  const variantMap = new Map<string, typeof productVariantsTable.$inferSelect[]>();

  for (const img of images) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, []);
    imageMap.get(img.productId)!.push(img);
  }
  for (const v of variants) {
    if (!variantMap.has(v.productId)) variantMap.set(v.productId, []);
    variantMap.get(v.productId)!.push(v);
  }

  const mappedTags = tags.map((tag) => {
    const p = productMap.get(tag.productId);
    if (!p) return null;
    const imgs = imageMap.get(p.id) ?? [];
    const vars = variantMap.get(p.id) ?? [];
    return {
      id: tag.id,
      xPct: tag.xPct,
      yPct: tag.yPct,
      product: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice ?? null,
        images: imgs.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
        variants: vars.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? "#000000",
          stock: v.stock ?? 0,
          price: v.price,
        })),
      },
    };
  }).filter(Boolean);

  return { ...mapEntry(entry), tags: mappedTags };
}

function mapEntry(e: typeof lookbookTable.$inferSelect) {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    subtitle: e.subtitle ?? "",
    imageUrl: e.imageUrl,
    season: e.season ?? "",
    sortOrder: e.sortOrder ?? 0,
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const entries = await db
      .select()
      .from(lookbookTable)
      .where(eq(lookbookTable.isActive, true))
      .orderBy(asc(lookbookTable.sortOrder));
    const results = await Promise.all(entries.map(buildLookbookEntry));
    res.json({ lookbook: results });
  } catch (err) {
    req.log.error({ err }, "Failed to get lookbook");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res): Promise<void> => {
  try {
    const [entry] = await db
      .select()
      .from(lookbookTable)
      .where(eq(lookbookTable.slug, req.params.slug));
    if (!entry) { res.status(404).json({ error: "Not found" }); return; }
    const result = await buildLookbookEntry(entry);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get lookbook entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
