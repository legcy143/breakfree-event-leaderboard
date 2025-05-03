FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application
COPY . .

# Set environment variables for Next.js
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Build the application
RUN pnpm build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]