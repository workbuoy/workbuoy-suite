# Workspace-aware build using repo root context
# --- builder ---

FROM node:20-alpine AS builder
WORKDIR /repo

# Copy root manifest(s) and workspace package.json files for proper workspaces install
COPY package*.json ./

# Pre-create workspace dirs and copy their package manifests to enable npm workspaces resolution
RUN mkdir -p apps/backend apps/frontend packages/backend-telemetry packages/backend-rbac
COPY apps/backend/package*.json apps/backend/
COPY apps/frontend/package*.json apps/frontend/
COPY packages/backend-telemetry/package*.json packages/backend-telemetry/
COPY packages/backend-rbac/package*.json packages/backend-rbac/

# Install with the root lockfile and workspace manifests present
RUN npm ci

# Now copy the rest of the repo (respects root .dockerignore)
COPY . .

# Generate Prisma client for typechecking and build backend (container surface)
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma \
  && npm run -w @workbuoy/backend-telemetry build \
  && npm run -w @workbuoy/backend-rbac build \
  && npm run -w @workbuoy/backend build:container \
  && npm run -w @workbuoy/backend build:container:verify

# --- runtime ---

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Root manifests so npm understands dependency graph in runtime image
COPY package.json package-lock.json ./

# Needed workspace manifests for prod resolution
RUN mkdir -p apps/backend packages/backend-telemetry packages/backend-rbac
COPY apps/backend/package*.json ./apps/backend/
COPY packages/backend-telemetry/package*.json ./packages/backend-telemetry/
COPY packages/backend-rbac/package*.json ./packages/backend-rbac/

# Production install using the lockfile
RUN npm ci --omit=dev --no-audit --fund=false

# Prisma schema for generate step
COPY apps/backend/prisma ./prisma

# Explicit generate in case postinstall was skipped
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy compiled artifacts from builder
COPY --from=builder /repo/apps/backend/dist ./dist
COPY --from=builder /repo/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /repo/node_modules/@workbuoy ./node_modules/@workbuoy
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
