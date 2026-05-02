import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import { useGetOrder } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Check, Package, Truck, MapPin, Home, Loader2 } from "lucide-react";
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
  { key: "pending",    label: "Order Placed",  icon: Check,   desc: "We've received your order" },
  { key: "confirmed",  label: "Confirmed",     icon: Check,   desc: "Payment verified" },
  { key: "processing", label: "Processing",    icon: Package, desc: "Being prepared for shipment" },
  { key: "shipped",    label: "Shipped",       icon: Truck,   desc: "On its way to you" },
  { key: "delivered",  label: "Delivered",     icon: Home,    desc: "Enjoy your order!" },
];

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

function OrderTimeline({ status, trackingNumber }: { status: string; trackingNumber?: string | null }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="text-left bg-card border border-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-medium tracking-[0.1em] uppercase">Order Status</h2>
        {trackingNumber && (
          <span className="ml-auto text-xs text-muted-foreground">
            Tracking: <span className="font-mono text-foreground">{trackingNumber}</span>
          </span>
        )}
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-[17px] top-5 bottom-5 w-px bg-border" />
        <motion.div
          className="absolute left-[17px] top-5 w-px bg-[hsl(var(--accent))]"
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(0, (currentIndex / (ORDER_STEPS.length - 1))) * 100}%` }}
          transition={{ duration: 1, delay: 0.8, ease: luxury }}
        />

        <div className="space-y-6">
          {ORDER_STEPS.map((step, i) => {
            const isDone = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 + i * 0.1, ease: luxury }}
                className="flex items-start gap-4 relative"
              >
                {/* Dot */}
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                  isDone
                    ? "bg-[hsl(var(--accent))] border-[hsl(var(--accent))]"
                    : "bg-background border-border"
                }`}>
                  {isCurrent && isDone && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[hsl(var(--accent))]/20"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <StepIcon className={`w-4 h-4 ${isDone ? "text-white" : "text-muted-foreground/40"}`} />
                </div>

                {/* Label */}
                <div className="pt-1.5 pb-1">
                  <p className={`text-sm font-medium transition-colors ${isDone ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {step.label}
                    {isCurrent && (
                      <motion.span
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 text-[10px] tracking-[0.1em] uppercase bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] px-2 py-0.5 rounded-full"
                      >
                        Current
                      </motion.span>
                    )}
                  </p>
                  <p className={`text-xs mt-0.5 transition-colors ${isDone ? "text-muted-foreground" : "text-muted-foreground/35"}`}>
                    {step.desc}
                  </p>
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
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
              <p className="text-muted-foreground mb-2">Thank you for your order.</p>
              {order && (
                <p className="text-sm font-medium text-accent mb-8">Order #{order.orderNumber}</p>
              )}

              {/* Order Tracking Timeline */}
              {order && (
                <OrderTimeline
                  status={(order as any).status ?? "pending"}
                  trackingNumber={(order as any).trackingNumber}
                />
              )}

              {/* Order Items */}
              {order && (
                <div className="text-left bg-card border border-border p-6 mb-8">
                  <h2 className="text-sm font-medium tracking-[0.1em] uppercase mb-4">Order Details</h2>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-muted-foreground ml-2">{item.variantLabel}</span>
                          <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                        </div>
                        <span>{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-4 pt-4 space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice((order as any).subtotal ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>{(order as any).shippingCost === 0 ? "Free" : formatPrice((order as any).shippingCost ?? 0)}</span>
                    </div>
                    {(order as any).tax > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatPrice((order as any).tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-border text-base">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
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
        )}
      </div>
    </Layout>
  );
}
