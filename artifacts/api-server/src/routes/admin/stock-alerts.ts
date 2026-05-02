import { Router } from "express";
import { db } from "@workspace/db";
import { stockAlertsTable, productVariantsTable, productsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";
import { sendBackInStockEmail } from "../../lib/email";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

// GET /admin/stock-alerts — list all, grouped
router.get("/", async (req, res): Promise<void> => {
  try {
    const alerts = await db
      .select({
        id: stockAlertsTable.id,
        variantId: stockAlertsTable.variantId,
        productId: stockAlertsTable.productId,
        email: stockAlertsTable.email,
        userId: stockAlertsTable.userId,
        isNotified: stockAlertsTable.isNotified,
        notifiedAt: stockAlertsTable.notifiedAt,
        createdAt: stockAlertsTable.createdAt,
        variantSize: productVariantsTable.size,
        variantColor: productVariantsTable.color,
        variantStock: productVariantsTable.stock,
        productName: productsTable.name,
        productSlug: productsTable.slug,
      })
      .from(stockAlertsTable)
      .leftJoin(productVariantsTable, eq(stockAlertsTable.variantId, productVariantsTable.id))
      .leftJoin(productsTable, eq(stockAlertsTable.productId, productsTable.id))
      .orderBy(desc(stockAlertsTable.createdAt));

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/stock-alerts/notify/:variantId — trigger emails for a variant
router.post("/notify/:variantId", async (req, res): Promise<void> => {
  try {
    const { variantId } = req.params;

    // Get all pending (un-notified) alerts for this variant
    const alerts = await db
      .select({
        id: stockAlertsTable.id,
        email: stockAlertsTable.email,
        productName: productsTable.name,
        productSlug: productsTable.slug,
        variantSize: productVariantsTable.size,
        variantColor: productVariantsTable.color,
        variantPrice: productVariantsTable.price,
      })
      .from(stockAlertsTable)
      .leftJoin(productVariantsTable, eq(stockAlertsTable.variantId, productVariantsTable.id))
      .leftJoin(productsTable, eq(stockAlertsTable.productId, productsTable.id))
      .where(and(eq(stockAlertsTable.variantId, variantId), eq(stockAlertsTable.isNotified, false)));

    if (alerts.length === 0) {
      res.json({ sent: 0, message: "No pending alerts for this variant" });
      return;
    }

    let sent = 0;
    for (const alert of alerts) {
      try {
        await sendBackInStockEmail({
          email: alert.email,
          productName: alert.productName ?? "Product",
          variantLabel: `${alert.variantSize} / ${alert.variantColor}`,
          productSlug: alert.productSlug ?? "",
          price: alert.variantPrice ?? 0,
        });
        sent++;
      } catch {
        // continue even if one email fails
      }
    }

    // Mark all as notified
    await db
      .update(stockAlertsTable)
      .set({ isNotified: true, notifiedAt: new Date() })
      .where(eq(stockAlertsTable.variantId, variantId));

    res.json({ sent, total: alerts.length });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /admin/stock-alerts/:id
router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(stockAlertsTable).where(eq(stockAlertsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
