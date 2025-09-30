# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY packages/ui/package*.json ./packages/ui/
RUN --mount=type=cache,target=/root/.npm npm ci || npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder /app .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s CMD wget -qO- http://127.0.0.1:3000/api/health/ready || exit 1
CMD ["npm","start"]
