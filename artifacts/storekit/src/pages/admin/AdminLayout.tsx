import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart,
  Settings, FileText, BarChart2, LogOut, ChevronRight
} from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Collections", href: "/admin/collections", icon: FolderOpen },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const adminLogout = useAdminLogout();

  async function handleLogout() {
    await adminLogout.mutateAsync();
    localStorage.removeItem("sk-admin-session");
    setLocation("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">
        <div className="px-6 py-8 border-b border-sidebar-border">
          <Link href="/admin">
            <span className="font-accent text-xl tracking-[0.2em] text-sidebar-foreground" style={{ fontFamily: "var(--font-accent)" }}>
              STOREKIT
            </span>
            <p className="text-[10px] tracking-[0.15em] uppercase text-sidebar-foreground/40 mt-1">Admin Panel</p>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors mb-1">
            <ChevronRight className="w-3.5 h-3.5" />
            View Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-8 bg-background flex-shrink-0">
          <h1 className="font-medium text-sm tracking-wide">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
