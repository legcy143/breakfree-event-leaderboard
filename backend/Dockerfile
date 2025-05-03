FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set hardcoded production environment
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGODB_URI=mongodb://mongodb:27017/breakfree-leaderboard
ENV CORS_ORIGIN=http://frontend:3000

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]