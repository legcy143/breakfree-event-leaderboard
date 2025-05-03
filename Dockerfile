FROM node:20-alpine

WORKDIR /app

# Copy package files and lock file
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile || pnpm install

# Copy only frontend files, excluding backend
COPY public ./public
COPY src ./src
COPY tsconfig.json next.config.ts postcss.config.mjs ./

# Hardcode the API URL for production
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:8081

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]