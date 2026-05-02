import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart,
  Settings, FileText, BarChart2, LogOut, ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";

const navItems = [
  { label: "Dashboard",   href: "/admin",              icon: LayoutDashboard },
  { label: "Products",    href: "/admin/products",     icon: Package },
  { label: "Collections", href: "/admin/collections",  icon: FolderOpen },
  { label: "Orders",      href: "/admin/orders",       icon: ShoppingCart },
  { label: "Analytics",   href: "/admin/analytics",    icon: BarChart2 },
  { label: "Content",     href: "/admin/content",      icon: FileText },
  { label: "Settings",    href: "/admin/settings",     icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const adminLogout = useAdminLogout();

  async function handleLogout() {
    await adminLogout.mutateAsync();
    localStorage.removeItem("sk-admin-session");
    setLocation("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-[hsl(222,18%,6%)]">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-60 flex flex-col flex-shrink-0 relative">
        {/* Glass border right */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Logo */}
        <div className="px-5 py-7">
          <Link href="/admin">
            <div className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-[hsl(38,52%,60%)] to-[hsl(38,52%,42%)] flex items-center justify-center shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="font-accent text-[15px] tracking-[0.18em] text-white/90" style={{ fontFamily: "var(--font-accent)" }}>
                  STOREKIT
                </span>
                <p className="text-[9px] tracking-[0.12em] uppercase text-white/30 -mt-0.5">Admin Panel</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-[8px] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-white font-medium shadow-sm"
                      : "text-white/45 hover:text-white/80 hover:bg-white/6"
                  }`}
                >
                  <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? "text-[hsl(38,52%,62%)]" : ""}`} />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1 h-1 rounded-full bg-[hsl(38,52%,62%)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/6 space-y-0.5">
          <Link href="/">
            <div className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/35 hover:text-white/65 transition-colors cursor-pointer rounded-[8px] hover:bg-white/5">
              <ExternalLink className="w-[13px] h-[13px]" />
              View Storefront
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-white/35 hover:text-white/65 transition-colors rounded-[8px] hover:bg-white/5"
          >
            <LogOut className="w-[13px] h-[13px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[hsl(30,18%,98%)] rounded-l-2xl overflow-hidden shadow-2xl">
        {/* Topbar */}
        <header className="h-[60px] border-b border-border/60 flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl">
          <div>
            <h1 className="text-[15px] font-medium tracking-wide text-foreground">{title}</h1>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
