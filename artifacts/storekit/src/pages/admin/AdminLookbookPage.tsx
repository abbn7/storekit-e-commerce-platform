import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAdminGuard } from "./useAdminGuard";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, Tag } from "lucide-react";

interface LookbookEntry {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  season: string;
  sortOrder: number;
  isActive: boolean;
  tags: { id: string }[];
}

async function adminFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`/api/admin/lookbook${path}`, {
    ...opts,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminLookbookPage() {
  useAdminGuard();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ lookbook: LookbookEntry[] }>({
    queryKey: ["admin-lookbook"],
    queryFn: () => adminFetch("/"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminFetch(`/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-lookbook"] }),
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => adminFetch(`/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lookbook"] });
      toast({ title: "Entry deleted" });
    },
  });

  const entries = data?.lookbook ?? [];

  return (
    <AdminLayout title="Lookbook" subtitle="Manage editorial content and shoppable product tags">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        <Link href="/admin/lookbook/new">
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs tracking-[0.1em] uppercase hover:bg-foreground/80 transition-colors">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </Link>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Image", "Title", "Season", "Tags", "Sort", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium tracking-wide uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>)}</tr>
              ))
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No lookbook entries found</td></tr>
            ) : entries.map(entry => (
              <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-12 h-16 bg-muted overflow-hidden flex-shrink-0">
                    <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-xs">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.subtitle}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono">{entry.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs border border-border/60 px-2 py-0.5 text-muted-foreground">{entry.season || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="w-3 h-3" /> {entry.tags.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{entry.sortOrder}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive.mutate({ id: entry.id, isActive: !entry.isActive })}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 border transition-colors ${entry.isActive ? "border-green-500/40 text-green-600 bg-green-50 dark:bg-green-950/20" : "border-border text-muted-foreground"}`}
                  >
                    {entry.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {entry.isActive ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/lookbook/${entry.id}/edit`}>
                      <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => { if (confirm(`Delete "${entry.title}"?`)) deleteEntry.mutate(entry.id); }}
                      className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
