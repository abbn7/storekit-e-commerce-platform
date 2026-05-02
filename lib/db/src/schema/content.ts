import { pgTable, uuid, text, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testimonialsTable = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorLocation: text("author_location").default(""),
  text: text("text").notNull(),
  rating: integer("rating").default(5),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bannersTable = pgTable("homepage_banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageUrl: text("image_url").notNull(),
  heading: text("heading").default(""),
  subheading: text("subheading").default(""),
  ctaText: text("cta_text").default(""),
  ctaUrl: text("cta_url").default(""),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;

export const lookbookTable = pgTable("lookbook", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  imageUrl: text("image_url").notNull(),
  season: text("season").default(""),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lookbookTagsTable = pgTable("lookbook_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  lookbookId: uuid("lookbook_id").notNull().references(() => lookbookTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull(),
  xPct: doublePrecision("x_pct").notNull(),
  yPct: doublePrecision("y_pct").notNull(),
});

export type Lookbook = typeof lookbookTable.$inferSelect;
export type LookbookTag = typeof lookbookTagsTable.$inferSelect;
