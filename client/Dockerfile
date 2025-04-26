# Stage 1: Build the app
FROM node:22-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Install only package.json first (leverages Docker layer cache)
COPY package*.json ./
# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the production version of the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Expose port (optional - for documentation)
EXPOSE 5173

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html