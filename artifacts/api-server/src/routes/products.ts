import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productVariantsTable,
  productCollectionsTable,
  productTagsTable,
  collectionsTable,
} from "@workspace/db";
import { eq, and, gte, lte, ilike, inArray, sql, desc, asc } from "drizzle-orm";

const router = Router();

async function buildFullProduct(productId: string) {
  const [images, variants, collectionLinks, tags] = await Promise.all([
    db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId)).orderBy(productImagesTable.sortOrder),
    db.select().from(productVariantsTable).where(eq(productVariantsTable.productId, productId)),
    db.select().from(productCollectionsTable).where(eq(productCollectionsTable.productId, productId)),
    db.select().from(productTagsTable).where(eq(productTagsTable.productId, productId)),
  ]);
  return { images, variants, collectionIds: collectionLinks.map(c => c.collectionId), tags: tags.map(t => t.tag) };
}

function mapProduct(p: typeof productsTable.$inferSelect, extras: { images: typeof productImagesTable.$inferSelect[], variants: typeof productVariantsTable.$inferSelect[], collectionIds: string[], tags: string[] }) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    shortDescription: p.shortDescription ?? "",
    images: extras.images.map(i => ({
      id: i.id,
      url: i.url,
      alt: i.alt ?? "",
      isPrimary: i.isPrimary ?? false,
      sortOrder: i.sortOrder ?? 0,
    })),
    variants: extras.variants.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? "#000000",
      sku: v.sku,
      stock: v.stock ?? 0,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
    })),
    collectionIds: extras.collectionIds,
    tags: extras.tags,
    status: p.status ?? "draft",
    isFeatured: p.isFeatured ?? false,
    isNewArrival: p.isNewArrival ?? false,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice ?? null,
    material: p.material ?? null,
    careInstructions: p.careInstructions ?? null,
    weight: p.weight ?? null,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const {
      page = "1", pageSize = "24", collectionSlug, status = "active",
      featured, newArrival, sort = "newest", minPrice, maxPrice, sizes, colors,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    let conditions = [eq(productsTable.status, status)];

    if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
    if (newArrival === "true") conditions.push(eq(productsTable.isNewArrival, true));
    if (minPrice) conditions.push(gte(productsTable.basePrice, parseInt(minPrice)));
    if (maxPrice) conditions.push(lte(productsTable.basePrice, parseInt(maxPrice)));

    let productIds: string[] | undefined;
    if (collectionSlug) {
      const col = await db.select().from(collectionsTable).where(eq(collectionsTable.slug, collectionSlug)).limit(1);
      if (col.length > 0) {
        const links = await db.select().from(productCollectionsTable).where(eq(productCollectionsTable.collectionId, col[0].id));
        productIds = links.map(l => l.productId);
        if (productIds.length === 0) {
          res.json({ products: [], total: 0, page: pageNum, pageSize: pageSizeNum, totalPages: 0 });
          return;
        }
        conditions.push(inArray(productsTable.id, productIds));
      }
    }

    let orderBy;
    switch (sort) {
      case "price_asc": orderBy = asc(productsTable.basePrice); break;
      case "price_desc": orderBy = desc(productsTable.basePrice); break;
      case "featured": orderBy = desc(productsTable.isFeatured); break;
      default: orderBy = desc(productsTable.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult, products] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(whereClause),
      db.select().from(productsTable).where(whereClause).orderBy(orderBy).limit(pageSizeNum).offset(offset),
    ]);

    const fullProducts = await Promise.all(
      products.map(async p => {
        const extras = await buildFullProduct(p.id);
        return mapProduct(p, extras);
      })
    );

    const total = countResult[0]?.count ?? 0;
    res.json({ products: fullProducts, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) });
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;
    const products = await db.select().from(productsTable).where(and(eq(productsTable.slug, slug), eq(productsTable.status, "active"))).limit(1);
    if (products.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const extras = await buildFullProduct(products[0].id);
    res.json(mapProduct(products[0], extras));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { mapProduct, buildFullProduct };
export default router;
