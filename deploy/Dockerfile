# Use official Node.js image as base
FROM node:latest AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use NGINX as a lightweight server for serving static files
FROM nginx:alpine

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the previous stage to NGINX HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
