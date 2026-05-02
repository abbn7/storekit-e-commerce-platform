import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { productVariantsTable } from "./products";

export const productReviewsTable = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").default(""),
  body: text("body").default(""),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockAlertsTable = pgTable("stock_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id").references(() => productVariantsTable.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(),
  userId: text("user_id"),
  isNotified: boolean("is_notified").default(false),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promoCodesTable = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: integer("discount_value").notNull(),
  minOrderCents: integer("min_order_cents").default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
