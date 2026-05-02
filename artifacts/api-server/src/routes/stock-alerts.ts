import { Router } from "express";
import { db } from "@workspace/db";
import { stockAlertsTable, productVariantsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// POST /stock-alerts — subscribe
router.post("/", async (req, res): Promise<void> => {
  try {
    const { variantId, productId, email, userId } = req.body;
    if (!variantId || !productId || !email) {
      res.status(400).json({ error: "variantId, productId and email are required" });
      return;
    }

    // Verify variant is actually out of stock
    const [variant] = await db.select().from(productVariantsTable).where(eq(productVariantsTable.id, variantId));
    if (!variant) { res.status(404).json({ error: "Variant not found" }); return; }
    if ((variant.stock ?? 0) > 0) { res.status(400).json({ error: "This variant is currently in stock" }); return; }

    const [alert] = await db
      .insert(stockAlertsTable)
      .values({ variantId, productId, email: email.toLowerCase().trim(), userId: userId ?? null })
      .onConflictDoNothing()
      .returning();

    res.status(201).json({ success: true, id: alert?.id });
  } catch (err) {
    req.log.error({ err }, "Failed to create stock alert");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /stock-alerts — unsubscribe
router.delete("/", async (req, res): Promise<void> => {
  try {
    const { variantId, email } = req.body;
    if (!variantId || !email) { res.status(400).json({ error: "variantId and email required" }); return; }
    await db.delete(stockAlertsTable).where(
      and(eq(stockAlertsTable.variantId, variantId), eq(stockAlertsTable.email, email.toLowerCase().trim()))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete stock alert");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
