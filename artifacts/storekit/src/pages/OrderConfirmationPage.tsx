import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import { useGetOrder } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

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

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(id ?? "");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
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
          >
            <h1 className="font-display text-4xl lg:text-5xl font-light mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Order Confirmed
            </h1>
            <p className="text-muted-foreground mb-2">Thank you for your order.</p>
            {order && (
              <p className="text-sm font-medium text-accent mb-8">Order #{order.orderNumber}</p>
            )}

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
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="inline-block border border-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-muted transition-colors">
                View Orders
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
