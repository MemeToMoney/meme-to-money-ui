# Multi-stage build for Next.js application
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_CONTENT_SERVICE_URL
ARG NEXT_PUBLIC_MONETIZATION_SERVICE_URL

# Set environment variables for build
ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_CONTENT_SERVICE_URL=$NEXT_PUBLIC_CONTENT_SERVICE_URL
ENV NEXT_PUBLIC_MONETIZATION_SERVICE_URL=$NEXT_PUBLIC_MONETIZATION_SERVICE_URL

# Build the application
RUN npm run build

# Runtime stage
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application from builder stage
# With Next.js standalone output, public directory is automatically included in .next/standalone
# Copy standalone build output (includes public, server.js, and all dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static files for optimization
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime environment variables (can be overridden by Docker run or docker-compose)
ENV USER_SERVICE_URL=""
ENV CONTENT_SERVICE_URL=""
ENV MONETIZATION_SERVICE_URL=""
ENV NEXT_PUBLIC_USER_SERVICE_URL=""
ENV NEXT_PUBLIC_CONTENT_SERVICE_URL=""
ENV NEXT_PUBLIC_MONETIZATION_SERVICE_URL=""

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run the application
CMD ["node", "server.js"]