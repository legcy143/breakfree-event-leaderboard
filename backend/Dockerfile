FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the application
CMD ["node", "dist/index.js"]