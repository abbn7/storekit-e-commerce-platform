import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetAnalytics } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function AdminDashboardPage() {
  useAdminGuard();
  const { data: analytics, isLoading } = useAdminGetAnalytics();

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded" />)}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </AdminLayout>
    );
  }

  const stats = [
    { label: "Total Revenue", value: formatPrice(analytics?.totalRevenue ?? 0), icon: DollarSign, sub: "All time" },
    { label: "Total Orders", value: String(analytics?.totalOrders ?? 0), icon: ShoppingBag, sub: "All time" },
    { label: "Active Products", value: String(analytics?.activeProducts ?? 0), icon: Package, sub: "In store" },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-card border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground tracking-wide uppercase">{label}</p>
                <p className="text-3xl font-light mt-2">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <h2 className="text-sm font-medium mb-6">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics?.revenueByDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 100).toFixed(0)}`} />
              <Tooltip formatter={(v: any) => formatPrice(v)} labelStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-accent-gold)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status donut */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-sm font-medium mb-6">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={analytics?.ordersByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
                {(analytics?.ordersByStatus ?? []).map((entry: any) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {(analytics?.ordersByStatus ?? []).map((s: any) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? "#6b7280" }} />
                <span className="capitalize text-muted-foreground">{s.status}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-sm font-medium mb-6">Top Products</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(analytics?.topProducts ?? []).slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: any) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="var(--color-accent-gold)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alerts */}
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-medium">Low Stock Alerts</h2>
          </div>
          {(analytics?.lowStockVariants ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No low stock variants</p>
          ) : (
            <div className="space-y-3">
              {(analytics?.lowStockVariants ?? []).slice(0, 6).map((v: any) => (
                <div key={v.variantId} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-xs">{v.productName}</p>
                    <p className="text-xs text-muted-foreground">{v.size} / {v.color}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
        </div>
        {(analytics?.recentOrders ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Order", "Date", "Status", "Total"].map(h => (
                    <th key={h} className="text-left text-xs text-muted-foreground font-medium tracking-wide uppercase pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(analytics?.recentOrders ?? []).slice(0, 5).map((order: any) => (
                  <tr key={order.id}>
                    <td className="py-3 font-medium">#{order.orderNumber}</td>
                    <td className="py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><span className="capitalize text-xs px-2 py-1 bg-muted rounded">{order.status}</span></td>
                    <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
