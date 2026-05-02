import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useAdminListCollections, useAdminDeleteCollection } from "@workspace/api-client-react";
import { getProductImage } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCollectionsPage() {
  useAdminGuard();
  const { toast } = useToast();
  const { data: collections, isLoading, refetch } = useAdminListCollections();
  const deleteCollection = useAdminDeleteCollection();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteCollection.mutateAsync({ id });
    toast({ title: "Collection deleted" });
    refetch();
  }

  return (
    <AdminLayout title="Collections">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm text-muted-foreground">{(collections ?? []).length} collections</h2>
        <Link href="/admin/collections/new">
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.1em] uppercase hover:bg-foreground/80 transition-colors">
            <Plus className="w-4 h-4" /> New Collection
          </button>
        </Link>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Collection", "Products", "Featured", "Sort", "Actions"].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium tracking-wide uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(5)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>)}</tr>
              ))
            ) : (collections ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No collections found</td></tr>
            ) : (
              (collections ?? []).map((col: any) => (
                <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted overflow-hidden flex-shrink-0">
                        <img src={getProductImage(col.imageUrl, col.id)} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-xs">{col.name}</p>
                        <p className="text-xs text-muted-foreground">{col.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{col.productCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${col.isFeatured ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {col.isFeatured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{col.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/collections/${col.id}/edit`}>
                        <button className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      </Link>
                      <button onClick={() => handleDelete(col.id, col.name)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors">
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
    </AdminLayout>
  );
}
