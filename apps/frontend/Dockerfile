# Workspace-aware build using repo root context
# --- builder ---

FROM node:20-alpine AS builder
WORKDIR /repo
COPY package*.json ./
RUN npm ci
COPY . .

# Assumes workspace build outputs to apps/frontend/dist
RUN npm run -w @workbuoy/frontend build

# --- runtime ---

FROM nginx:alpine AS runtime
COPY --from=builder /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
