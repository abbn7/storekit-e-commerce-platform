import { db } from "@workspace/db";
import {
  storeConfigTable,
  collectionsTable,
  productsTable,
  productImagesTable,
  productVariantsTable,
  productCollectionsTable,
  productTagsTable,
  testimonialsTable,
  bannersTable,
} from "@workspace/db";

const PICSUM_BASE = "https://picsum.photos/seed";

async function seed() {
  console.log("Seeding database...");

  // Store config
  await db.insert(storeConfigTable).values({
    storeName: "StoreKit",
    storeTagline: "Crafted for the conscious few.",
    primaryColor: "#0f0f0f",
    secondaryColor: "#faf9f7",
    accentColor: "#c9a96e",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    heroHeading: "The New\nSeason\nAwaits",
    heroSubheading: "Thoughtfully designed for those who move through the world with intention.",
    heroImageUrl: `${PICSUM_BASE}/fashion-hero/800/1000`,
    announcementText: "Free shipping on orders over $100 · New arrivals every week · Sustainably made",
    shippingThreshold: 10000,
    contactEmail: "hello@storekit.shop",
    returnPolicy: "We accept returns within 30 days of purchase. Items must be unworn and in original condition with tags attached.",
    aboutText: "StoreKit was born from a simple belief: that beautiful things should be made well. We partner with artisan workshops across Portugal, Italy, and Japan to create garments that feel extraordinary — and last.",
    socialLinks: {
      instagram: "https://instagram.com/storekit",
      twitter: "https://twitter.com/storekit",
    },
  }).onConflictDoNothing();

  // Collections
  const collections = await db.insert(collectionsTable).values([
    {
      slug: "new-arrivals",
      name: "New Arrivals",
      description: "The latest additions to our collection.",
      imageUrl: `${PICSUM_BASE}/collection-new/600/750`,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "essentials",
      name: "Essentials",
      description: "Timeless pieces that anchor every wardrobe.",
      imageUrl: `${PICSUM_BASE}/collection-essentials/600/750`,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      slug: "outerwear",
      name: "Outerwear",
      description: "Refined coats and jackets for every season.",
      imageUrl: `${PICSUM_BASE}/collection-outer/600/750`,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      slug: "knitwear",
      name: "Knitwear",
      description: "Handcrafted knits with exceptional texture.",
      imageUrl: `${PICSUM_BASE}/collection-knit/600/750`,
      isFeatured: false,
      sortOrder: 4,
    },
    {
      slug: "accessories",
      name: "Accessories",
      description: "The finishing details that complete the look.",
      imageUrl: `${PICSUM_BASE}/collection-acc/600/750`,
      isFeatured: false,
      sortOrder: 5,
    },
  ]).returning();

  const getCol = (slug: string) => collections.find(c => c.slug === slug)!;

  // Products
  const productData = [
    {
      slug: "oversized-merino-coat",
      name: "Oversized Merino Coat",
      description: "A generous, enveloping coat in 100% fine merino wool. The oversized silhouette creates a sculptural presence while maintaining effortless wearability. Fully lined in silk habotai.",
      shortDescription: "Fine merino wool, oversized silhouette, silk-lined.",
      basePrice: 89500,
      compareAtPrice: null,
      status: "active",
      isFeatured: true,
      isNewArrival: true,
      material: "100% Fine Merino Wool (outer), 100% Silk Habotai (lining)",
      careInstructions: "Dry clean only. Store folded, never hung.",
      images: [
        { url: `${PICSUM_BASE}/coat1a/800/1000`, alt: "Oversized Merino Coat front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/coat1b/800/1000`, alt: "Oversized Merino Coat back", isPrimary: false, sortOrder: 1 },
        { url: `${PICSUM_BASE}/coat1c/800/1000`, alt: "Oversized Merino Coat detail", isPrimary: false, sortOrder: 2 },
      ],
      variants: [
        { size: "XS", color: "Camel", colorHex: "#C19A6B", sku: "MC-XS-CAM", stock: 3, price: 89500 },
        { size: "S", color: "Camel", colorHex: "#C19A6B", sku: "MC-S-CAM", stock: 6, price: 89500 },
        { size: "M", color: "Camel", colorHex: "#C19A6B", sku: "MC-M-CAM", stock: 8, price: 89500 },
        { size: "L", color: "Camel", colorHex: "#C19A6B", sku: "MC-L-CAM", stock: 5, price: 89500 },
        { size: "XS", color: "Slate", colorHex: "#708090", sku: "MC-XS-SLT", stock: 2, price: 89500 },
        { size: "S", color: "Slate", colorHex: "#708090", sku: "MC-S-SLT", stock: 4, price: 89500 },
        { size: "M", color: "Slate", colorHex: "#708090", sku: "MC-M-SLT", stock: 6, price: 89500 },
        { size: "L", color: "Slate", colorHex: "#708090", sku: "MC-L-SLT", stock: 3, price: 89500 },
      ],
      collectionSlugs: ["new-arrivals", "outerwear"],
      tags: ["wool", "coat", "outerwear", "featured"],
    },
    {
      slug: "silk-slip-dress",
      name: "Silk Slip Dress",
      description: "Cut from the finest Charmeuse silk in a bias cut that moves with the body. A quietly sensual piece that transitions from day to evening with ease. Adjustable spaghetti straps, side zip.",
      shortDescription: "100% Charmeuse silk, bias cut, adjustable straps.",
      basePrice: 42500,
      compareAtPrice: 52500,
      status: "active",
      isFeatured: true,
      isNewArrival: false,
      material: "100% Silk Charmeuse",
      careInstructions: "Hand wash cold or dry clean. Lay flat to dry.",
      images: [
        { url: `${PICSUM_BASE}/silk1a/800/1000`, alt: "Silk Slip Dress front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/silk1b/800/1000`, alt: "Silk Slip Dress side", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "XS", color: "Ivory", colorHex: "#FFFFF0", sku: "SD-XS-IVY", stock: 5, price: 42500, compareAtPrice: 52500 },
        { size: "S", color: "Ivory", colorHex: "#FFFFF0", sku: "SD-S-IVY", stock: 8, price: 42500, compareAtPrice: 52500 },
        { size: "M", color: "Ivory", colorHex: "#FFFFF0", sku: "SD-M-IVY", stock: 6, price: 42500, compareAtPrice: 52500 },
        { size: "L", color: "Ivory", colorHex: "#FFFFF0", sku: "SD-L-IVY", stock: 3, price: 42500, compareAtPrice: 52500 },
        { size: "XS", color: "Midnight", colorHex: "#191970", sku: "SD-XS-MID", stock: 4, price: 42500, compareAtPrice: 52500 },
        { size: "S", color: "Midnight", colorHex: "#191970", sku: "SD-S-MID", stock: 7, price: 42500, compareAtPrice: 52500 },
        { size: "M", color: "Midnight", colorHex: "#191970", sku: "SD-M-MID", stock: 5, price: 42500, compareAtPrice: 52500 },
        { size: "L", color: "Midnight", colorHex: "#191970", sku: "SD-L-MID", stock: 2, price: 42500, compareAtPrice: 52500 },
      ],
      collectionSlugs: ["essentials"],
      tags: ["silk", "dress", "sale"],
    },
    {
      slug: "ribbed-cashmere-turtleneck",
      name: "Ribbed Cashmere Turtleneck",
      description: "A perennial wardrobe anchor in Grade-A Mongolian cashmere. Finely ribbed through the body with a relaxed turtleneck that folds gently. The weight and drape make it unlike any cashmere you have worn before.",
      shortDescription: "Grade-A Mongolian cashmere, ribbed, relaxed fit.",
      basePrice: 31500,
      compareAtPrice: null,
      status: "active",
      isFeatured: true,
      isNewArrival: true,
      material: "100% Grade-A Mongolian Cashmere (12-ply)",
      careInstructions: "Hand wash cold with wool detergent. Reshape and lay flat to dry.",
      images: [
        { url: `${PICSUM_BASE}/cashmere1a/800/1000`, alt: "Ribbed Cashmere Turtleneck", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/cashmere1b/800/1000`, alt: "Ribbed Cashmere Turtleneck detail", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "XS", color: "Oat", colorHex: "#DDD5C8", sku: "CT-XS-OAT", stock: 10, price: 31500 },
        { size: "S", color: "Oat", colorHex: "#DDD5C8", sku: "CT-S-OAT", stock: 12, price: 31500 },
        { size: "M", color: "Oat", colorHex: "#DDD5C8", sku: "CT-M-OAT", stock: 9, price: 31500 },
        { size: "L", color: "Oat", colorHex: "#DDD5C8", sku: "CT-L-OAT", stock: 6, price: 31500 },
        { size: "XL", color: "Oat", colorHex: "#DDD5C8", sku: "CT-XL-OAT", stock: 4, price: 31500 },
        { size: "XS", color: "Anthracite", colorHex: "#363636", sku: "CT-XS-ANT", stock: 8, price: 31500 },
        { size: "S", color: "Anthracite", colorHex: "#363636", sku: "CT-S-ANT", stock: 11, price: 31500 },
        { size: "M", color: "Anthracite", colorHex: "#363636", sku: "CT-M-ANT", stock: 9, price: 31500 },
        { size: "L", color: "Anthracite", colorHex: "#363636", sku: "CT-L-ANT", stock: 5, price: 31500 },
      ],
      collectionSlugs: ["new-arrivals", "knitwear", "essentials"],
      tags: ["cashmere", "knit", "turtleneck", "featured"],
    },
    {
      slug: "wide-leg-linen-trousers",
      name: "Wide-Leg Linen Trousers",
      description: "Generously cut in washed Belgian linen that softens with each wear. High-rise waist with a wide, floor-grazing leg. Elasticated back waistband for comfort. Two side pockets, one back pocket.",
      shortDescription: "Washed Belgian linen, high-rise, elasticated back.",
      basePrice: 24500,
      compareAtPrice: null,
      status: "active",
      isFeatured: false,
      isNewArrival: true,
      material: "100% Washed Belgian Linen",
      careInstructions: "Machine wash cool on gentle cycle. Line dry or tumble dry low.",
      images: [
        { url: `${PICSUM_BASE}/linen1a/800/1000`, alt: "Wide-Leg Linen Trousers front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/linen1b/800/1000`, alt: "Wide-Leg Linen Trousers detail", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "XS", color: "Natural", colorHex: "#E8DCC8", sku: "LT-XS-NAT", stock: 7, price: 24500 },
        { size: "S", color: "Natural", colorHex: "#E8DCC8", sku: "LT-S-NAT", stock: 10, price: 24500 },
        { size: "M", color: "Natural", colorHex: "#E8DCC8", sku: "LT-M-NAT", stock: 8, price: 24500 },
        { size: "L", color: "Natural", colorHex: "#E8DCC8", sku: "LT-L-NAT", stock: 5, price: 24500 },
        { size: "XS", color: "Sage", colorHex: "#9CAF88", sku: "LT-XS-SAG", stock: 4, price: 24500 },
        { size: "S", color: "Sage", colorHex: "#9CAF88", sku: "LT-S-SAG", stock: 6, price: 24500 },
        { size: "M", color: "Sage", colorHex: "#9CAF88", sku: "LT-M-SAG", stock: 5, price: 24500 },
      ],
      collectionSlugs: ["new-arrivals", "essentials"],
      tags: ["linen", "trousers", "summer"],
    },
    {
      slug: "structured-canvas-blazer",
      name: "Structured Canvas Blazer",
      description: "A fully canvassed blazer cut from Japanese cotton-linen blend. The structured shoulder and soft chest are shaped by hand in our Portuguese atelier. Unlined for a lighter wear, with internal breast pocket and two flap pockets.",
      shortDescription: "Fully canvassed, Japanese cotton-linen, unlined.",
      basePrice: 67500,
      compareAtPrice: null,
      status: "active",
      isFeatured: true,
      isNewArrival: false,
      material: "73% Cotton, 27% Linen (Japanese mill)",
      careInstructions: "Dry clean recommended. Steam to refresh.",
      images: [
        { url: `${PICSUM_BASE}/blazer1a/800/1000`, alt: "Structured Canvas Blazer front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/blazer1b/800/1000`, alt: "Structured Canvas Blazer back", isPrimary: false, sortOrder: 1 },
        { url: `${PICSUM_BASE}/blazer1c/800/1000`, alt: "Structured Canvas Blazer detail", isPrimary: false, sortOrder: 2 },
      ],
      variants: [
        { size: "XS", color: "Sand", colorHex: "#C2B280", sku: "BL-XS-SND", stock: 3, price: 67500 },
        { size: "S", color: "Sand", colorHex: "#C2B280", sku: "BL-S-SND", stock: 5, price: 67500 },
        { size: "M", color: "Sand", colorHex: "#C2B280", sku: "BL-M-SND", stock: 7, price: 67500 },
        { size: "L", color: "Sand", colorHex: "#C2B280", sku: "BL-L-SND", stock: 4, price: 67500 },
        { size: "S", color: "Charcoal", colorHex: "#36454F", sku: "BL-S-CHR", stock: 6, price: 67500 },
        { size: "M", color: "Charcoal", colorHex: "#36454F", sku: "BL-M-CHR", stock: 8, price: 67500 },
        { size: "L", color: "Charcoal", colorHex: "#36454F", sku: "BL-L-CHR", stock: 5, price: 67500 },
      ],
      collectionSlugs: ["outerwear", "essentials"],
      tags: ["blazer", "structured", "outerwear", "featured"],
    },
    {
      slug: "leather-bucket-bag",
      name: "Leather Bucket Bag",
      description: "Hand-stitched in full-grain vegetable-tanned Italian leather. The soft bucket silhouette develops a rich patina over years of wear. Drawstring closure, internal zip pocket, adjustable shoulder strap.",
      shortDescription: "Full-grain vegetable-tanned Italian leather, handmade.",
      basePrice: 38500,
      compareAtPrice: null,
      status: "active",
      isFeatured: false,
      isNewArrival: true,
      material: "Full-grain vegetable-tanned Italian leather",
      careInstructions: "Condition with leather balm every 3-6 months. Store stuffed in dust bag.",
      images: [
        { url: `${PICSUM_BASE}/bag1a/800/1000`, alt: "Leather Bucket Bag front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/bag1b/800/1000`, alt: "Leather Bucket Bag detail", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "One Size", color: "Tan", colorHex: "#D2B48C", sku: "BB-OS-TAN", stock: 6, price: 38500 },
        { size: "One Size", color: "Espresso", colorHex: "#4B2E2E", sku: "BB-OS-ESP", stock: 4, price: 38500 },
        { size: "One Size", color: "Black", colorHex: "#1A1A1A", sku: "BB-OS-BLK", stock: 8, price: 38500 },
      ],
      collectionSlugs: ["new-arrivals", "accessories"],
      tags: ["bag", "leather", "accessories", "featured"],
    },
    {
      slug: "wool-knit-scarf",
      name: "Merino Wool Knit Scarf",
      description: "Generously proportioned in extra-fine merino, this scarf is as much a statement as it is a necessity. The open-knit pattern adds visual lightness while remaining wonderfully warm.",
      shortDescription: "Extra-fine merino, open-knit, generous length.",
      basePrice: 12500,
      compareAtPrice: 15000,
      status: "active",
      isFeatured: false,
      isNewArrival: false,
      material: "100% Extra-Fine Merino Wool",
      careInstructions: "Hand wash cold. Lay flat to dry.",
      images: [
        { url: `${PICSUM_BASE}/scarf1a/800/1000`, alt: "Merino Wool Scarf", isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { size: "One Size", color: "Camel", colorHex: "#C19A6B", sku: "SC-OS-CAM", stock: 15, price: 12500, compareAtPrice: 15000 },
        { size: "One Size", color: "Ivory", colorHex: "#FFFFF0", sku: "SC-OS-IVY", stock: 12, price: 12500, compareAtPrice: 15000 },
        { size: "One Size", color: "Sage", colorHex: "#9CAF88", sku: "SC-OS-SAG", stock: 8, price: 12500, compareAtPrice: 15000 },
        { size: "One Size", color: "Rust", colorHex: "#B7410E", sku: "SC-OS-RST", stock: 5, price: 12500, compareAtPrice: 15000 },
      ],
      collectionSlugs: ["knitwear", "accessories"],
      tags: ["scarf", "wool", "accessories", "sale"],
    },
    {
      slug: "organic-cotton-shirt",
      name: "Organic Cotton Poplin Shirt",
      description: "Tailored in Egyptian organic cotton poplin with a faint natural texture. The slightly boxy cut drapes beautifully whether worn tucked or loose. French-seamed throughout, mother-of-pearl buttons.",
      shortDescription: "Organic Egyptian cotton poplin, boxy fit, mother-of-pearl buttons.",
      basePrice: 19500,
      compareAtPrice: null,
      status: "active",
      isFeatured: false,
      isNewArrival: false,
      material: "100% Organic Egyptian Cotton Poplin",
      careInstructions: "Machine wash cool. Press with a warm iron while damp.",
      images: [
        { url: `${PICSUM_BASE}/shirt1a/800/1000`, alt: "Organic Cotton Shirt front", isPrimary: true, sortOrder: 0 },
        { url: `${PICSUM_BASE}/shirt1b/800/1000`, alt: "Organic Cotton Shirt back", isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: "XS", color: "White", colorHex: "#F8F8F8", sku: "CS-XS-WHT", stock: 12, price: 19500 },
        { size: "S", color: "White", colorHex: "#F8F8F8", sku: "CS-S-WHT", stock: 15, price: 19500 },
        { size: "M", color: "White", colorHex: "#F8F8F8", sku: "CS-M-WHT", stock: 10, price: 19500 },
        { size: "L", color: "White", colorHex: "#F8F8F8", sku: "CS-L-WHT", stock: 8, price: 19500 },
        { size: "XL", color: "White", colorHex: "#F8F8F8", sku: "CS-XL-WHT", stock: 4, price: 19500 },
        { size: "S", color: "Pale Blue", colorHex: "#AFC8D8", sku: "CS-S-PBL", stock: 10, price: 19500 },
        { size: "M", color: "Pale Blue", colorHex: "#AFC8D8", sku: "CS-M-PBL", stock: 8, price: 19500 },
        { size: "L", color: "Pale Blue", colorHex: "#AFC8D8", sku: "CS-L-PBL", stock: 6, price: 19500 },
      ],
      collectionSlugs: ["essentials"],
      tags: ["shirt", "cotton", "organic"],
    },
  ];

  for (const p of productData) {
    const [product] = await db.insert(productsTable).values({
      slug: p.slug,
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription,
      basePrice: p.basePrice,
      compareAtPrice: p.compareAtPrice ?? undefined,
      status: p.status,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      material: p.material,
      careInstructions: p.careInstructions,
    }).onConflictDoNothing().returning();

    if (!product) { console.log(`Skipped existing: ${p.slug}`); continue; }

    await db.insert(productImagesTable).values(p.images.map(img => ({ productId: product.id, ...img })));
    await db.insert(productVariantsTable).values(p.variants.map(v => ({ productId: product.id, ...v })));

    const collectionIds = p.collectionSlugs.map(s => getCol(s)?.id).filter(Boolean) as string[];
    if (collectionIds.length) {
      await db.insert(productCollectionsTable).values(collectionIds.map(cid => ({ productId: product.id, collectionId: cid })));
    }
    if (p.tags.length) {
      await db.insert(productTagsTable).values(p.tags.map(t => ({ productId: product.id, tag: t })));
    }
    console.log(`Created: ${p.name}`);
  }

  // Testimonials
  await db.insert(testimonialsTable).values([
    { authorName: "Margot Chen", authorLocation: "New York, NY", text: "I have been searching for a cashmere turtleneck that actually lives up to its price. This one does. The weight, the softness — it is incomparable.", rating: 5, isVisible: true, sortOrder: 1 },
    { authorName: "James Holloway", authorLocation: "London, UK", text: "The blazer arrived better than I expected. The canvassing gives it a structure that off-the-rack jackets simply cannot replicate. Truly worth it.", rating: 5, isVisible: true, sortOrder: 2 },
    { authorName: "Aisha Farouk", authorLocation: "Dubai, UAE", text: "The silk slip dress is everything I wanted — the bias cut moves beautifully and the colour is richer in person. Already eyeing a second piece.", rating: 5, isVisible: true, sortOrder: 3 },
    { authorName: "Thomas Brennan", authorLocation: "Dublin, Ireland", text: "Ordered the linen trousers on a whim. Now they are the first thing I reach for. The washed linen is soft without looking sloppy. Perfect weight.", rating: 4, isVisible: true, sortOrder: 4 },
    { authorName: "Ingrid Svensson", authorLocation: "Stockholm, Sweden", text: "The leather bag is already developing the most beautiful patina after three months. The craftsmanship is evident in every stitch. A true heirloom piece.", rating: 5, isVisible: true, sortOrder: 5 },
  ]).onConflictDoNothing();

  // Banner
  await db.insert(bannersTable).values([
    { imageUrl: `${PICSUM_BASE}/banner1/1400/700`, heading: "New Season, New Story", subheading: "Discover the collection crafted for those who move through the world with intention.", ctaText: "Explore Now", ctaUrl: "/collections", sortOrder: 0, isActive: true },
  ]).onConflictDoNothing();

  console.log("Seeding complete.");
}

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
