import {
  pgTable, uuid, text, boolean, integer, timestamp, varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { collectionsTable } from "./collections";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description").default(""),
  shortDescription: text("short_description").default(""),
  basePrice: integer("base_price").notNull().default(0),
  compareAtPrice: integer("compare_at_price"),
  status: text("status").default("draft"),
  isFeatured: boolean("is_featured").default(false),
  isNewArrival: boolean("is_new_arrival").default(false),
  material: text("material").default(""),
  careInstructions: text("care_instructions").default(""),
  weight: integer("weight").default(0),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productImagesTable = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").default(""),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
});

export const productVariantsTable = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  color: text("color").notNull(),
  colorHex: varchar("color_hex", { length: 7 }).default("#000000"),
  sku: text("sku").unique().notNull(),
  stock: integer("stock").default(0),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productCollectionsTable = pgTable("product_collections", {
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  collectionId: uuid("collection_id").references(() => collectionsTable.id, { onDelete: "cascade" }).notNull(),
});

export const productTagsTable = pgTable("product_tags", {
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  tag: text("tag").notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type ProductImage = typeof productImagesTable.$inferSelect;
export type ProductVariant = typeof productVariantsTable.$inferSelect;
