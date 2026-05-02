import { useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import {
  useGetStoreConfig,
  useListProducts,
  useListCollections,
  useListTestimonials,
} from "@workspace/api-client-react";
import { getProductImage } from "@/lib/utils";
import { Star, ArrowRight } from "lucide-react";
import { luxury, staggerContainer, staggerItem } from "@/lib/animations";

/* ─── Section label ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: luxury }}
      className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4"
    >
      {children}
    </motion.p>
  );
}

/* ─── Reveal heading ─────────────────────────────────────────── */
function RevealHeading({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className="overflow-hidden">
      <motion.h2
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: luxury }}
        className={className}
        style={style}
      >
        {children}
      </motion.h2>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function HeroSection({ config }: { config: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const heading = config?.heroHeading ?? "The New\nSeason\nAwaits";
  const words = heading.split(/\s+/);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={getProductImage(config?.heroImageUrl, "hero")}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: luxury }}
              className="text-[11px] tracking-[0.35em] uppercase text-foreground/60 mb-6"
            >
              {config?.storeTagline ?? "Crafted for the conscious few"}
            </motion.p>

            <h1
              className="font-display text-6xl sm:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {words.map((word: string, i: number) => (
                <span key={i} className="inline-block overflow-hidden mr-4">
                  <motion.span
                    className="inline-block"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.4 + i * 0.13, ease: luxury }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: luxury }}
              className="text-base lg:text-lg text-foreground/65 max-w-md leading-relaxed mb-10"
            >
              {config?.heroSubheading ?? "Thoughtfully designed for those who move through the world with intention."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: luxury }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/collections/new-arrivals"
                className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/85 transition-colors"
              >
                Shop New Arrivals
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link
                href="/collections"
                className="inline-block border border-foreground px-8 py-4 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
              >
                View Collections
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/40">Scroll</span>
        <motion.div
          animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-foreground/30 origin-top"
        />
      </motion.div>
    </section>
  );
}

/* ─── Announcement marquee ───────────────────────────────────── */
function AnnouncementMarquee({ text }: { text: string }) {
  const fullText = `${text} · `;
  return (
    <div className="bg-foreground text-background overflow-hidden py-3 border-y border-foreground/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-[11px] tracking-[0.22em] uppercase mr-14 text-background/65">
            {fullText}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Featured Collections ───────────────────────────────────── */
function FeaturedCollections({ collections }: { collections: any[] }) {
  const featured = collections.filter(c => c.isFeatured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
      <div className="flex items-end justify-between mb-12">
        <div>
          <SectionLabel>Curated Selections</SectionLabel>
          <RevealHeading className="font-display text-4xl lg:text-5xl font-light" style={{ fontFamily: "var(--font-display)" } as any}>
            Collections
          </RevealHeading>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: luxury }}
        >
          <Link href="/collections" className="group flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            View All
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {featured.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: luxury }}
            className={`relative overflow-hidden group ${i === 0 ? "md:row-span-2" : ""}`}
          >
            <Link href={`/collections/${col.slug}`}>
              <div className={`${i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"} overflow-hidden bg-muted`}>
                <motion.img
                  src={getProductImage(col.imageUrl, col.id)}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.7, ease: luxury }}
                />
                <motion.div
                  className="absolute inset-0 bg-foreground/25"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <motion.div
                  initial={{ y: 8, opacity: 0.8 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, ease: luxury }}
                >
                  <p className="text-[10px] tracking-[0.25em] uppercase text-background/60 mb-1.5">
                    {col.productCount} pieces
                  </p>
                  <h3 className="font-accent text-2xl text-background tracking-[0.12em]" style={{ fontFamily: "var(--font-accent)" }}>
                    {col.name.toUpperCase()}
                  </h3>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Moving text strip ──────────────────────────────────────── */
function MovingStrip() {
  const words = ["CRAFTED WITH INTENTION", "FREE RETURNS", "WORLDWIDE SHIPPING", "SUSTAINABLY MADE", "PREMIUM MATERIALS", "HANDCRAFTED DETAILS"];
  return (
    <div className="bg-foreground py-5 overflow-hidden my-4">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="font-accent text-xl lg:text-2xl tracking-[0.3em] text-background/25 mr-10" style={{ fontFamily: "var(--font-accent)" }}>
            {words.join(" · ")} ·&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Products section ───────────────────────────────────────── */
function ProductsSection({ title, subtitle, products, href }: { title: string; subtitle?: string; products: any[]; href: string }) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
      <div className="flex items-end justify-between mb-12">
        <div>
          {subtitle && <SectionLabel>{subtitle}</SectionLabel>}
          <RevealHeading className="font-display text-4xl lg:text-5xl font-light" style={{ fontFamily: "var(--font-display)" } as any}>
            {title}
          </RevealHeading>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: luxury }}
        >
          <Link href={href} className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {products.slice(0, 4).map((p, i) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            name={p.name}
            basePrice={p.basePrice}
            compareAtPrice={p.compareAtPrice}
            images={p.images}
            variants={p.variants}
            isFeatured={p.isFeatured}
            isNewArrival={p.isNewArrival}
            index={i}
          />
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Editorial split ────────────────────────────────────────── */
function EditorialSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: luxury }}
          className="aspect-[4/5] overflow-hidden bg-muted"
        >
          <motion.img
            src="https://picsum.photos/seed/editorial-story/700/875"
            alt="Lookbook"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: luxury }}
          />
        </motion.div>

        <div>
          <SectionLabel>Our Story</SectionLabel>
          <RevealHeading
            className="font-display text-5xl lg:text-6xl font-light leading-[1.08] mb-7"
            style={{ fontFamily: "var(--font-display)" } as any}
          >
            New Season,<br />New Story
          </RevealHeading>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: luxury }}
            className="text-base text-muted-foreground leading-relaxed mb-8 max-w-sm"
          >
            Every season we return to the question of what clothes actually need to do. The answers shape garments that age well, wear beautifully, and mean something.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35, ease: luxury }}
          >
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/85 transition-colors"
            >
              Explore the Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Numbers row ────────────────────────────────────────────── */
