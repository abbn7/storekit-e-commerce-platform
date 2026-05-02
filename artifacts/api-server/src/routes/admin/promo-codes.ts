import { Router } from "express";
import { db } from "@workspace/db";
import { promoCodesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const codes = await db.select().from(promoCodesTable).orderBy(desc(promoCodesTable.createdAt));
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderCents, maxUses, expiresAt, isActive } = req.body;
    if (!code || !discountType || discountValue == null) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [promo] = await db
      .insert(promoCodesTable)
      .values({
        code: String(code).toUpperCase().trim(),
        discountType,
        discountValue: parseInt(discountValue, 10),
        minOrderCents: minOrderCents ? parseInt(minOrderCents, 10) : 0,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
      })
      .returning();
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { isActive } = req.body;
    const [promo] = await db
      .update(promoCodesTable)
      .set({ isActive })
      .where(eq(promoCodesTable.id, req.params.id))
      .returning();
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(promoCodesTable).where(eq(promoCodesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
