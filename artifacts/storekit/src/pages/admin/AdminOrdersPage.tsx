import { useState } from "react";
import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminListOrders } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  useAdminGuard();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminListOrders({ page: String(page), pageSize: "20", status } as any);
  const orders = (data as any)?.orders ?? [];

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center justify-between mb-6">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-border rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">All statuses</option>
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">{(data as any)?.total ?? 0} orders total</p>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Order", "Date", "Customer", "Items", "Status", "Total", ""].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium tracking-wide uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>)}</tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No orders found</td></tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.shippingAddress?.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-[0.1em] px-2 py-0.5 uppercase rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-accent hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(data as any)?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">Page {page} of {(data as any).totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-border hover:bg-muted disabled:opacity-40 text-xs">Previous</button>
            <button onClick={() => setPage(p => Math.min((data as any).totalPages, p + 1))} disabled={page === (data as any).totalPages} className="px-3 py-1.5 border border-border hover:bg-muted disabled:opacity-40 text-xs">Next</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
