import { motion } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { useUser } from "@clerk/react";
import { useGetUserOrders } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrdersContent() {
  const { user } = useUser();
  const { data: orders, isLoading } = useGetUserOrders(user?.id ?? "", {
    query: { enabled: !!user?.id },
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-10">
            <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Account</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Orders</span>
          </div>
          <h1 className="font-display text-4xl font-light mb-10" style={{ fontFamily: "var(--font-display)" }}>My Orders</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse" />)}
            </div>
          ) : !orders || (orders as any[]).length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-2xl font-light text-muted-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>No orders yet</p>
              <Link href="/collections" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(orders as any[]).map((order: any, i: number) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border border-border p-6 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      <p className="font-medium text-sm mt-2">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

export default function AccountOrdersPage() {
  return <AuthGuard><OrdersContent /></AuthGuard>;
}
