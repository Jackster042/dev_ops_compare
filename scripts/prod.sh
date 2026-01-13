#!/bin/bash
set -e

echo "🚀 Starting Acquisition App in Production Mode"
echo "=============================================="

# Check env file
if [ ! -f .env.production ]; then
  echo "❌ Error: .env.production file not found"
  exit 1
fi

# Check Docker
if ! docker info >/dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  exit 1
fi

echo "📦 Building and starting production containers..."
echo "   - Using Neon Cloud Database"
echo "   - Optimized production build"
echo ""

# Start production stack
docker compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for application container..."
sleep 5

echo "📜 Running database migrations (inside container)..."
docker exec acquisition-app-prod bun run db:migrate

echo ""
echo "🎉 Production environment started successfully!"
echo "----------------------------------------------"
echo "Application: http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  View logs: docker logs -f acquisition-app-prod"
echo "  Stop app : docker compose -f docker-compose.prod.yml down"