# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/db/package.json                  ./lib/db/
COPY lib/api-spec/package.json            ./lib/api-spec/
COPY lib/api-zod/package.json             ./lib/api-zod/
COPY lib/api-client-react/package.json    ./lib/api-client-react/
COPY artifacts/api-server/package.json    ./artifacts/api-server/
COPY artifacts/storekit/package.json      ./artifacts/storekit/
COPY scripts/package.json                 ./scripts/

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
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled API
COPY --from=api-builder  /app/artifacts/api-server/dist  ./dist/
COPY --from=api-builder  /app/artifacts/api-server/package.json ./

# Copy built frontend into ./public so Express serves it
COPY --from=frontend-builder /app/artifacts/storekit/dist/public ./public/

# Install only production deps for the API
RUN npm install -g pnpm@10
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/db/package.json              ./lib/db/
COPY lib/api-spec/package.json        ./lib/api-spec/
COPY lib/api-zod/package.json         ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY scripts/package.json             ./scripts/
RUN pnpm install --frozen-lockfile --prod

# Uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
