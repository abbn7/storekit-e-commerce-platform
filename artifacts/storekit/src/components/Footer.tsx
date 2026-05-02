import { Link } from "wouter";
import { useGetStoreConfig } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Footer() {
  const { data: config } = useGetStoreConfig();
  const [email, setEmail] = useState("");
  const [location] = useLocation();

  if (location.startsWith("/admin")) return null;

  return (
    <footer className="bg-foreground text-background mt-20">
      {/* Marquee strip */}
      <div className="border-b border-background/10 overflow-hidden py-4">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-xs tracking-[0.3em] uppercase text-background/40 mr-16 font-accent" style={{ fontFamily: "var(--font-accent)" }}>
              CRAFTED WITH INTENTION · FREE RETURNS · WORLDWIDE SHIPPING · SUSTAINABLY MADE · PREMIUM MATERIALS · HANDCRAFTED DETAILS ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-accent text-2xl tracking-[0.2em] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
              {config?.storeName ?? "STOREKIT"}
            </div>
            <p className="text-sm text-background/50 leading-relaxed max-w-xs">
              {config?.storeTagline ?? "Crafted for the conscious few."}
            </p>
            <div className="flex gap-4 mt-6">
              {config?.socialLinks && Object.entries(config.socialLinks as Record<string, string>).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-background/40 hover:text-background/70 transition-colors">
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6 font-medium">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "New Arrivals", href: "/collections/new-arrivals" },
                { label: "Collections", href: "/collections" },
                { label: "Outerwear", href: "/collections/outerwear" },
                { label: "Essentials", href: "/collections/essentials" },
                { label: "Knitwear", href: "/collections/knitwear" },
                { label: "Accessories", href: "/collections/accessories" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6 font-medium">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Account", href: "/account" },
                { label: "Orders", href: "/account/orders" },
                { label: "Wishlist", href: "/account/wishlist" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6 font-medium">Stay in touch</h4>
            <p className="text-sm text-background/50 mb-4 leading-relaxed">Early access, new arrivals, and the occasional story worth reading.</p>
            <form onSubmit={(e) => { e.preventDefault(); setEmail(""); }} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-transparent border border-background/20 px-4 py-3 text-sm text-background placeholder:text-background/30 focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground px-4 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-accent/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/30">
            &copy; {new Date().getFullYear()} {config?.storeName ?? "StoreKit"}. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            {["Privacy", "Terms", "Returns", "Contact"].map(item => (
              <a key={item} href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors tracking-wide">
                {item}
              </a>
            ))}
            <Link href="/admin" className="text-xs text-background/20 hover:text-background/50 transition-colors tracking-[0.15em] uppercase border-l border-background/10 pl-6">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
