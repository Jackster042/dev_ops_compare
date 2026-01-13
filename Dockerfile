# Use Bun as base image
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
FROM install AS install-prod
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) files
FROM base AS prerelease
COPY --from=install-prod /temp/prod/node_modules /app/node_modules
COPY . .

# Build the application
FROM prerelease AS build
# Add any build steps here if needed in the future
# For now, TypeScript is handled by Bun at runtime

# Production image
FROM base AS release
WORKDIR /app

# Copy production dependencies
COPY --from=install-prod /temp/prod/node_modules /app/node_modules

# Copy application code
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/drizzle.config.js ./

# Expose port (default 3000, can be overridden via PORT env var)
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the application
CMD ["bun", "run", "src/index.ts"]
