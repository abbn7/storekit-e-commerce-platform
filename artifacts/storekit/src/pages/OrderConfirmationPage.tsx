import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import { useGetOrder } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";
import { luxury } from "@/lib/animations";

function CheckmarkSVG() {
  return (
    <svg viewBox="0 0 52 52" className="w-20 h-20">
      <motion.circle
        cx="26" cy="26" r="25"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M14 26 L22 34 L38 18"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

const ORDER_STEPS = [
  { key: "pending",    label: "Order Placed",    icon: Clock,         desc: "We've received your order" },
  { key: "confirmed",  label: "Confirmed",        icon: CheckCircle2,  desc: "Payment verified" },
  { key: "processing", label: "Processing",       icon: Package,       desc: "Being prepared for shipment" },
  { key: "shipped",    label: "Shipped",          icon: Truck,         desc: "On its way to you" },
  { key: "delivered",  label: "Delivered",        icon: MapPin,        desc: "Arrived at destination" },
];

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STEPS.findIndex((s) => s.key === status);
  const activeIdx = currentIdx < 0 ? 0 : currentIdx;

  return (
    <div className="text-left">
      <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">Order Status</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-5 bottom-5 w-px bg-border" />
        <motion.div
          className="absolute left-4 top-5 w-px bg-accent origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: activeIdx / Math.max(ORDER_STEPS.length - 1, 1) }}
          transition={{ duration: 1, ease: luxury, delay: 0.6 }}
          style={{ height: "calc(100% - 40px)" }}
        />

        <div className="space-y-6">
          {ORDER_STEPS.map((step, i) => {
            const done = i <= activeIdx;
            const current = i === activeIdx;
            const Icon = step.icon;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.4, ease: luxury }}
                className="flex items-start gap-4 relative"
              >
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                  done
                    ? "bg-accent border-accent"
                    : "bg-background border-border"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${done ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  {current && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-accent/20"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </div>
                <div className="pt-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {step.label}
                    {current && <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-accent font-normal">Current</span>}
                  </p>
                  <p className={`text-xs mt-0.5 ${done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(id ?? "");

  const addr = order?.shippingAddress as any;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <CheckmarkSVG />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-light mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Order Confirmed
            </h1>
            <p className="text-muted-foreground mb-2">Thank you — your order has been placed.</p>
            {order && (
              <p className="text-sm font-medium text-accent mb-10">Order #{order.orderNumber}</p>
            )}

            {order && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left mb-10">

                {/* Order details */}
                <div className="bg-card border border-border p-6 space-y-4">
                  <h2 className="text-xs tracking-[0.2em] uppercase font-medium">Items</h2>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.variantLabel} × {item.quantity}</p>
                        </div>
                        <span className="flex-shrink-0">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span><span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax</span><span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                      <span>Total</span><span>{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Shipping address */}
                  {addr && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Ship To</p>
                      <p className="text-sm">{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-muted-foreground">{addr.country}</p>
                    </div>
                  )}

                  {/* Tracking */}
                  {order.trackingNumber && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">Tracking</p>
                      <p className="text-sm font-mono font-medium">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-card border border-border p-6">
                  <OrderTimeline status={order.status} />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="space-y-3 mb-10">
                {[1, 2, 3].map((i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="inline-block border border-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-muted transition-colors">
                View All Orders
              </Link>
              <Link href="/collections" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
