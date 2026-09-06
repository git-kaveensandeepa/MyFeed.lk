# Stage 1: Build Angular SSR Application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production bundles
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy dist output and server runner
COPY --from=builder /app/dist ./dist
COPY server-prod.mjs ./

# Cloud Run binds to PORT 8080 by default
EXPOSE 8080

CMD ["node", "server-prod.mjs"]
