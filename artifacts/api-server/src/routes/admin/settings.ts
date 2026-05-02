import { Router } from "express";
import { db } from "@workspace/db";
import { storeConfigTable } from "@workspace/db";
import { verifyAdminAuth } from "./auth";
import { mapConfig } from "../store-config";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/", async (req, res): Promise<void> => {
  try {
    const configs = await db.select().from(storeConfigTable).limit(1);
    if (configs.length === 0) {
      const [config] = await db.insert(storeConfigTable).values({}).returning();
      res.json(mapConfig(config));
      return;
    }
    res.json(mapConfig(configs[0]));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to get store config");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/", async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const updateData: any = { updatedAt: new Date() };
    const fields = ["storeName", "storeTagline", "logoUrl", "primaryColor", "secondaryColor", "accentColor", "currency", "currencySymbol", "locale", "socialLinks", "contactEmail", "shippingThreshold", "returnPolicy", "aboutText", "heroHeading", "heroSubheading", "heroImageUrl", "announcementText"];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    const configs = await db.select().from(storeConfigTable).limit(1);
    let config;
    if (configs.length === 0) {
      [config] = await db.insert(storeConfigTable).values(updateData).returning();
    } else {
      [config] = await db.update(storeConfigTable).set(updateData).where(eq(storeConfigTable.id, configs[0].id)).returning();
    }

    res.json(mapConfig(config));
  } catch (err) {
    req.log.error({ err }, "Admin: Failed to update store config");
    res.status(500).json({ error: "Internal server error" });
  }
});

import { eq } from "drizzle-orm";
export default router;
