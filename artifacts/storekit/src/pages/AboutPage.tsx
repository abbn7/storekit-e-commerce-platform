import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useGetStoreConfig } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function AboutPage() {
  const { data: config } = useGetStoreConfig();

  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden bg-muted">
        <img
          src="https://picsum.photos/seed/about-hero/1400/900"
          alt="About"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-5xl lg:text-7xl font-light text-background text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Story
          </motion.h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">About Us</p>
          <p className="font-display text-2xl lg:text-3xl font-light leading-relaxed text-foreground/80" style={{ fontFamily: "var(--font-display)" }}>
            {config?.aboutText ?? "StoreKit was born from a simple belief: that beautiful things should be made well. We partner with artisan workshops across Portugal, Italy, and Japan to create garments that feel extraordinary — and last."}
          </p>
        </motion.div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {[
            { title: "Craftsmanship", text: "Every piece passes through the hands of skilled artisans who have spent years perfecting their craft. We never rush the process." },
            { title: "Sustainability", text: "We source only natural, traceable fibres — organic cotton, regenerative wool, responsible silk — and we audit every supplier annually." },
            { title: "Transparency", text: "We publish our cost breakdowns. You deserve to know what you are paying for and why it is worth it." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <h3 className="font-display text-xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Editorial image pair */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-4 mb-16"
        >
          <img src="https://picsum.photos/seed/about-1/600/750" alt="" className="w-full aspect-[4/5] object-cover" />
          <img src="https://picsum.photos/seed/about-2/600/750" alt="" className="w-full aspect-[4/5] object-cover mt-12" />
        </motion.div>

        <div className="text-center">
          <Link href="/collections" className="inline-block bg-foreground text-background px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
            Explore the Collection
          </Link>
        </div>
      </div>
    </Layout>
  );
}
