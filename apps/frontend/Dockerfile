# Workspace-aware build using repo root context
# --- builder ---

FROM node:20-bookworm-slim AS builder
WORKDIR /repo
COPY package*.json ./
# Kun frontend-manifest, vi isolerer workspacet og unngår backend-devDeps (@swc/core)
RUN mkdir -p apps/frontend
COPY apps/frontend/package*.json apps/frontend/
# Installer kun deps for frontend-workspacet
RUN npm ci --workspace @workbuoy/frontend
# Kopier resten av repoet (for kildekode)
COPY . .

# Assumes workspace build outputs to apps/frontend/dist
RUN npm run -w @workbuoy/frontend build

# --- runtime ---

FROM nginx:alpine AS runtime
COPY --from=builder /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
