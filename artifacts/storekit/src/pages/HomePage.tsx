import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
import { Star } from "lucide-react";

function AnnouncementMarquee({ text }: { text: string }) {
  const fullText = `${text} · `;
  return (
    <div className="bg-foreground text-background overflow-hidden py-2.5">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-[11px] tracking-[0.2em] uppercase mr-12 text-background/70">
            {fullText}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ config }: { config: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const heading = config?.heroHeading ?? "The New\nSeason\nAwaits";
  const words = heading.split(/\s+/);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={getProductImage(config?.heroImageUrl, "hero")}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="overflow-hidden mb-6">
              <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-4"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-base lg:text-lg text-foreground/70 max-w-md leading-relaxed mb-10"
            >
              {config?.heroSubheading ?? "Thoughtfully designed for those who move through the world with intention."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/collections/new-arrivals"
                className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors"
              >
                Shop New Arrivals
              </Link>
              <Link
                href="/collections"
                className="inline-block border border-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                View Collections
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-foreground/30"
        />
      </motion.div>
    </section>
  );
}

function FeaturedCollections({ collections }: { collections: any[] }) {
  const featured = collections.filter(c => c.isFeatured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-10"
      >
        <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ fontFamily: "var(--font-display)" }}>
          Collections
        </h2>
        <Link href="/collections" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
          View All
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {featured.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`relative overflow-hidden group ${i === 0 ? "md:row-span-2 md:col-span-1" : ""}`}
          >
            <Link href={`/collections/${col.slug}`}>
              <div className={`${i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"} overflow-hidden bg-muted`}>
                <img
                  src={getProductImage(col.imageUrl, col.id)}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/10 transition-colors duration-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs tracking-[0.2em] uppercase text-background/70 mb-1">
                  {col.productCount} pieces
                </p>
                <h3 className="font-accent text-2xl text-background tracking-[0.1em]" style={{ fontFamily: "var(--font-accent)" }}>
                  {col.name.toUpperCase()}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MarqueeSection() {
  return (
    <div className="bg-foreground py-6 overflow-hidden my-8">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="font-accent text-2xl tracking-[0.3em] text-background/30 mr-16" style={{ fontFamily: "var(--font-accent)" }}>
            CRAFTED WITH INTENTION · FREE RETURNS · WORLDWIDE SHIPPING · SUSTAINABLY MADE · PREMIUM MATERIALS · HANDCRAFTED DETAILS ·&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductsSection({ title, products, href }: { title: string; products: any[]; href: string }) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-10"
      >
        <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        <Link href={href} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
          View All
        </Link>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
      </div>
    </section>
  );
}

function PromoSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="aspect-[4/5] overflow-hidden bg-muted"
        >
          <img
            src="https://picsum.photos/seed/promo-look/700/875"
            alt="Lookbook"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-lg"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">New Season</p>
          <h2 className="font-display text-5xl lg:text-6xl font-light leading-[1.1] mb-6" style={{ fontFamily: "var(--font-display)" }}>
            New Season,<br />New Story
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Every season we return to the question of what clothes actually need to do. The answers shape garments that age well, wear beautifully, and mean something.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors"
          >
            Explore the Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-muted py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl lg:text-5xl font-light text-center mb-16" style={{ fontFamily: "var(--font-display)" }}
        >
          From Our Community
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-background p-8"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-display text-lg font-light leading-relaxed mb-6 italic" style={{ fontFamily: "var(--font-display)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium">{t.authorName}</p>
                {t.authorLocation && (
                  <p className="text-xs text-muted-foreground mt-0.5">{t.authorLocation}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
      <MarqueeSection />
      <ProductsSection title="New Arrivals" products={newArrivals} href="/collections/new-arrivals" />
      <PromoSection />
      <ProductsSection title="Best Sellers" products={featuredProducts} href="/collections" />
      <TestimonialsSection testimonials={testimonials ?? []} />
      <Footer />
    </Layout>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="font-accent text-2xl tracking-[0.2em] mb-4" style={{ fontFamily: "var(--font-accent)" }}>
              STOREKIT
            </div>
            <p className="text-sm text-background/50 leading-relaxed max-w-xs">
              Crafted for the conscious few.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6">Shop</h4>
            <ul className="space-y-3">
              {[["New Arrivals", "/collections/new-arrivals"], ["Collections", "/collections"], ["Outerwear", "/collections/outerwear"], ["Essentials", "/collections/essentials"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-sm text-background/60 hover:text-background transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6">Company</h4>
            <ul className="space-y-3">
              {[["About Us", "/about"], ["Account", "/account"], ["Orders", "/account/orders"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-sm text-background/60 hover:text-background transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-6">Stay in touch</h4>
            <p className="text-sm text-background/50 mb-4 leading-relaxed">Early access, new arrivals, and the occasional story worth reading.</p>
            <div className="flex flex-col gap-2">
              <input type="email" placeholder="your@email.com" className="bg-transparent border border-background/20 px-4 py-3 text-sm text-background placeholder:text-background/30 focus:outline-none focus:border-accent" />
              <button className="bg-accent text-accent-foreground px-4 py-3 text-xs tracking-[0.15em] uppercase">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/30">&copy; {new Date().getFullYear()} StoreKit. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Returns"].map(i => (
              <a key={i} href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors">{i}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
