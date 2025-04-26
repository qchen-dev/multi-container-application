# Use official Node.js base image (lightweight)
FROM node:lts-alpine

# Set working directory inside container
WORKDIR /app

# Install only package.json first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Default command
CMD ["npm", "run", "start"]