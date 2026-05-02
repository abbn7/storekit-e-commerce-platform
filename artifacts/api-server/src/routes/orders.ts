import { Router } from "express";
import { db } from "@workspace/db";
import {
  ordersTable,
  orderItemsTable,
  productVariantsTable,
  productImagesTable,
  productsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendOrderConfirmation } from "../lib/email";

const router = Router();

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `SK-${year}-${num}`;
}

async function mapOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status ?? "pending",
    items: items.map(i => ({
      id: i.id,
      productId: i.productId ?? "",
      variantId: i.variantId ?? "",
      productName: i.productName,
      variantLabel: i.variantLabel,
      imageUrl: i.imageUrl ?? "",
      price: i.price,
      quantity: i.quantity,
      total: i.total,
    })),
    shippingAddress: order.shippingAddress as {
      fullName: string; line1: string; line2?: string; city: string;
      state: string; postalCode: string; country: string; phone: string;
    },
    subtotal: order.subtotal,
    shippingCost: order.shippingCost ?? 0,
    tax: order.tax ?? 0,
    total: order.total,
    stripePaymentIntentId: order.stripePaymentIntentId ?? null,
    trackingNumber: order.trackingNumber ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.post("/", async (req, res): Promise<void> => {
  try {
    const { userId, items, shippingAddress, stripePaymentIntentId } = req.body;

    if (!userId || !items || !shippingAddress || !stripePaymentIntentId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Verify variants and compute prices server-side
    let subtotal = 0;
    const resolvedItems: { variantId: string; quantity: number; price: number; productId: string; productName: string; variantLabel: string; imageUrl: string }[] = [];

    for (const item of items) {
      const variants = await db.select().from(productVariantsTable).where(eq(productVariantsTable.id, item.variantId)).limit(1);
      if (variants.length === 0) {
        res.status(400).json({ error: `Variant ${item.variantId} not found` });
        return;
      }
      const variant = variants[0];
      if ((variant.stock ?? 0) < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for variant ${item.variantId}` });
        return;
      }

      const products = await db.select().from(productsTable).where(eq(productsTable.id, variant.productId ?? "")).limit(1);
      const productImages = await db.select().from(productImagesTable).where(and(eq(productImagesTable.productId, variant.productId ?? ""), eq(productImagesTable.isPrimary, true))).limit(1);
      const allImages = productImages.length === 0 ? await db.select().from(productImagesTable).where(eq(productImagesTable.productId, variant.productId ?? "")).limit(1) : productImages;

      subtotal += variant.price * item.quantity;
      resolvedItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
        productId: variant.productId ?? "",
        productName: products[0]?.name ?? "Product",
        variantLabel: `${variant.size} / ${variant.color}`,
        imageUrl: allImages[0]?.url ?? "",
      });
    }

    const shippingCost = subtotal >= 10000 ? 0 : 999;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shippingCost + tax;

    const [order] = await db.insert(ordersTable).values({
      orderNumber: generateOrderNumber(),
      userId,
      status: "confirmed",
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      stripePaymentIntentId,
    }).returning();

    await db.insert(orderItemsTable).values(
      resolvedItems.map(i => ({
        orderId: order.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantLabel: i.variantLabel,
        imageUrl: i.imageUrl,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity,
      }))
    );

    // Decrement stock
    for (const item of resolvedItems) {
      const variant = await db.select().from(productVariantsTable).where(eq(productVariantsTable.id, item.variantId)).limit(1);
      if (variant[0]) {
        await db.update(productVariantsTable)
          .set({ stock: Math.max(0, (variant[0].stock ?? 0) - item.quantity) })
          .where(eq(productVariantsTable.id, item.variantId));
      }
    }

    const mapped = await mapOrder(order);

    // Send confirmation email in background (non-blocking)
    const addr = shippingAddress as { email?: string; fullName: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; };
    const customerEmail = addr.email;
    if (customerEmail) {
      sendOrderConfirmation(
        {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt.toISOString(),
          items: resolvedItems.map(i => ({ productName: i.productName, variantLabel: i.variantLabel, imageUrl: i.imageUrl, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
          shippingAddress: addr,
          subtotal,
          shippingCost,
          tax,
          total,
          trackingNumber: null,
        },
        customerEmail,
      ).catch(() => {});
    }

    res.status(201).json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:userId", async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
    const mapped = await Promise.all(orders.map(mapOrder));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to get user orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (orders.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(await mapOrder(orders[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { mapOrder };
export default router;
