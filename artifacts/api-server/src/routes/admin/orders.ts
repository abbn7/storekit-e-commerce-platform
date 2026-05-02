import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";
import { mapOrder } from "../orders";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const { page = "1", pageSize = "20", status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    const whereClause = status ? eq(ordersTable.status, status) : undefined;

    const [countResult, orders] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(whereClause),
      db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(pageSizeNum).offset(offset),
    ]);

    const mapped = await Promise.all(orders.map(mapOrder));
    const total = countResult[0]?.count ?? 0;
    res.json({ orders: mapped, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) });
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id)).limit(1);
    if (orders.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await mapOrder(orders[0]));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;
    const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, id)).returning();
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
