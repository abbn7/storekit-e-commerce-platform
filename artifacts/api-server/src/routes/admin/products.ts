import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productVariantsTable,
  productCollectionsTable,
  productTagsTable,
} from "@workspace/db";
import { eq, and, ilike, desc, sql, inArray } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";
import { buildFullProduct, mapProduct } from "../products";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const { page = "1", pageSize = "20", status, search, collectionId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    const conditions: any[] = [];
    if (status) conditions.push(eq(productsTable.status, status));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

    let productIds: string[] | undefined;
    if (collectionId) {
      const links = await db.select().from(productCollectionsTable).where(eq(productCollectionsTable.collectionId, collectionId));
      productIds = links.map(l => l.productId);
      if (productIds.length === 0) {
        res.json({ products: [], total: 0, page: pageNum, pageSize: pageSizeNum, totalPages: 0 });
        return;
      }
      conditions.push(inArray(productsTable.id, productIds));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult, products] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(whereClause),
      db.select().from(productsTable).where(whereClause).orderBy(desc(productsTable.createdAt)).limit(pageSizeNum).offset(offset),
    ]);

    const fullProducts = await Promise.all(products.map(async p => {
      const extras = await buildFullProduct(p.id);
      return mapProduct(p, extras);
    }));

    const total = countResult[0]?.count ?? 0;
    res.json({ products: fullProducts, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const products = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id)).limit(1);
    if (products.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    const extras = await buildFullProduct(products[0].id);
    res.json(mapProduct(products[0], extras));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const { name, slug, description, shortDescription, basePrice, compareAtPrice, status, isFeatured, isNewArrival, material, careInstructions, weight, metaTitle, metaDescription, collectionIds, tags, images, variants } = req.body;
    const [product] = await db.insert(productsTable).values({ name, slug, description, shortDescription, basePrice, compareAtPrice, status: status || "draft", isFeatured: isFeatured || false, isNewArrival: isNewArrival || false, material, careInstructions, weight, metaTitle, metaDescription }).returning();

    if (images?.length) await db.insert(productImagesTable).values(images.map((img: any, i: number) => ({ productId: product.id, url: img.url, alt: img.alt || "", isPrimary: img.isPrimary || i === 0, sortOrder: img.sortOrder || i })));
    if (variants?.length) await db.insert(productVariantsTable).values(variants.map((v: any) => ({ productId: product.id, size: v.size, color: v.color, colorHex: v.colorHex || "#000000", sku: v.sku, stock: v.stock || 0, price: v.price, compareAtPrice: v.compareAtPrice })));
    if (collectionIds?.length) await db.insert(productCollectionsTable).values(collectionIds.map((cid: string) => ({ productId: product.id, collectionId: cid })));
    if (tags?.length) await db.insert(productTagsTable).values(tags.map((t: string) => ({ productId: product.id, tag: t })));

    const extras = await buildFullProduct(product.id);
    res.status(201).json(mapProduct(product, extras));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to create product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, shortDescription, basePrice, compareAtPrice, status, isFeatured, isNewArrival, material, careInstructions, weight, metaTitle, metaDescription, collectionIds, tags, images, variants } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival;
    if (material !== undefined) updateData.material = material;
    if (careInstructions !== undefined) updateData.careInstructions = careInstructions;
    if (weight !== undefined) updateData.weight = weight;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    if (!product) { res.status(404).json({ error: "Not found" }); return; }

    if (images !== undefined) {
      await db.delete(productImagesTable).where(eq(productImagesTable.productId, id));
      if (images.length) await db.insert(productImagesTable).values(images.map((img: any, i: number) => ({ productId: id, url: img.url, alt: img.alt || "", isPrimary: img.isPrimary || i === 0, sortOrder: img.sortOrder || i })));
    }
    if (variants !== undefined) {
      await db.delete(productVariantsTable).where(eq(productVariantsTable.productId, id));
      if (variants.length) await db.insert(productVariantsTable).values(variants.map((v: any) => ({ productId: id, size: v.size, color: v.color, colorHex: v.colorHex || "#000000", sku: v.sku, stock: v.stock || 0, price: v.price, compareAtPrice: v.compareAtPrice })));
    }
    if (collectionIds !== undefined) {
      await db.delete(productCollectionsTable).where(eq(productCollectionsTable.productId, id));
      if (collectionIds.length) await db.insert(productCollectionsTable).values(collectionIds.map((cid: string) => ({ productId: id, collectionId: cid })));
    }
    if (tags !== undefined) {
      await db.delete(productTagsTable).where(eq(productTagsTable.productId, id));
      if (tags.length) await db.insert(productTagsTable).values(tags.map((t: string) => ({ productId: id, tag: t })));
    }

    const extras = await buildFullProduct(id);
    res.json(mapProduct(product, extras));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to delete product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
