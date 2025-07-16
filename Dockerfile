# Multi-stage build for security and efficiency
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Copy source code
COPY . .

# Expose ports
EXPOSE 3008 5174

# Start development servers
CMD ["pnpm", "run", "dev"]

# Build stage
FROM base AS build
ENV NODE_ENV=production

# Copy source code
COPY . .

# Build client and server
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production
ENV NODE_ENV=production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/client/dist ./client/dist
COPY --from=build --chown=nextjs:nodejs /app/server/dist ./server/dist

# Create necessary directories
RUN mkdir -p uploads logs && chown -R nextjs:nodejs uploads logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/health || exit 1

# Start production server
CMD ["node", "server/dist/index.js"] 