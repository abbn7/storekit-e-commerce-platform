import { Router } from "express";
import { db } from "@workspace/db";
import { productReviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyAdminAuth } from "./auth";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const reviews = await db
      .select()
      .from(productReviewsTable)
      .orderBy(desc(productReviewsTable.createdAt));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const { isApproved } = req.body;
    const [review] = await db
      .update(productReviewsTable)
      .set({ isApproved })
      .where(eq(productReviewsTable.id, req.params.id))
      .returning();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  try {
    await db.delete(productReviewsTable).where(eq(productReviewsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
