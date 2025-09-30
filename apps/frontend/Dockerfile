# syntax=docker/dockerfile:1.7
# Workspace-aware build using repo root context
# --- builder ---

FROM node:20-bookworm-slim AS builder
WORKDIR /repo
COPY package*.json ./
# Sørg for at både frontend- og ui-manifestene er tilgjengelige for installasjon
RUN mkdir -p apps/frontend packages/ui
COPY apps/frontend/package*.json apps/frontend/
COPY packages/ui/package*.json packages/ui/
# Installer både UI- og frontend-workspacene slik at @workbuoy/ui er tilgjengelig
RUN --mount=type=cache,target=/root/.npm npm ci --workspace @workbuoy/ui --workspace @workbuoy/frontend
# Kopier resten av repoet (for kildekode)
COPY . .

# Bygg UI før frontend slik at type- og byggartefakter er klare
RUN npm run -w @workbuoy/ui build && npm run -w @workbuoy/frontend build

# --- runtime ---

FROM nginx:alpine AS runtime
COPY --from=builder /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
