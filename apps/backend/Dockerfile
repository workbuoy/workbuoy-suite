# Workspace-aware build using repo root context
# --- builder ---

FROM node:20-alpine AS builder
WORKDIR /repo

# Copy root manifests first for caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the repo (respects root .dockerignore)
COPY . .

# Build the backend workspace (outputs to apps/backend/dist)
RUN npm run -w @workbuoy/backend build

# --- runtime ---

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install ONLY backend production deps.
# We cannot rely on a per-workspace lockfile inside the app folder,
# so use npm install (not ci) against the workspace package.json.
COPY apps/backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy compiled output from builder
COPY --from=builder /repo/apps/backend/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
