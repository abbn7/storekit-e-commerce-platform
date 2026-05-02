import { useState } from "react";
import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminListProducts, useAdminDeleteProduct } from "@workspace/api-client-react";
import { formatPrice, getProductImage } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductsPage() {
  useAdminGuard();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useAdminListProducts({ page: String(page), pageSize: "20", search, status } as any);
  const deleteProduct = useAdminDeleteProduct();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteProduct.mutateAsync({ id });
    toast({ title: "Product deleted" });
    refetch();
  }

  const products = data?.products ?? [];

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="pl-9 w-64"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-border rounded px-3 py-2 text-sm bg-background"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.1em] uppercase hover:bg-foreground/80 transition-colors">
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </Link>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Product", "Price", "Status", "Variants", "Actions"].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium tracking-wide uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-muted overflow-hidden flex-shrink-0">
                        <img src={getProductImage(p.images?.[0]?.url, p.id)} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-xs">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-[0.1em] px-2 py-0.5 uppercase rounded-full ${
                      p.status === "active" ? "bg-green-100 text-green-700"
                        : p.status === "draft" ? "bg-yellow-100 text-yellow-700"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.variants?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <button className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">Showing {products.length} of {data.total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-border hover:bg-muted disabled:opacity-40 text-xs">Previous</button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 border border-border hover:bg-muted disabled:opacity-40 text-xs">Next</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
