import { useParams } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminGetOrder, useAdminUpdateOrder } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrderDetailPage() {
  useAdminGuard();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, refetch } = useAdminGetOrder(id ?? "");
  const updateOrder = useAdminUpdateOrder();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    await updateOrder.mutateAsync({ id: id!, data: { status: newStatus } });
    toast({ title: "Order updated" });
    refetch();
    setUpdating(false);
  }

  if (isLoading) {
    return <AdminLayout title="Order Detail"><div className="h-64 bg-muted animate-pulse rounded" /></AdminLayout>;
  }

  if (!order) {
    return <AdminLayout title="Order Detail"><p className="text-muted-foreground">Order not found</p></AdminLayout>;
  }

  return (
    <AdminLayout title={`Order #${(order as any).orderNumber}`}>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-card border border-border p-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">Order Number</p>
            <p className="text-2xl font-light">#{(order as any).orderNumber}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date((order as any).createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={(order as any).status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updating}
              className="border border-border rounded px-3 py-2 text-sm bg-background capitalize"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-card border border-border p-6">
            <h2 className="text-sm font-medium tracking-wide mb-4">Order Items</h2>
            <div className="space-y-4">
              {(order as any).items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice((order as any).subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice((order as any).shippingCost ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice((order as any).tax ?? 0)}</span></div>
              <div className="flex justify-between font-medium border-t border-border pt-2"><span>Total</span><span>{formatPrice((order as any).total)}</span></div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card border border-border p-6">
            <h2 className="text-sm font-medium tracking-wide mb-4">Shipping Address</h2>
            {(order as any).shippingAddress && (
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground">{(order as any).shippingAddress.fullName}</p>
                <p>{(order as any).shippingAddress.line1}</p>
                {(order as any).shippingAddress.line2 && <p>{(order as any).shippingAddress.line2}</p>}
                <p>{(order as any).shippingAddress.city}, {(order as any).shippingAddress.state} {(order as any).shippingAddress.postalCode}</p>
                <p>{(order as any).shippingAddress.country}</p>
                {(order as any).shippingAddress.phone && <p>{(order as any).shippingAddress.phone}</p>}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
              <p className="text-sm font-mono text-muted-foreground">{(order as any).stripePaymentIntentId}</p>
            </div>
            {(order as any).trackingNumber && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tracking</p>
                <p className="text-sm font-medium">{(order as any).trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
