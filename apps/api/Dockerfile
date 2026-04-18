# Build from monorepo root: docker build -f apps/api/Dockerfile .
# TECHNICAL_SPECIFICATION §10.3

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY tsconfig.base.json ./
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
EXPOSE 3008
CMD ["node", "dist/index.js"]
