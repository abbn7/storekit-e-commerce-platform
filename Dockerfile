# ── Stage 1: Install dependencies ──────────────────────────────────────────
# IMPORTANT: Use node:24-slim (Debian/glibc) NOT node:24-alpine (musl).
# The pnpm lockfile was generated on a glibc system so native binaries for
# Rollup, Tailwind Oxide, and LightningCSS are the GNU variants — not musl.
FROM node:24-slim AS deps
WORKDIR /app

# Install build tools required by native Node addons (esbuild postinstall, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

# Copy workspace manifests (package.json files only — for dependency install)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY lib/db/package.json                  ./lib/db/
COPY lib/api-spec/package.json            ./lib/api-spec/
COPY lib/api-zod/package.json             ./lib/api-zod/
COPY lib/api-client-react/package.json    ./lib/api-client-react/
COPY artifacts/api-server/package.json    ./artifacts/api-server/
COPY artifacts/storekit/package.json      ./artifacts/storekit/
COPY scripts/package.json                 ./scripts/

# Copy root tsconfig so lib/ packages can resolve "../../tsconfig.base.json"
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build frontend (React/Vite) ────────────────────────────────────
FROM deps AS frontend-builder
WORKDIR /app

COPY lib/                     ./lib/
COPY artifacts/storekit/      ./artifacts/storekit/

RUN pnpm --filter @workspace/storekit build

# ── Stage 3: Build API server ────────────────────────────────────────────────
FROM deps AS api-builder
WORKDIR /app

COPY lib/                      ./lib/
COPY artifacts/api-server/     ./artifacts/api-server/
COPY scripts/                  ./scripts/

RUN pnpm --filter @workspace/api-server run build

# ── Stage 4: Production runtime ─────────────────────────────────────────────
# Keep slim (glibc) to match native binaries installed above.
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime OS deps: libssl for pg TLS, ca-certificates for HTTPS
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

# Copy workspace manifests for production install
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY tsconfig.base.json ./
COPY lib/db/package.json              ./lib/db/
COPY lib/api-spec/package.json        ./lib/api-spec/
COPY lib/api-zod/package.json         ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/storekit/package.json   ./artifacts/storekit/
COPY scripts/package.json             ./scripts/

RUN pnpm install --frozen-lockfile --prod

# Copy compiled API
COPY --from=api-builder  /app/artifacts/api-server/dist  ./dist/

# Copy built frontend into ./public so Express serves it
COPY --from=frontend-builder /app/artifacts/storekit/dist/public ./public/

# Uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
