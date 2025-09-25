# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Assumes SPA/Vite/React build to /app/dist
RUN npm run build

# --- runtime ---
FROM nginx:alpine AS runtime

# Copy built assets to nginx's default html directory
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

# If you need custom caching/SPA fallback, add an nginx.conf and COPY it to /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
