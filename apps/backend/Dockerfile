# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Only copy the manifest first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend app
COPY . .

# Build (assumes "build" script outputs to dist/)
RUN npm run build

# --- runtime ---
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy only production package manifests and install prod deps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy compiled output (no source, tests, etc.)
COPY --from=builder /app/dist ./dist

# Use the "node" user for better security
USER node
EXPOSE 3000

# Adjust entrypoint if your backend's start script differs
CMD ["node", "dist/index.js"]
