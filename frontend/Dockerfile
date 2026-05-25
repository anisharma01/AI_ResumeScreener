# --- Stage 1: Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy package management files
COPY package.json ./

# Install node dependencies
RUN npm install

# Copy frontend source files
COPY . .

# Compile optimized static output
RUN npm run build

# --- Stage 2: Serve Stage ---
FROM nginx:1.25-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to standard Nginx content path
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
