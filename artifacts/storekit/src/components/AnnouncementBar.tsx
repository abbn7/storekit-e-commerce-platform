import { useGetStoreConfig } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function AnnouncementBar() {
  const { data: config } = useGetStoreConfig();
  const [location] = useLocation();

  if (location.startsWith("/admin")) return null;

  const text = config?.announcementText ?? "Free shipping on orders over $100 · New arrivals every week · Sustainably made";

  return (
    <div className="bg-foreground text-background overflow-hidden py-2.5 fixed top-0 left-0 right-0 z-50">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-[11px] tracking-[0.2em] uppercase mr-16" style={{ fontFamily: "var(--font-body)" }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
