# Stage 1 — build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:alpine

# Copy the Vite build output to nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default nginx config so /api requests proxy to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
