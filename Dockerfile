# ─── Builder stage ─────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ─── Production stage ──────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# NODE_ENV is a platform env var — supplied at image level (never in .env,
# never in config_entries). production → release-trusted migration
# signatures only + Secure session cookies.
ENV NODE_ENV=production
# Internal port is always 3001 — fixed in src/index.ts, not configurable.
# Host port mapping is handled by Terraform.
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/v1/health').then(r => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
