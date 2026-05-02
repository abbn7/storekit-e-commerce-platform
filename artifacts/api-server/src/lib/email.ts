import nodemailer from "nodemailer";
import { logger } from "./logger";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
    logger.info("Email: using configured SMTP transport");
  } else {
    // Create an Ethereal test account automatically
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info({ user: testAccount.user }, "Email: using Ethereal test transport");
  }

  return transporter;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function buildOrderConfirmationHtml(order: {
  orderNumber: string;
  createdAt: string;
  items: { productName: string; variantLabel: string; imageUrl: string; quantity: number; price: number; total: number }[];
  shippingAddress: { fullName: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string | null;
}, storeName = "STOREKIT"): string {
  const addr = order.shippingAddress;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const trackingSection = order.trackingNumber
    ? `<p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Tracking: <strong style="color:#1a1a1a;">${order.trackingNumber}</strong></p>`
    : "";

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0ede8;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="64" style="padding-right:14px;vertical-align:top;">
              <div style="width:64px;height:80px;background:#f5f2ee;overflow:hidden;">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.productName}" width="64" height="80" style="object-fit:cover;display:block;width:100%;height:100%;" />` : ""}
              </div>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a1a1a;letter-spacing:0.02em;">${item.productName}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">${item.variantLabel}</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">Qty: ${item.quantity}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">${formatCents(item.total)}</p>
              ${item.quantity > 1 ? `<p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">${formatCents(item.price)} each</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — ${storeName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f4f0;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:300;letter-spacing:0.35em;color:#ffffff;text-transform:uppercase;">${storeName}</p>
              <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.2em;color:#a8956d;text-transform:uppercase;">Order Confirmation</p>
            </td>
          </tr>

          <!-- Hero message -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-bottom:1px solid #f0ede8;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;color:#a8956d;text-transform:uppercase;">Thank you for your order</p>
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#1a1a1a;line-height:1.2;">Your order is confirmed.</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                We've received your order and are preparing it with care. You'll receive a shipping notification once your items are on their way.
              </p>
            </td>
          </tr>

          <!-- Order meta -->
          <tr>
            <td style="background:#faf8f5;padding:20px 40px;border-bottom:1px solid #f0ede8;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.15em;color:#9ca3af;text-transform:uppercase;">Order Number</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;font-family:monospace;">${order.orderNumber}</p>
                  </td>
                  <td style="text-align:right;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.15em;color:#9ca3af;text-transform:uppercase;">Order Date</p>
                    <p style="margin:0;font-size:13px;color:#1a1a1a;">${date}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af;font-weight:600;">Your Items</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${itemRows}
              </table>

              <!-- Totals -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;padding-top:20px;border-top:1px solid #f0ede8;">
                <tr>
                  <td style="padding:3px 0;font-size:13px;color:#6b7280;">Subtotal</td>
                  <td style="padding:3px 0;font-size:13px;color:#1a1a1a;text-align:right;">${formatCents(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;font-size:13px;color:#6b7280;">Shipping</td>
                  <td style="padding:3px 0;font-size:13px;color:#1a1a1a;text-align:right;">${order.shippingCost === 0 ? "Free" : formatCents(order.shippingCost)}</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;font-size:13px;color:#6b7280;">Tax</td>
                  <td style="padding:3px 0;font-size:13px;color:#1a1a1a;text-align:right;">${formatCents(order.tax)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;border-top:1px solid #e5e1db;margin-top:8px;">Total</td>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;border-top:1px solid #e5e1db;">${formatCents(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address + tracking -->
          <tr>
            <td style="background:#faf8f5;padding:24px 40px;border-top:1px solid #f0ede8;border-bottom:1px solid #f0ede8;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:top;padding-right:20px;">
                    <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af;font-weight:600;">Shipping To</p>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a1a1a;">${addr.fullName}</p>
                    <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">${addr.city}, ${addr.state} ${addr.postalCode}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">${addr.country}</p>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af;font-weight:600;">Delivery</p>
                    ${trackingSection}
                    <p style="margin:0;font-size:13px;color:#6b7280;">Estimated 3–7 business days</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;text-align:center;">
              <a href="${process.env.STORE_URL ?? "https://storekit.replit.app"}/order-confirmation/${order.orderNumber}" 
                 style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 36px;">
                View Order Status
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:#a8956d;text-transform:uppercase;">${storeName}</p>
              <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.6;">
                Questions? Reply to this email or visit our help center.<br />
                You're receiving this because you placed an order on ${storeName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBackInStockHtml(data: {
  productName: string;
  variantLabel: string;
  productSlug: string;
  price: number;
}, storeName = "STOREKIT"): string {
  const productUrl = `${process.env.STORE_URL ?? "https://storekit.replit.app"}/products/${data.productSlug}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f7f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f4f0;min-height:100vh;">
    <tr><td align="center" style="padding:40px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
        <tr><td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:300;letter-spacing:0.35em;color:#ffffff;text-transform:uppercase;">${storeName}</p>
          <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.2em;color:#a8956d;text-transform:uppercase;">Back in Stock</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px;text-align:center;border-bottom:1px solid #f0ede8;">
          <p style="margin:0 0 8px;font-size:32px;">🔔</p>
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;color:#a8956d;text-transform:uppercase;">Good news</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:300;color:#1a1a1a;">It's back!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
            <strong style="color:#1a1a1a;">${data.productName}</strong> in <strong style="color:#1a1a1a;">${data.variantLabel}</strong> is back in stock.
            Order soon — it may sell out again quickly.
          </p>
          <p style="margin:0 0 28px;font-size:18px;font-weight:600;color:#1a1a1a;">$${(data.price / 100).toFixed(2)}</p>
          <a href="${productUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 36px;">
            Shop Now
          </a>
        </td></tr>
        <tr><td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#a8956d;text-transform:uppercase;">${storeName}</p>
          <p style="margin:8px 0 0;font-size:11px;color:#6b7280;">You requested this alert. Questions? Contact our support team.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendBackInStockEmail(data: {
  email: string;
  productName: string;
  variantLabel: string;
  productSlug: string;
  price: number;
}, storeName = "STOREKIT"): Promise<void> {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM ?? `"${storeName}" <noreply@storekit.app>`;
    const html = buildBackInStockHtml(data, storeName);
    const info = await transport.sendMail({
      from,
      to: data.email,
      subject: `${data.productName} is back in stock — ${storeName}`,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ previewUrl, email: data.email }, "📧 Back-in-stock email preview (Ethereal)");
    } else {
      logger.info({ messageId: info.messageId }, "📧 Back-in-stock email sent");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send back-in-stock email");
    throw err;
  }
}

export async function sendOrderConfirmation(
  order: Parameters<typeof buildOrderConfirmationHtml>[0],
  customerEmail: string,
  storeName = "STOREKIT",
): Promise<void> {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM ?? `"${storeName}" <orders@storekit.app>`;
    const html = buildOrderConfirmationHtml(order, storeName);

    const info = await transport.sendMail({
      from,
      to: customerEmail,
      subject: `Order Confirmed — ${order.orderNumber}`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ previewUrl, orderNumber: order.orderNumber }, "📧 Email preview (Ethereal test)");
    } else {
      logger.info({ messageId: info.messageId, orderNumber: order.orderNumber }, "📧 Order confirmation email sent");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send order confirmation email");
  }
}
