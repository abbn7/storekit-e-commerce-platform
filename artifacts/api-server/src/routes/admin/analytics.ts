import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, productVariantsTable } from "@workspace/db";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";
import { mapOrder } from "../orders";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      allOrders,
      activeProductsResult,
      recentOrdersRaw,
      ordersByStatusRaw,
      topProductsRaw,
      lowStockRaw,
    ] = await Promise.all([
      db.select({ total: sql<number>`sum(total)::int`, count: sql<number>`count(*)::int` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.status, "active")),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
      db.select({ status: ordersTable.status, count: sql<number>`count(*)::int` }).from(ordersTable).groupBy(ordersTable.status),
      db.select({
        productId: orderItemsTable.productId,
        productName: orderItemsTable.productName,
        totalSold: sql<number>`sum(${orderItemsTable.quantity})::int`,
        revenue: sql<number>`sum(${orderItemsTable.total})::int`,
      }).from(orderItemsTable).groupBy(orderItemsTable.productId, orderItemsTable.productName).orderBy(desc(sql`sum(${orderItemsTable.total})`)).limit(5),
      db.select({
        variantId: productVariantsTable.id,
        productId: productVariantsTable.productId,
        size: productVariantsTable.size,
        color: productVariantsTable.color,
        stock: productVariantsTable.stock,
      }).from(productVariantsTable).where(sql`${productVariantsTable.stock} < 5`),
    ]);

    // Revenue by day (last 30 days)
    const revenueByDayRaw = await db.select({
      date: sql<string>`date(${ordersTable.createdAt})::text`,
      revenue: sql<number>`sum(${ordersTable.total})::int`,
    }).from(ordersTable)
      .where(gte(ordersTable.createdAt, thirtyDaysAgo))
      .groupBy(sql`date(${ordersTable.createdAt})`)
      .orderBy(sql`date(${ordersTable.createdAt})`);

    // Enrich low stock with product names
    const lowStockEnriched = await Promise.all(lowStockRaw.map(async v => {
      const products = await db.select().from(productsTable).where(eq(productsTable.id, v.productId ?? "")).limit(1);
      return {
        variantId: v.variantId,
        productName: products[0]?.name ?? "Unknown",
        size: v.size,
        color: v.color,
        stock: v.stock ?? 0,
      };
    }));

    const recentOrders = await Promise.all(recentOrdersRaw.map(mapOrder));

    res.json({
      totalRevenue: allOrders[0]?.total ?? 0,
      totalOrders: allOrders[0]?.count ?? 0,
      activeProducts: activeProductsResult[0]?.count ?? 0,
      revenueByDay: revenueByDayRaw.map(r => ({ date: r.date, revenue: r.revenue ?? 0 })),
      ordersByStatus: ordersByStatusRaw.map(r => ({ status: r.status ?? "pending", count: r.count })),
      topProducts: topProductsRaw.map(r => ({
        productId: r.productId ?? "",
        productName: r.productName,
        totalSold: r.totalSold ?? 0,
        revenue: r.revenue ?? 0,
      })),
      recentOrders,
      lowStockVariants: lowStockEnriched,
    });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to get analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
