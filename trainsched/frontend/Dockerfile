# Use Node 18 for compatibility
FROM node:18 AS build

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the frontend
COPY . .

# Build the frontend (for Vite/React)
RUN npm run build

# --- Production stage ---
FROM nginx:stable-alpine

# Copy build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

