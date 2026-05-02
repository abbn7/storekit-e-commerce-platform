import { Router } from "express";
import { db } from "@workspace/db";
import { productReviewsTable } from "@workspace/db";
import { eq, and, desc, avg, count } from "drizzle-orm";

const router = Router();

router.get("/:productId", async (req, res): Promise<void> => {
  try {
    const reviews = await db
      .select()
      .from(productReviewsTable)
      .where(
        and(
          eq(productReviewsTable.productId, req.params.productId),
          eq(productReviewsTable.isApproved, true)
        )
      )
      .orderBy(desc(productReviewsTable.createdAt));

    const [stats] = await db
      .select({ avg: avg(productReviewsTable.rating), total: count() })
      .from(productReviewsTable)
      .where(
        and(
          eq(productReviewsTable.productId, req.params.productId),
          eq(productReviewsTable.isApproved, true)
        )
      );

    res.json({
      reviews,
      averageRating: parseFloat(stats?.avg ?? "0") || 0,
      totalReviews: stats?.total ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:productId", async (req, res): Promise<void> => {
  try {
    const { userId, authorName, rating, title, body } = req.body;
    if (!userId || !authorName || !rating) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be 1–5" });
      return;
    }

    const [review] = await db
      .insert(productReviewsTable)
      .values({
        productId: req.params.productId,
        userId,
        authorName,
        rating: ratingNum,
        title: title ?? "",
        body: body ?? "",
        isApproved: true,
      })
      .returning();

    res.status(201).json(review);
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
