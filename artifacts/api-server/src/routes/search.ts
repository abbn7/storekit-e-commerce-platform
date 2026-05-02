import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { buildFullProduct, mapProduct } from "./products";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const { q = "", page = "1", pageSize = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(50, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    if (!q.trim()) {
      res.json({ products: [], total: 0, page: pageNum, pageSize: pageSizeNum, totalPages: 0 });
      return;
    }

    const searchCondition = and(
      eq(productsTable.status, "active"),
      ilike(productsTable.name, `%${q}%`),
    );

    const [countResult, products] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(searchCondition),
      db.select().from(productsTable).where(searchCondition).orderBy(desc(productsTable.createdAt)).limit(pageSizeNum).offset(offset),
    ]);

    const fullProducts = await Promise.all(products.map(async p => {
      const extras = await buildFullProduct(p.id);
      return mapProduct(p, extras);
    }));

    const total = countResult[0]?.count ?? 0;
    res.json({ products: fullProducts, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) });
  } catch (err) {
    req.log.error({ err }, "Search failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
