import { Router } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const items = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.isVisible, true))
      .orderBy(testimonialsTable.sortOrder);
    res.json(
      items.map((t) => ({
        id: t.id,
        authorName: t.authorName,
        authorLocation: t.authorLocation ?? "",
        text: t.text,
        rating: t.rating ?? 5,
        isVisible: t.isVisible ?? true,
        sortOrder: t.sortOrder ?? 0,
        createdAt: t.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
