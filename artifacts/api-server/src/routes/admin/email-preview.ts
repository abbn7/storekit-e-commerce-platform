import { Router } from "express";
import { verifyAdminAuth } from "./auth";
import { buildOrderConfirmationHtml } from "../../lib/email";

const router = Router();

router.use((req, res, next) => {
  if (!verifyAdminAuth(req, res)) return;
  next();
});

router.get("/order-confirmation", (req, res): void => {
  const html = buildOrderConfirmationHtml({
    orderNumber: "SK-2025-04821",
    createdAt: new Date().toISOString(),
    items: [
      { productName: "Cashmere Turtleneck", variantLabel: "M / Ivory", imageUrl: "https://picsum.photos/seed/prod1/200/250", quantity: 1, price: 38000, total: 38000 },
      { productName: "Silk Midi Skirt", variantLabel: "S / Sage", imageUrl: "https://picsum.photos/seed/prod2/200/250", quantity: 2, price: 22500, total: 45000 },
    ],
    shippingAddress: { fullName: "Alexandra Chen", line1: "22 Rue du Faubourg Saint-Honoré", city: "Paris", state: "Île-de-France", postalCode: "75008", country: "France" },
    subtotal: 83000,
    shippingCost: 0,
    tax: 6640,
    total: 89640,
    trackingNumber: null,
  });
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
