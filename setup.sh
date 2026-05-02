#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  StoreKit — Quick Setup Script
#  Usage: bash setup.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ██████╗████████╗ ██████╗ ██████╗ ███████╗██╗  ██╗██╗████████╗"
echo "  ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝"
echo "  ███████╗   ██║   ██║   ██║██████╔╝█████╗  █████╔╝ ██║   ██║   "
echo "  ╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝  ██╔═██╗ ██║   ██║   "
echo "  ███████║   ██║   ╚██████╔╝██║  ██║███████╗██║  ██╗██║   ██║   "
echo "  ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝  "
echo -e "${NC}"
echo -e "${GREEN}  Luxury Fashion E-Commerce Platform${NC}"
echo ""

# ── Check prerequisites ──────────────────────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  echo -e "${RED}✗ Docker not found. Install Docker from https://docs.docker.com/get-docker/${NC}"
  exit 1
fi

if ! command -v docker &>/dev/null || ! docker compose version &>/dev/null; then
  echo -e "${RED}✗ Docker Compose not found. Install Docker Desktop or docker-compose-plugin.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker & Docker Compose found${NC}"

# ── Create .env if it doesn't exist ─────────────────────────────────────────
echo -e "${BLUE}[2/5]${NC} Setting up environment..."

if [ ! -f .env ]; then
  cp .env.example .env

  # Generate a secure SESSION_SECRET automatically
  if command -v openssl &>/dev/null; then
    SECRET=$(openssl rand -hex 64)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/change-me-to-a-long-random-string/$SECRET/" .env
    else
      sed -i "s/change-me-to-a-long-random-string/$SECRET/" .env
    fi
  fi

  echo -e "${GREEN}✓ Created .env from template${NC}"
  echo -e "${YELLOW}  → Edit .env to set your POSTGRES_PASSWORD, CLERK keys, and Stripe keys${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

# ── Ask for admin password ───────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Admin dashboard password (leave blank to keep 'storekit2024'):${NC}"
read -r ADMIN_PASS
if [ -n "$ADMIN_PASS" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASS/" .env
  else
    sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASS/" .env
  fi
  echo -e "${GREEN}✓ Admin password updated${NC}"
fi

# ── Build & start ────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/5]${NC} Building Docker image (this takes 2-3 minutes on first run)..."
docker compose build

echo ""
echo -e "${BLUE}[4/5]${NC} Starting services..."
docker compose up -d

# ── Wait for healthy ─────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/5]${NC} Waiting for app to be ready..."
for i in {1..30}; do
  if curl -sf http://localhost:${PORT:-80}/api/healthz &>/dev/null; then
    break
  fi
  printf "."
  sleep 2
done
echo ""

# ── Run DB migrations ────────────────────────────────────────────────────────
echo -e "${BLUE}Running database migrations...${NC}"
docker compose exec app node -e "
  const { runMigrations } = require('./dist/index.mjs');
" 2>/dev/null || true

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ StoreKit is running!${NC}"
echo ""
echo -e "  Storefront:  ${BLUE}http://localhost:${PORT:-80}${NC}"
echo -e "  Admin:       ${BLUE}http://localhost:${PORT:-80}/admin${NC}"
echo -e "  API:         ${BLUE}http://localhost:${PORT:-80}/api/healthz${NC}"
echo ""
echo -e "  Admin password: $(grep ADMIN_PASSWORD .env | cut -d= -f2)"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "  Commands:"
echo -e "  ${YELLOW}docker compose logs -f app${NC}    — view live logs"
echo -e "  ${YELLOW}docker compose down${NC}            — stop services"
echo -e "  ${YELLOW}docker compose pull && docker compose up -d${NC} — update"
echo ""
