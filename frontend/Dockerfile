# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# CI=false prevents ESLint warnings from failing the production build
RUN CI=false npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration to enable /api reverse proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 8080 (standard non-root port for OpenShift and Kubernetes)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
