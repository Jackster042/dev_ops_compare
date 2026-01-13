# dev_ops_compare

A Bun-based Express application with Neon Database integration, dockerized for both development and production environments.

## Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or later)
- [Bun](https://bun.sh) (for local development without Docker, optional)

## Quick Start

### Development Environment (Local with Neon Local)

The development environment uses **Neon Local** via Docker, which provides a local Postgres database with automatic ephemeral branch creation for isolated development.

1. **Create environment file:**

   Copy the example file and fill in your values:

   ```bash
   cp .env.development.example .env.development
   ```

   Edit `.env.development` and configure:
   - `NEON_API_KEY`: Your Neon Cloud API key (required - get from https://console.neon.tech)
   - `NEON_PROJECT_ID`: Your Neon Cloud Project ID (required - get from https://console.neon.tech)
   - `DATABASE_URL`: Connection string for Neon Local (default: `postgres://neon:npg@neon-local:5432/neondb`)
   - `ARCJET_KEY`: Your Arcjet API key (optional for development)
   - `PORT`: Application port (default: 3000)
   - `PARENT_BRANCH_ID`: Parent branch ID for ephemeral branches (optional)

2. **Start the development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
   - Build the application Docker image
   - Start the Neon Local container (Postgres database)
   - Start the application container with hot reload enabled
   - Create a Docker network for service communication

3. **Access the application:**
   - Application: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API: http://localhost:3000/api

4. **Stop the development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

   To remove volumes (including database data):

   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   ```

### Production Environment (Neon Cloud)

The production environment connects directly to your **Neon Cloud** database (serverless).

1. **Create environment file:**

   Copy the example file and fill in your production values:

   ```bash
   cp .env.production.example .env.production
   ```

   **⚠️ IMPORTANT:** Edit `.env.production` with your actual Neon Cloud credentials:
   - `DATABASE_URL`: Your Neon Cloud connection string (format: `postgres://user:password@hostname.neon.tech/dbname?sslmode=require`)
   - `ARCJET_KEY`: Your production Arcjet API key
   - `PORT`: Application port (default: 3000)
   - `NODE_ENV`: Set to `production`

2. **Start the production environment:**

   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

   The `-d` flag runs containers in detached mode.

3. **View logs:**

   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

4. **Stop the production environment:**

   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Local Development (Without Docker)

If you prefer to run the application locally without Docker:

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Set up environment variables:**

   Create a `.env` file or use `.env.development`:

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/dbname
   NODE_ENV=development
   PORT=3000
   ARCJET_KEY=your_key
   ```

3. **Run the application:**

   ```bash
   bun run dev
   ```

## Database Migrations

### Generate migrations:

```bash
bun run db:generate
```

### Run migrations:

**Development (with Docker):**

```bash
docker-compose -f docker-compose.dev.yml exec app bun run db:migrate
```

**Production (with Docker):**

```bash
docker-compose -f docker-compose.prod.yml exec app bun run db:migrate
```

**Local (without Docker):**

```bash
bun run db:migrate
```

### Open Drizzle Studio (database GUI):

**Development:**

```bash
docker-compose -f docker-compose.dev.yml exec app bun run db:studio
```

**Local:**

```bash
bun run db:studio
```

## Environment Variables

### Development (`.env.development`)

| Variable           | Description                             | Default                                      | Required |
| ------------------ | --------------------------------------- | -------------------------------------------- | -------- |
| `DATABASE_URL`     | Neon Local connection string            | `postgres://neon:npg@neon-local:5432/neondb` | No       |
| `NODE_ENV`         | Environment mode                        | `development`                                | No       |
| `PORT`             | Application port                        | `3000`                                       | No       |
| `ARCJET_KEY`       | Arcjet API key                          | -                                            | No       |
| `NEON_API_KEY`     | Neon Cloud API key (for Neon Local)     | -                                            | ✅ Yes   |
| `NEON_PROJECT_ID`  | Neon Cloud Project ID (for Neon Local)  | -                                            | ✅ Yes   |
| `PARENT_BRANCH_ID` | Parent branch ID for ephemeral branches | -                                            | No       |

### Production (`.env.production`)

| Variable       | Description                  | Required              |
| -------------- | ---------------------------- | --------------------- |
| `DATABASE_URL` | Neon Cloud connection string | ✅ Yes                |
| `NODE_ENV`     | Environment mode             | ✅ Yes (`production`) |
| `PORT`         | Application port             | No (default: 3000)    |
| `ARCJET_KEY`   | Arcjet API key               | ✅ Yes                |

## Docker Commands Reference

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Execute command in app container
docker-compose -f docker-compose.dev.yml exec app <command>
```

### Production

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Rebuild and start
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Architecture

### Development Environment

```
┌─────────────────┐         ┌──────────────┐
│   App Container │────────▶│ Neon Local   │
│   (Bun Runtime) │         │ (Postgres)   │
│   Port: 3000    │         │ Port: 5432   │
└─────────────────┘         └──────────────┘
```

- App container connects to Neon Local via Docker network
- Source code mounted as volumes for hot reload
- Neon Local provides standard Postgres interface
- Ephemeral branches created automatically for isolated development

### Production Environment

```
┌─────────────────┐         ┌──────────────────┐
│   App Container │────────▶│  Neon Cloud      │
│   (Bun Runtime) │         │  (Serverless)    │
│   Port: 3000    │         │  (External)      │
└─────────────────┘         └──────────────────┘
```

- App container connects to Neon Cloud via HTTPS
- No local database container
- Production-optimized build
- Environment variables injected at runtime

## Troubleshooting

### Database Connection Issues

**Development:**

- Ensure Neon Local container is healthy: `docker-compose -f docker-compose.dev.yml ps`
- Check Neon Local logs: `docker-compose -f docker-compose.dev.yml logs neon-local`
- Verify `DATABASE_URL` in `.env.development` matches the Neon Local service name (`neon-local`)

**Production:**

- Verify `DATABASE_URL` is correctly formatted with SSL: `?sslmode=require`
- Check network connectivity to Neon Cloud
- Verify credentials are correct

### Port Already in Use

If port 3000 is already in use:

1. Change `PORT` in your `.env` file
2. Update port mapping in `docker-compose.*.yml`:
   ```yaml
   ports:
     - '${PORT}:${PORT}'
   ```

### Hot Reload Not Working (Development)

- Ensure volumes are properly mounted in `docker-compose.dev.yml`
- Check that `bun --watch` command is running in the container
- Verify file permissions on mounted volumes

### Build Failures

- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Dockerfile syntax and base image availability

## Security Notes

- **Never commit** `.env.development` or `.env.production` files with real credentials
- Use secret management systems (AWS Secrets Manager, HashiCorp Vault) in production
- Always use SSL/TLS (`sslmode=require`) for production database connections
- Rotate credentials regularly
- Review Docker image security: `docker scan <image-name>`

## Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Cloud Documentation](https://neon.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Bun Documentation](https://bun.sh/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## Project Structure

```
.
├── src/
│   ├── config/          # Configuration files (database, logger, etc.)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models (Drizzle ORM)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validations/     # Input validation schemas
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server initialization
│   └── index.ts         # Entry point
├── drizzle/             # Database migrations
├── Dockerfile           # Production Docker image
├── docker-compose.dev.yml   # Development environment
├── docker-compose.prod.yml  # Production environment
├── .env.development.example # Development env template
├── .env.production.example  # Production env template
└── package.json         # Dependencies and scripts
```

## License

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
