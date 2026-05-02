import { pgTable, uuid, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storeConfigTable = pgTable("store_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeName: text("store_name").notNull().default("My Store"),
  storeTagline: text("store_tagline").default(""),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#1a1a1a"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#ffffff"),
  accentColor: varchar("accent_color", { length: 7 }).default("#c9a96e"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  currencySymbol: varchar("currency_symbol", { length: 5 }).default("$"),
  locale: varchar("locale", { length: 10 }).default("en-US"),
  socialLinks: jsonb("social_links").default({}),
  contactEmail: text("contact_email").default(""),
  shippingThreshold: integer("shipping_threshold").default(10000),
  returnPolicy: text("return_policy").default(""),
  aboutText: text("about_text").default(""),
  heroHeading: text("hero_heading").default("New Collection"),
  heroSubheading: text("hero_subheading").default("Discover our latest arrivals"),
  heroImageUrl: text("hero_image_url"),
  announcementText: text("announcement_text").default("Free shipping on orders over $100 · New arrivals every week"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStoreConfigSchema = createInsertSchema(storeConfigTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStoreConfig = z.infer<typeof insertStoreConfigSchema>;
export type StoreConfig = typeof storeConfigTable.$inferSelect;