function StatsRow() {
  const stats = [
    { number: "12+", label: "Seasons" },
    { number: "100%", label: "Natural Materials" },
    { number: "30", label: "Day Returns" },
    { number: "4.9★", label: "Average Rating" },
  ];
  return (
    <section className="border-y border-border py-14 my-4">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
      >
        {stats.map((s, i) => (
          <motion.div key={i} variants={staggerItem}>
            <p className="font-display text-3xl lg:text-4xl font-light mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{s.number}</p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */
function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-muted py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel>What They Say</SectionLabel>
          <RevealHeading className="font-display text-4xl lg:text-5xl font-light" style={{ fontFamily: "var(--font-display)" } as any}>
            From Our Community
          </RevealHeading>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.slice(0, 3).map((t) => (
            <motion.div
              key={t.id}
              variants={staggerItem}
              className="bg-background p-8 flex flex-col"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: luxury }}
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-display text-lg font-light leading-relaxed mb-6 italic flex-1" style={{ fontFamily: "var(--font-display)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="pt-5 border-t border-border/60">
                <p className="text-sm font-medium">{t.authorName}</p>
                {t.authorLocation && (
                  <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">{t.authorLocation}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-foreground text-background mt-0">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="font-accent text-2xl tracking-[0.22em] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
              STOREKIT
            </div>
            <p className="text-sm text-background/45 leading-relaxed max-w-xs">
              Crafted for the conscious few.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-background/35 mb-6">Shop</h4>
            <ul className="space-y-3">
              {[["New Arrivals", "/collections/new-arrivals"], ["Collections", "/collections"], ["Outerwear", "/collections/outerwear"], ["Essentials", "/collections/essentials"]].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-background/55 hover:text-background transition-colors tracking-wide">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-background/35 mb-6">Company</h4>
            <ul className="space-y-3">
              {[["About Us", "/about"], ["Account", "/account"], ["Orders", "/account/orders"]].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-background/55 hover:text-background transition-colors tracking-wide">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-background/35 mb-6">Stay in touch</h4>
            <p className="text-sm text-background/45 mb-4 leading-relaxed">Early access, new arrivals, and the occasional story worth reading.</p>
            <div className="flex flex-col gap-2">
              <input type="email" placeholder="your@email.com" className="bg-transparent border border-background/15 px-4 py-3 text-sm text-background placeholder:text-background/30 focus:outline-none focus:border-accent transition-colors" />
              <button className="bg-accent text-accent-foreground px-4 py-3 text-[11px] tracking-[0.18em] uppercase hover:bg-accent/85 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/25">&copy; {new Date().getFullYear()} StoreKit. All rights reserved.</p>
          <div className="flex gap-6 items-center">
            {["Privacy", "Terms", "Returns"].map(i => (
              <a key={i} href="#" className="text-xs text-background/25 hover:text-background/55 transition-colors">{i}</a>
            ))}
            <Link href="/admin" className="text-xs text-background/15 hover:text-background/40 transition-colors tracking-[0.15em] uppercase border-l border-background/10 pl-6">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function HomePage() {
  const { data: config } = useGetStoreConfig();
  const { data: productsData } = useListProducts({ status: "active", featured: "true", pageSize: "8" } as any);
  const { data: newArrivalsData } = useListProducts({ status: "active", newArrival: "true", pageSize: "8" } as any);
  const { data: collections } = useListCollections();
  const { data: testimonials } = useListTestimonials();

  const featuredProducts = productsData?.products ?? [];
  const newArrivals = newArrivalsData?.products ?? [];

  return (
    <Layout noFooter>
      <div className="-mt-[calc(40px+80px)]">
        <HeroSection config={config} />
      </div>
      <AnnouncementMarquee text={config?.announcementText ?? "Free shipping over $100 · New arrivals weekly · 30-day returns"} />
      <FeaturedCollections collections={collections ?? []} />
      <MovingStrip />
      <ProductsSection title="New Arrivals" subtitle="Just Landed" products={newArrivals} href="/collections/new-arrivals" />
      <StatsRow />
      <EditorialSection />
      <ProductsSection title="Best Sellers" subtitle="Fan Favourites" products={featuredProducts} href="/collections" />
      <TestimonialsSection testimonials={testimonials ?? []} />
      <Footer />
    </Layout>
  );
}
