#!/bin/bash
set -e

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check env file
if [ ! -f .env.development ]; then
  echo "❌ .env.development file not found"
  exit 1
fi

# Check Docker
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running"
  exit 1
fi

# Ensure Neon state dir
mkdir -p .neon_local

# Gitignore safety
if ! grep -q "^.neon_local/" .gitignore 2>/dev/null; then
  echo ".neon_local/" >> .gitignore
  echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Starting Neon Local + App containers..."
docker compose -f docker-compose.dev.yml up -d --build

echo "⏳ Waiting for Neon Local to be ready..."
until docker logs dev_ops_compare_neon_local 2>&1 | grep -q "Neon Local is ready"; do
  sleep 2
done

echo "✅ Neon Local is ready"

echo "📜 Running database migrations..."
docker exec dev_ops_compare_app_dev bun run db:migrate

echo ""
echo "🎉 Development environment is ready!"
echo "------------------------------------"
echo "App: http://localhost:3000"
echo "Stop: docker compose -f docker-compose.dev.yml down"
echo ""

# Attach logs
docker compose -f docker-compose.dev.yml logs -f