import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/:userId", async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const items = await db.select().from(wishlistsTable).where(eq(wishlistsTable.userId, userId));
    res.json(items.map(i => i.productId));
  } catch (err) {
    req.log.error({ err }, "Failed to get wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:userId/:productId", async (req, res): Promise<void> => {
  try {
    const { userId, productId } = req.params;
    const existing = await db.select().from(wishlistsTable)
      .where(and(eq(wishlistsTable.userId, userId), eq(wishlistsTable.productId, productId))).limit(1);
    if (existing.length === 0) {
      await db.insert(wishlistsTable).values({ userId, productId });
    }
    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    req.log.error({ err }, "Failed to add to wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId/:productId", async (req, res): Promise<void> => {
  try {
    const { userId, productId } = req.params;
    await db.delete(wishlistsTable).where(
      and(eq(wishlistsTable.userId, userId), eq(wishlistsTable.productId, productId))
    );
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    req.log.error({ err }, "Failed to remove from wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
