import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetAnalytics } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", shipped: "#8b5cf6",
  delivered: "#10b981", cancelled: "#ef4444",
};

export default function AdminAnalyticsPage() {
  useAdminGuard();
  const { data: analytics, isLoading } = useAdminGetAnalytics();

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded" />)}
        </div>
      </AdminLayout>
    );
  }

  const avgOrderValue = analytics?.totalOrders ? Math.round((analytics.totalRevenue ?? 0) / analytics.totalOrders) : 0;

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatPrice(analytics?.totalRevenue ?? 0), icon: DollarSign },
            { label: "Total Orders", value: String(analytics?.totalOrders ?? 0), icon: ShoppingBag },
            { label: "Active Products", value: String(analytics?.activeProducts ?? 0), icon: Package },
            { label: "Avg Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-2xl font-light">{value}</p>
            </div>
          ))}
        </div>

        {/* Revenue over time */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-sm font-medium mb-6">Revenue Over Time (30 Days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics?.revenueByDay ?? []}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-gold)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-accent-gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 100).toFixed(0)}`} />
              <Tooltip formatter={(v: any) => formatPrice(v)} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-accent-gold)" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by status */}
          <div className="bg-card border border-border p-6">
            <h2 className="text-sm font-medium mb-6">Orders by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={analytics?.ordersByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {(analytics?.ordersByStatus ?? []).map((entry: any) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          <div className="bg-card border border-border p-6">
            <h2 className="text-sm font-medium mb-6">Top Products by Revenue</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={(analytics?.topProducts ?? []).slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 100).toFixed(0)}`} />
                <YAxis type="category" dataKey="productName" tick={{ fontSize: 10 }} width={130} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: any) => formatPrice(v)} />
                <Bar dataKey="revenue" fill="var(--color-accent-gold)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top products table */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-sm font-medium mb-5">Top Products Detail</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">{["Product", "Units Sold", "Revenue"].map(h => <th key={h} className="text-left text-xs text-muted-foreground pb-3 pr-4">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {(analytics?.topProducts ?? []).map((p: any) => (
                <tr key={p.productId}>
                  <td className="py-3 pr-4 font-medium">{p.productName}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.totalSold}</td>
                  <td className="py-3 font-medium text-accent">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
              {(analytics?.topProducts ?? []).length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-xs">No sales data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
