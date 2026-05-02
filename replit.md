# StoreKit — White-Label Fashion E-Commerce Platform

## Overview

Full-stack luxury fashion e-commerce platform built as a pnpm workspace monorepo. Includes a complete storefront, admin dashboard, and REST API with real PostgreSQL data.

## Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React 19 + Vite, Wouter routing, Framer Motion, Zustand, Shadcn UI
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **Auth**: Clerk v6 (storefront), password-based (admin, cookie: `sk_admin_session`)
- **i18n**: react-i18next — English + Arabic (RTL) with localStorage persistence (`sk-lang`)
- **Theme**: Dark/Light mode via ThemeContext, localStorage persistence (`sk-theme`)
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

- `pnpm run typecheck` — full typecheck across all packages (0 errors)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema (dev only)
- `pnpm --filter @workspace/storekit build` — production build (succeeds without PORT env var)

## Storefront Pages

- `/` — Homepage (hero, featured products, collections, testimonials)
- `/collections` — All collections grid
- `/collections/:slug` — Collection detail with advanced filter panel (color, size, price range) + sort
- `/products/:slug` — Product detail (size/color selector, Size Guide modal, social proof, recently viewed tracking, related products, add to cart/wishlist)
- `/cart` — Cart page
- `/checkout` — Checkout (Stripe)
- `/order-confirmation/:id` — Order success
- `/search` — Search
- `/account` — Account (Clerk-protected)
- `/account/orders` — Order history
- `/account/wishlist` — Saved items
- `/about` — About page
- `/sign-in`, `/sign-up` — Clerk auth pages

## Competitive Features (v2)

- **Image Upload**: Admin forms support uploading images from device via Object Storage (presigned URL → GCS). `ImageUploadButton` component at `src/components/admin/ImageUploadButton.tsx`
- **Advanced Collection Filtering**: Filter by color swatches, size buttons, and price ranges — client-side filtering on loaded products. Toggle panel with active filter count badge.
- **Size Guide Modal**: Popup with XS–XL size chart (EU/UK/US conversions), CM/IN toggle, how-to-measure section. `SizeGuide` component next to size selector.
- **Social Proof**: Live "X people viewing this" badge on product detail (deterministic from product ID). `SocialProof` sub-component.
- **Recently Viewed**: Zustand persisted store (`sk-recently-viewed`) tracks last 8 viewed products. Shown at bottom of product detail pages. `RecentlyViewed` component + `useRecentlyViewedStore`.
- **Related Products**: "You May Also Like" grid on product detail (same collection, max 4).
- **Newsletter Popup**: Time-delayed (6s) email capture popup with 15% discount offer, 14-day dismissal, submit confirmation. `NewsletterPopup` component added to `App.tsx`.
- **Back to Top**: Smooth scroll button appears after 500px scroll. `BackToTop` component in `App.tsx`.
- **Object Storage**: Server routes at `/api/storage/uploads/request-url` (presigned URL), `/api/storage/objects/:id` (serve), `/api/storage/public-objects/*` (public). Inline Zod schemas (no codegen dependency).

## Admin Dashboard

- `/admin/login` — Admin login (password: `storekit2024` / env: `ADMIN_PASSWORD`)
- `/admin` — Analytics dashboard
- `/admin/products` — Products CRUD
- `/admin/collections` — Collections CRUD
- `/admin/orders` — Orders management
- `/admin/settings` — Store CMS (General/Hero/Colors/Social/Content tabs)
- `/admin/content` — Testimonials + content management
- `/admin/analytics` — Charts + metrics (Recharts)

## Codegen Notes

- Run `cd lib/api-spec && pnpm exec orval --config ./orval.config.ts` to regenerate (without typecheck)
- `lib/api-zod/src/index.ts` must only have `export * from "./generated/api"` — orval overwrites this to include `types` which creates duplicate exports; fix manually after each codegen run
- `typecheck:libs` is expected to fail due to orval types duplication — this does NOT affect runtime

## i18n — Internationalization

- **Files**: `src/i18n/index.ts`, `src/i18n/locales/en.ts`, `src/i18n/locales/ar.ts`
- **setLanguage(lang)** in `src/i18n/index.ts`: saves to localStorage, sets `html[lang]` + `html[dir]`
- **RTL**: Arabic triggers `dir="rtl"` on `<html>`, CSS `[dir="rtl"]` applies Cairo font + letter-spacing:0
- **Toggle**: Globe icon + "EN/AR" dropdown in Navbar (desktop & mobile)

## Dark/Light Mode

- **Context**: `src/contexts/ThemeContext.tsx` — toggles `.dark` class on `<html>`
- **Persistence**: localStorage key `sk-theme`
- **System preference**: respects `prefers-color-scheme` as default
- **Toggle**: Sun/Moon animated button in Navbar (desktop & mobile)
- **CSS**: Full `.dark` color palette in `src/index.css` (deep navy `--background: 222 18% 8%`)

## Key Source Files

- `artifacts/storekit/src/App.tsx` — Root: I18nextProvider + ThemeProvider + ClerkProvider
- `artifacts/storekit/src/components/Navbar.tsx` — Full navbar with all toggles
- `artifacts/storekit/src/i18n/index.ts` — i18next setup
- `artifacts/storekit/src/contexts/ThemeContext.tsx` — Dark mode context
- `artifacts/storekit/src/index.css` — Full color system (light+dark) + glass utilities + RTL
- `artifacts/storekit/vite.config.ts` — PORT optional at build time, code splitting

## Data & Pricing

- Prices stored in **cents** (divide by 100 for display)
- Helpers: `formatPrice()`, `getProductImage()`, `slugify()` in `src/lib/utils.ts`
- DB seeded: 8 products, 5 collections, store config, 5 testimonials

## Deployment

- **Replit Deploy**: Click Deploy button — all env vars pre-configured
- **Vercel**: See `DEPLOY.md` for step-by-step guide (including iPhone deployment)
- **vercel.json**: at repo root, configured for monorepo build
- Build command: `pnpm --filter @workspace/storekit build` (no PORT required)
- Output: `artifacts/storekit/dist/public/`

## Required Env Vars (Production)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe frontend |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `NODE_ENV` | `production` |
