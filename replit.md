# StoreKit — White-Label Fashion E-Commerce Platform

## Overview

Full-stack luxury fashion e-commerce platform built as a pnpm workspace monorepo. Includes a complete storefront, admin dashboard, and REST API with real PostgreSQL data.

## Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React 19 + Vite, Wouter routing, Framer Motion, Zustand, Shadcn UI
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **Auth**: Clerk v6 (storefront), password-based (admin)
- **API**: Contract-first OpenAPI → Orval codegen (React Query hooks + Zod schemas)
- **Styling**: Tailwind CSS v4, Cormorant Garamond / Inter / Bebas Neue fonts
- **Node.js**: 24 | **TypeScript**: 5.9

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| `artifacts/storekit` | `/` | React Vite storefront + admin SPA |
| `artifacts/api-server` | `/api` | Express REST API server |
| `artifacts/mockup-sandbox` | — | Component preview dev server |

## Workflows

- **API Server**: `pnpm --filter @workspace/api-server run dev` (build + start on port 8080)
- **Storekit**: `pnpm --filter @workspace/storekit run dev` (Vite on port 20287)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema (dev only)

## Storefront Pages

- `/` — Homepage (hero, featured products, collections, testimonials)
- `/collections` — All collections grid
- `/collections/:slug` — Collection detail with product grid + sort
- `/products/:slug` — Product detail (image gallery, variants, add to cart, wishlist)
- `/cart` — Cart page with item list and totals
- `/checkout` — 3-step checkout (shipping → review → payment)
- `/order-confirmation/:id` — Order success page
- `/search` — Product search
- `/about` — Brand story page
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/account` — Account hub (requires auth)
- `/account/orders` — Order history (requires auth)
- `/account/wishlist` — Saved items (requires auth)

## Admin Pages (password-protected)

- `/admin/login` — Admin login (password: `storekit2024` via `ADMIN_PASSWORD` env var)
- `/admin` — Dashboard (analytics, revenue charts, low stock alerts)
- `/admin/products` — Product CRUD
- `/admin/collections` — Collection CRUD
- `/admin/orders` — Order management
- `/admin/settings` — Store configuration
- `/admin/content` — Testimonials & banners
- `/admin/analytics` — Full analytics view

## Auth

- **Storefront**: Clerk v6. Uses `useUser()` + `AuthGuard` component (wraps protected pages). `SignedIn`/`SignedOut` not available in v6.
- **Admin**: Cookie-based (`sk_admin_session`). `ADMIN_PASSWORD` env var required. Frontend stores session in `localStorage` key `sk-admin-session`.

## Database Schema (lib/db/src/schema/)

- `storeConfigTable` — Store settings, branding, hero content
- `productsTable` + `productVariantsTable` + `productImagesTable` + `productTagsTable` + `productCollectionsTable`
- `collectionsTable`
- `ordersTable` + `orderItemsTable`
- `testimonialsTable` + `bannersTable`

## Shared Libraries

- `lib/db` — Drizzle ORM schema + DB connection (`@workspace/db`)
- `lib/api-spec` — OpenAPI YAML spec (`@workspace/api-spec`)
- `lib/api-zod` — Generated Zod schemas (`@workspace/api-zod`)
- `lib/api-client-react` — Generated React Query hooks (`@workspace/api-client-react`)

## Design Tokens

- Gold accent: `--color-accent-gold: #c9a96e` (CSS var + Tailwind `accent`)
- Display font: Cormorant Garamond (`--font-display`)
- Body font: Inter
- Accent font: Bebas Neue (`--font-accent`)
- Prices stored in **cents** — use `formatPrice()` from `src/lib/utils.ts`

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk public key (shared)
- `CLERK_SECRET_KEY` — Clerk secret (secret)
- `ADMIN_PASSWORD` — Admin dashboard password (shared, default: `storekit2024`)
- `DATABASE_URL` — PostgreSQL connection (runtime-managed)
- `SESSION_SECRET` — Express session secret
