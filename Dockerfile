FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared module first and build it
COPY shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Copy service files and dependencies
WORKDIR /app
COPY services/bazos-service ./services/bazos-service
COPY tsconfig.json ./
COPY package*.json ./
COPY prisma ./prisma

# Install service dependencies (which reference shared via file://)
WORKDIR /app/services/bazos-service
RUN npm install

# Generate Prisma client from repo root to avoid prisma CLI attempting implicit package installs in /app/shared
# Output path in schema is ../shared/node_modules/.prisma/client (relative to /app/prisma/) = /app/shared/node_modules/.prisma/client
WORKDIR /app
RUN mkdir -p /app/shared/node_modules/.prisma/client
RUN npm install --no-save @prisma/client@5.22.0 prisma@5.22.0 --silent
RUN npm install --prefix /app/shared --save-dev prisma@5.22.0 --silent
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
  ./shared/node_modules/.bin/prisma generate --schema=prisma/schema.prisma
# @prisma/client loads .prisma/client/default.js; without this it stays the "run prisma generate" stub
RUN cp /app/shared/node_modules/.prisma/client/index.js /app/shared/node_modules/.prisma/client/default.js
# Copy generated client into the service node_modules so /app resolves @prisma/client consistently
RUN cp -r /app/shared/node_modules/.prisma/client/. /app/services/bazos-service/node_modules/.prisma/client/

# Build service
WORKDIR /app/services/bazos-service
RUN npm run build

# Production stage - copy only what's needed
FROM node:24-slim

# Install OpenSSL for Prisma query engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy service dist and node_modules
COPY --from=builder /app/services/bazos-service/dist ./dist
COPY --from=builder /app/services/bazos-service/node_modules ./node_modules

# Copy entire shared package (source + compiled dist + node_modules for @bazos/shared)
COPY --from=builder /app/shared ./shared

# Drop @nestjs duplicates from the shared package so exactly one copy is loaded.
# Two copies mean two distinct HttpException classes: anything thrown inside
# @bazos/shared (where all the business controllers live) fails Nest's
# `instanceof HttpException` check and is reported to clients as a 500 instead
# of the intended 400/401/403/404. Node resolves these up to /app/node_modules,
# which carries the same set (axios, common, config, core, platform-express).
RUN rm -rf /app/shared/node_modules/@nestjs

# Ensure @bazos/shared is properly resolved in node_modules
RUN mkdir -p /app/node_modules/@bazos && ln -sf ../../shared /app/node_modules/@bazos/shared

EXPOSE 3900

CMD ["node", "dist/main.js"]
