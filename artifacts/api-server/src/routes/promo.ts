import { Router } from "express";
import { db } from "@workspace/db";
import { promoCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/validate", async (req, res): Promise<void> => {
  try {
    const { code, subtotalCents } = req.body;
    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const [promo] = await db
      .select()
      .from(promoCodesTable)
      .where(eq(promoCodesTable.code, String(code).toUpperCase().trim()));

    if (!promo || !promo.isActive) {
      res.status(404).json({ error: "Invalid or expired promo code" });
      return;
    }
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      res.status(400).json({ error: "This promo code has expired" });
      return;
    }
    if (promo.maxUses != null && (promo.usedCount ?? 0) >= promo.maxUses) {
      res.status(400).json({ error: "Promo code usage limit reached" });
      return;
    }
    const sub = Number(subtotalCents ?? 0);
    if (sub < (promo.minOrderCents ?? 0)) {
      const minDollars = ((promo.minOrderCents ?? 0) / 100).toFixed(0);
      res.status(400).json({ error: `Minimum order of $${minDollars} required` });
      return;
    }

    let discountAmount = 0;
    if (promo.discountType === "percent") {
      discountAmount = Math.round(sub * promo.discountValue / 100);
    } else {
      discountAmount = Math.min(promo.discountValue, sub);
    }

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to validate promo");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
