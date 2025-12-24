# Frontend Dockerfile
# Production-ready Next.js frontend for School SaaS

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]
