# Project Documentation - dev_ops_compare

> **Purpose**: This document serves as a comprehensive reference guide for setting up and understanding the dev_ops_compare project architecture, patterns, and best practices. It is designed to be used as a template for future agentic coding projects.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Design](#2-architecture--design)
3. [Technology Stack Deep Dive](#3-technology-stack-deep-dive)
4. [Project Structure Analysis](#4-project-structure-analysis)
5. [Configuration Files Deep Dive](#5-configuration-files-deep-dive)
6. [Development Workflow](#6-development-workflow)
7. [Production Deployment](#7-production-deployment)
8. [Code Patterns & Conventions](#8-code-patterns--conventions)
9. [Security Implementation](#9-security-implementation)
10. [Database Management](#10-database-management)
11. [Logging & Monitoring](#11-logging--monitoring)
12. [Scripts & Automation](#12-scripts--automation)
13. [Improvements & Recommendations](#13-improvements--recommendations)
14. [Best Practices for Agentic Coding](#14-best-practices-for-agentic-coding)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Future Project Setup Checklist](#16-future-project-setup-checklist)
17. [B2B Providers & Backend-as-a-Service Platforms](#17-b2b-providers--backend-as-a-service-platforms)
18. [Adapting to Other Technology Stacks](#18-adapting-to-other-technology-stacks)

---

## 1. Project Overview

### Purpose and Goals

The `dev_ops_compare` project is a **Bun-based Express.js API application** designed as a production-ready starter template. It demonstrates:

- Modern TypeScript backend development with Bun runtime
- Docker-based development and production workflows
- Neon Database integration (both local and cloud)
- Comprehensive security implementation with Arcjet
- Clean architecture patterns (controllers, services, models)
- Authentication and authorization system
- Structured logging and monitoring

> **Important**: While this project uses specific technologies (Bun, Express, Neon), the architectural patterns, project structure, and best practices documented here are **technology-agnostic** and can be adapted to any stack. See [Section 17: B2B Providers & Backend-as-a-Service Platforms](#17-b2b-providers--backend-as-a-service-platforms) for alternatives like Convex, Supabase, PlanetScale, and others, and [Section 18: Adapting to Other Technology Stacks](#18-adapting-to-other-technology-stacks) for guidance on applying these patterns to different runtimes, frameworks, and databases.

### Key Features

- ✅ **Bun Runtime**: Fast JavaScript/TypeScript runtime alternative to Node.js
- ✅ **Express.js 5.x**: Modern web framework
- ✅ **TypeScript**: Full type safety
- ✅ **Drizzle ORM**: Type-safe database queries
- ✅ **Neon Database**: Serverless Postgres (Local + Cloud)
- ✅ **Arcjet Security**: Rate limiting, bot detection, shield protection
- ✅ **JWT Authentication**: Token-based auth with secure cookies
- ✅ **Winston Logging**: Structured logging with file and console outputs
- ✅ **Docker Support**: Development and production containers
- ✅ **Hot Reload**: Development workflow with file watching
- ✅ **Path Aliases**: Clean imports with `#config/*`, `#utils/*`, etc.
- ✅ **Zod Validation**: Runtime type validation
- ✅ **ESLint + Prettier**: Code quality and formatting

### Tech Stack Summary

| Category     | Technology        | Version             | Purpose                      |
| ------------ | ----------------- | ------------------- | ---------------------------- |
| Runtime      | Bun               | Latest              | Fast JavaScript runtime      |
| Framework    | Express.js        | ^5.2.1              | Web framework                |
| Language     | TypeScript        | ^5.9.3              | Type-safe JavaScript         |
| Database     | Neon (Postgres)   | Latest              | Serverless database          |
| ORM          | Drizzle ORM       | ^0.45.1             | Type-safe SQL queries        |
| Security     | Arcjet            | ^1.0.0-beta.16      | Rate limiting, bot detection |
| Validation   | Zod               | ^4.3.5              | Schema validation            |
| Logging      | Winston           | ^3.19.0             | Structured logging           |
| Auth         | JWT + Cookies     | jsonwebtoken ^9.0.3 | Authentication               |
| Container    | Docker            | Latest              | Containerization             |
| Code Quality | ESLint + Prettier | Latest              | Linting and formatting       |

---

## 2. Architecture & Design

### System Architecture

```mermaid
graph TB
    Client[Client Application] -->|HTTP Request| Express[Express App]
    Express --> Security[Arcjet Security Middleware]
    Security -->|Rate Limit Check| RateLimit{Rate Limit?}
    RateLimit -->|Allowed| Routes[Route Handlers]
    RateLimit -->|Denied| Error[403 Forbidden]
    Routes --> Controller[Controllers]
    Controller --> Validation[Zod Validation]
    Validation -->|Valid| Service[Services]
    Validation -->|Invalid| ValidationError[400 Bad Request]
    Service --> Database[(Neon Database)]
    Service --> Logger[Winston Logger]
    Controller -->|Response| Express
    Express -->|HTTP Response| Client
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Arcjet
    participant Routes
    participant Controller
    participant Validation
    participant Service
    participant Database
    participant Logger

    Client->>Express: HTTP Request
    Express->>Arcjet: Security Check
    Arcjet->>Arcjet: Rate Limit Check
    Arcjet->>Arcjet: Bot Detection
    Arcjet->>Arcjet: Shield Protection
    alt Request Allowed
        Arcjet->>Routes: Forward Request
        Routes->>Controller: Route to Handler
        Controller->>Validation: Validate Input
        alt Validation Passed
            Validation->>Service: Process Business Logic
            Service->>Database: Query/Update Data
            Database-->>Service: Return Data
            Service->>Logger: Log Action
            Service-->>Controller: Return Result
            Controller-->>Express: JSON Response
            Express-->>Client: HTTP Response
        else Validation Failed
            Validation-->>Controller: Validation Error
            Controller-->>Express: 400 Bad Request
            Express-->>Client: Error Response
        end
    else Request Denied
        Arcjet-->>Express: 403 Forbidden
        Express-->>Client: Error Response
    end
```

### Docker Architecture

#### Development Environment

```mermaid
graph LR
    DevHost[Development Host] -->|docker-compose| DevNetwork[Docker Network]
    DevNetwork --> AppDev[App Container<br/>Bun Runtime<br/>Hot Reload]
    DevNetwork --> NeonLocal[Neon Local Container<br/>Postgres Database]
    AppDev -->|Volume Mount| SourceCode[Source Code<br/>./src]
    AppDev -->|Network| NeonLocal
    NeonLocal -->|Ephemeral Branches| NeonCloud[Neon Cloud<br/>API]
```

#### Production Environment

```mermaid
graph LR
    ProdHost[Production Host] -->|docker-compose| ProdNetwork[Docker Network]
    ProdNetwork --> AppProd[App Container<br/>Bun Runtime<br/>Optimized Build]
    AppProd -->|HTTPS| NeonCloud[Neon Cloud<br/>Serverless Postgres]
    AppProd -->|Environment| EnvVars[Environment Variables<br/>.env.production]
```

### Security Layers

```mermaid
graph TB
    Request[Incoming Request] --> Helmet[Helmet<br/>Security Headers]
    Helmet --> CORS[CORS<br/>Cross-Origin]
    CORS --> Arcjet[Arcjet Security]
    Arcjet --> Shield[Shield Protection]
    Arcjet --> BotDetect[Bot Detection]
    Arcjet --> RateLimit[Rate Limiting<br/>Role-Based]
    RateLimit --> Auth[Authentication<br/>JWT Verification]
    Auth --> Authorize[Authorization<br/>Role Check]
    Authorize --> AppLogic[Application Logic]
```

### Database Architecture

```mermaid
erDiagram
    USERS {
        serial id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        timestamp created_at
        timestamp updated_at
    }
```

---

## 3. Technology Stack Deep Dive

### Runtime: Bun

**Why Bun?**

Bun is a fast, all-in-one JavaScript runtime that provides:

- **Speed**: Up to 3x faster than Node.js for many operations
- **Built-in Tools**: Package manager, bundler, test runner included
- **TypeScript Support**: Native TypeScript execution without compilation
- **Web APIs**: Built-in support for fetch, WebSocket, etc.
- **Compatibility**: Drop-in replacement for Node.js in most cases

**Benefits for This Project:**

- Fast startup time for development
- Native TypeScript execution (no build step needed)
- Built-in package manager (`bun install`)
- Excellent Docker image support (`oven/bun:latest`)

**Alternatives Considered:**

- Node.js: More mature ecosystem, slower performance
- Deno: Good security model, but less compatible with npm packages

### Framework: Express.js 5.x

Express.js 5.x brings:

- Improved TypeScript support
- Better async/await handling
- Enhanced middleware system
- Modern JavaScript features

**Key Features Used:**

- Middleware chain (helmet, cors, cookie-parser, morgan)
- Route handlers
- Request/Response objects
- Error handling

### Database: Neon (Local + Cloud)

> **Note**: While this project uses Neon, there are many excellent B2B database providers available. See [Section 17: B2B Providers & Backend-as-a-Service Platforms](#17-b2b-providers--backend-as-a-service-platforms) for alternatives like Convex, Supabase, PlanetScale, Turso, and others.

**Neon Local:**

- Local Postgres database for development
- Automatic ephemeral branch creation
- Syncs with Neon Cloud for schema management
- Docker containerized

**Neon Cloud:**

- Serverless Postgres database
- Auto-scaling
- Branching for schema changes
- HTTPS connection required

**Connection Handling:**
The `@neondatabase/serverless` package automatically detects connection string type:

- Neon Cloud URLs → HTTP proxy (serverless)
- Standard Postgres URLs → Postgres protocol (Neon Local)

### ORM: Drizzle ORM

**Why Drizzle?**

- Type-safe queries
- SQL-like syntax
- Lightweight and performant
- Excellent TypeScript support
- Migration system built-in

**Key Features:**

- Schema definitions in TypeScript
- Type inference for queries
- Migration generation and execution
- Drizzle Studio for database GUI

### Security: Arcjet

**Arcjet Components:**

1. **Shield**: General protection against malicious requests
2. **Bot Detection**: Identifies and blocks automated requests
3. **Rate Limiting**: Sliding window rate limiting by user role

**Configuration:**

- Global rate limit: 5 requests per 2 seconds
- Role-based limits:
  - Guest: 5 requests/minute
  - User: 10 requests/minute
  - Admin: 20 requests/minute

### Validation: Zod

**Why Zod?**

- Runtime type validation
- TypeScript-first
- Composable schemas
- Great error messages
- Type inference

**Usage Pattern:**

```typescript
const schema = z.object({...})
const result = schema.safeParse(data)
if (!result.success) {
  // Handle validation errors
}
```

### Logging: Winston

**Configuration:**

- File logging: `logs/combined.log`, `logs/error.log`
- Console logging: Development only (colorized)
- JSON format: Production
- Log levels: error, warn, info, debug

### Authentication: JWT + Cookies

**JWT Configuration:**

- Secret: `JWT_SECRET` environment variable
- Expiration: `JWT_EXPIRES_IN` (default: 1h)
- Algorithm: HS256 (default)

**Cookie Configuration:**

- HttpOnly: true (prevents XSS)
- Secure: true in production (HTTPS only)
- SameSite: strict (CSRF protection)
- MaxAge: 15 minutes

---

## 4. Project Structure Analysis

### Directory Structure

```
dev_ops_compare/
├── src/                          # Source code
│   ├── config/                   # Configuration modules
│   │   ├── arcjet.ts            # Arcjet security setup
│   │   ├── database.ts          # Database connection (Drizzle)
│   │   └── logger.ts            # Winston logger setup
│   ├── controllers/             # Request handlers
│   │   └── auth.controller.ts   # Authentication controllers
│   ├── middleware/              # Express middleware
│   │   └── security.middleware.ts # Arcjet security middleware
│   ├── models/                  # Database models (Drizzle schemas)
│   │   └── user.model.ts        # User model definition
│   ├── routes/                  # API route definitions
│   │   └── auth.routes.ts       # Authentication routes
│   ├── services/                # Business logic layer
│   │   └── auth.service.ts      # Authentication service
│   ├── types/                   # TypeScript type definitions
│   │   └── index.d.ts          # Global type augmentations
│   ├── utils/                   # Utility functions
│   │   ├── cookies.ts          # Cookie helper functions
│   │   ├── format.ts           # Formatting utilities
│   │   └── jwt.ts              # JWT token utilities
│   ├── validations/             # Zod validation schemas
│   │   └── auth.validation.ts  # Auth validation schemas
│   ├── app.ts                   # Express app configuration
│   ├── server.ts                # Server initialization
│   └── index.ts                 # Application entry point
├── drizzle/                     # Database migrations
│   ├── meta/                    # Migration metadata
│   └── *.sql                    # SQL migration files
├── logs/                        # Log files (gitignored)
├── scripts/                     # Shell scripts
│   ├── dev.sh                   # Development startup script
│   └── prod.sh                  # Production startup script
├── .dockerignore                # Docker build ignore patterns
├── .gitignore                   # Git ignore patterns
├── .prettierrc                  # Prettier configuration
├── docker-compose.dev.yml       # Development Docker Compose
├── docker-compose.prod.yml      # Production Docker Compose
├── Dockerfile                   # Docker image definition
├── drizzle.config.js            # Drizzle ORM configuration
├── eslint.config.js             # ESLint configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project README
```

### File Organization Patterns

**Separation of Concerns:**

1. **Controllers** (`src/controllers/`): Handle HTTP requests/responses
   - Extract data from requests
   - Call services
   - Format responses
   - Handle errors

2. **Services** (`src/services/`): Business logic
   - Database operations
   - Data transformation
   - Business rules
   - No HTTP knowledge

3. **Models** (`src/models/`): Database schemas
   - Drizzle table definitions
   - Type-safe schema definitions

4. **Routes** (`src/routes/`): Route definitions
   - Map URLs to controllers
   - Middleware application
   - Route grouping

5. **Validations** (`src/validations/`): Input validation
   - Zod schemas
   - Validation rules
   - Type inference

6. **Middleware** (`src/middleware/`): Express middleware
   - Request processing
   - Security checks
   - Logging

7. **Utils** (`src/utils/`): Reusable utilities
   - Pure functions
   - Helper functions
   - No business logic

8. **Config** (`src/config/`): Configuration modules
   - Singleton instances
   - Environment-based config
   - Initialization logic

### Path Aliases Configuration

Path aliases are configured in `package.json`:

```json
"imports": {
  "#config/*": "./src/config/*",
  "#controllers/*": "./src/controllers/*",
  "#middleware/*": "./src/middleware/*",
  "#models/*": "./src/models/*",
  "#routes/*": "./src/routes/*",
  "#services/*": "./src/services/*",
  "#utils/*": "./src/utils/*",
  "#validations/*": "./src/validations/*"
}
```

**Benefits:**

- Clean imports: `import logger from '#config/logger.ts'`
- No relative path hell: `../../../config/logger`
- Easy refactoring
- Better IDE support

**Usage:**

```typescript
// Instead of:
import logger from '../../../config/logger'

// Use:
import logger from '#config/logger.ts'
```

---

## 5. Configuration Files Deep Dive

### package.json

**Key Sections:**

1. **Path Aliases** (`imports`): Module resolution aliases
2. **Scripts**: Development and build commands
3. **Dependencies**: Production dependencies
4. **DevDependencies**: Development-only dependencies

**Important Scripts:**

- `dev`: Development server with hot reload
- `start`: Production server
- `lint`: Run ESLint
- `lint:fix`: Fix ESLint errors
- `format`: Format code with Prettier
- `type-check`: TypeScript type checking
- `db:generate`: Generate Drizzle migrations
- `db:migrate`: Run database migrations
- `db:studio`: Open Drizzle Studio
- `dev:docker`: Start development with Docker
- `prod:docker`: Start production with Docker

### tsconfig.json

**Key Settings:**

- `target: "ESNext"`: Use latest JavaScript features
- `module: "Preserve"`: Preserve module syntax (Bun handles it)
- `moduleResolution: "bundler"`: Bundler-style resolution
- `strict: true`: Enable all strict type checks
- `noUncheckedIndexedAccess: true`: Require index checks
- `noEmit: true`: No compilation output (Bun runs TS directly)

**Why These Settings:**

- Optimized for Bun runtime
- Maximum type safety
- Modern JavaScript features
- No build step needed

### eslint.config.js

**Configuration Highlights:**

- TypeScript parser and plugin
- Recommended JavaScript rules
- Custom rules:
  - 2-space indentation
  - Single quotes
  - Semicolons required
  - Unix line endings
  - Prefer const
  - No var
  - Object shorthand
  - Prefer arrow functions

**Ignores:**

- `node_modules/`
- `coverage/`
- `logs/`
- `drizzle/`

### .prettierrc

**Configuration:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Note:** There's a conflict between ESLint (`semi: "always"`) and Prettier (`semi: false`). This should be resolved (see Improvements section).

### drizzle.config.js

**Configuration:**

- Schema location: `./src/models/*.model.ts`
- Output directory: `./drizzle`
- Dialect: PostgreSQL
- Database URL: From `DATABASE_URL` environment variable

**Usage:**

- `bun run db:generate`: Generate migrations from schema changes
- `bun run db:migrate`: Apply migrations to database
- `bun run db:studio`: Open database GUI

### Dockerfile

**Multi-Stage Build:**

1. **base**: Bun base image, working directory
2. **install**: Install all dependencies (dev + prod)
3. **install-prod**: Install production dependencies only
4. **prerelease**: Copy prod dependencies, copy source (for dev)
5. **build**: Build step (currently empty, TS handled by Bun)
6. **release**: Final production image with minimal files

**Key Features:**

- Layer caching for faster builds
- Production-only dependencies in final image
- Small final image size
- TypeScript handled at runtime by Bun

### docker-compose.dev.yml

**Services:**

1. **app**: Application container
   - Build target: `prerelease` (includes dev dependencies)
   - Volumes: Source code mounted for hot reload
   - Command: `bun --watch src/index.ts`
   - Depends on: `neon-local`

2. **neon-local**: Neon Local database
   - Image: `neondatabase/neon_local:latest`
   - Port: 5432
   - Environment: From `.env.development`

**Network:** `dev_ops_compare_network`

### docker-compose.prod.yml

**Services:**

1. **app**: Production application container
   - Build target: `release` (production only)
   - No volume mounts (code baked into image)
   - Environment: From `.env.production`
   - Restart policy: `unless-stopped`

**Network:** `dev_ops_compare_network_prod`

### .gitignore

**Ignored:**

- Dependencies: `node_modules/`
- Build outputs: `out/`, `dist/`
- Logs: `logs/`, `*.log`
- Environment files: `.env*` (except examples)
- IDE files: `.idea/`
- OS files: `.DS_Store`
- Cache: `.eslintcache`, `*.tsbuildinfo`
- Coverage: `coverage/`

### .dockerignore

**Excluded from Docker Build:**

- `node_modules/` (installed in container)
- `logs/` (runtime only)
- `.git/` (not needed in image)
- Test files: `**/*.test.ts`, `**/*.spec.ts`
- IDE files: `.idea/`, `.vscode/`
- Environment files: `.env*`

**Note:** `drizzle/` migrations are included (needed for `db:migrate`)

---

## 6. Development Workflow

### Local Development (Without Docker)

1. **Install Dependencies:**

   ```bash
   bun install
   ```

2. **Set Up Environment:**

   ```bash
   cp .env.development.example .env.development
   # Edit .env.development with your values
   ```

3. **Start Database:**
   - Use Neon Local: `docker run -d -p 5432:5432 neondatabase/neon_local:latest`
   - Or use Neon Cloud connection string

4. **Run Migrations:**

   ```bash
   bun run db:migrate
   ```

5. **Start Development Server:**

   ```bash
   bun run dev
   ```

6. **Access Application:**
   - App: http://localhost:3000
   - Health: http://localhost:3000/health
   - API: http://localhost:3000/api

### Docker Development Workflow

1. **Set Up Environment:**

   ```bash
   cp .env.development.example .env.development
   # Edit .env.development
   ```

2. **Start Development Environment:**

   ```bash
   bun run dev:docker
   # Or manually:
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **The Script Does:**
   - Checks for `.env.development`
   - Checks Docker is running
   - Creates `.neon_local/` directory
   - Starts containers
   - Waits for Neon Local to be ready
   - Runs database migrations
   - Shows logs

4. **Hot Reload:**
   - Source code changes trigger automatic restart
   - `bun --watch` monitors file changes
   - Volumes mount `./src` into container

5. **Database Migrations:**

   ```bash
   # Generate migration from schema changes
   docker-compose -f docker-compose.dev.yml exec app bun run db:generate

   # Apply migrations
   docker-compose -f docker-compose.dev.yml exec app bun run db:migrate

   # Open Drizzle Studio
   docker-compose -f docker-compose.dev.yml exec app bun run db:studio
   ```

6. **View Logs:**

   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

7. **Stop Environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   # Remove volumes:
   docker-compose -f docker-compose.dev.yml down -v
   ```

### Code Quality Checks

**Linting:**

```bash
bun run lint          # Check for errors
bun run lint:fix      # Auto-fix errors
```

**Formatting:**

```bash
bun run format        # Format all files
bun run format:check  # Check formatting
```

**Type Checking:**

```bash
bun run type-check    # TypeScript type checking
```

**Pre-commit Workflow (Recommended):**

```bash
bun run lint && bun run format && bun run type-check
```

---

## 7. Production Deployment

### Production Build Process

1. **Build Docker Image:**

   ```bash
   docker build -t dev-ops-compare:latest .
   ```

2. **The Build Process:**
   - Uses `release` stage from Dockerfile
   - Installs production dependencies only
   - Copies application code
   - Sets `NODE_ENV=production`
   - Exposes port 3000

### Environment Variables

**Required for Production (`.env.production`):**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require
ARCJET_KEY=your_arcjet_key
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1h
LOG_LEVEL=info
```

**Security Notes:**

- Never commit `.env.production` to git
- Use secret management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use strong JWT secrets (32+ characters)

### Docker Production Setup

1. **Set Up Environment:**

   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with production values
   ```

2. **Start Production:**

   ```bash
   bun run prod:docker
   # Or manually:
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run Migrations:**

   ```bash
   docker-compose -f docker-compose.prod.yml exec app bun run db:migrate
   ```

4. **Monitor Logs:**

   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

5. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

### Neon Cloud Integration

**Connection String Format:**

```
postgres://user:password@host.neon.tech/dbname?sslmode=require
```

**Important:**

- Always use `sslmode=require` for production
- Connection is serverless (no persistent connections)
- Auto-scales based on load
- Branching available for schema changes

### Security Considerations

1. **HTTPS**: Use reverse proxy (nginx, Traefik) for HTTPS
2. **Secrets**: Never hardcode secrets, use environment variables
3. **Database**: Use SSL connections (`sslmode=require`)
4. **Cookies**: Secure flag enabled in production
5. **Headers**: Helmet middleware sets security headers
6. **Rate Limiting**: Arcjet protects against abuse
7. **CORS**: Configure allowed origins properly

---

## 8. Code Patterns & Conventions

### Authentication Flow

**Sign Up Flow:**

```typescript
Request → Controller → Validation → Service → Database → JWT → Cookie → Response
```

**Sign In Flow:**

```typescript
Request → Controller → Validation → Service → Database (verify password) → JWT → Cookie → Response
```

**Sign Out Flow:**

```typescript
Request → Controller → Clear Cookie → Response
```

### Error Handling Pattern

**Controller Pattern:**

```typescript
export const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation
    const validationResult = schema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidations(validationResult.error),
      })
    }

    // Business logic
    const result = await service.doSomething(validationResult.data)

    // Success response
    res.status(200).json({ message: 'Success', data: result })
  } catch (error) {
    // Specific error handling
    if ((error as Error).message === 'Specific Error') {
      return res.status(409).json({ error: (error as Error).message })
    }

    // Generic error handling
    logger.error('Error in handler', error)
    next(error)
  }
}
```

### Validation Pattern (Zod)

**Schema Definition:**

```typescript
export const signUpSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(255).trim(),
  role: z.enum(['admin', 'user']).default('user'),
})
```

**Usage:**

```typescript
const result = schema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({
    error: 'Validation Failed',
    details: formatValidations(result.error),
  })
}
const { name, email, password } = result.data // Type-safe!
```

### Service Layer Pattern

**Service Functions:**

```typescript
export const createUser = async ({ name, email, password, role }: CreateUserParams) => {
  try {
    // Check existing
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      throw new Error('User already exists')
    }

    // Process data
    const passwordHash = await hashPassword(password)

    // Database operation
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: passwordHash,
      role,
    }).returning({...})

    logger.info(`User created: ${newUser.email}`)
    return newUser
  } catch (error) {
    logger.error('Error creating user', error)
    throw error
  }
}
```

**Key Principles:**

- No HTTP knowledge (no Request/Response)
- Pure business logic
- Database operations
- Error throwing (not handling)
- Logging important actions

### Controller Pattern

**Controller Structure:**

```typescript
export const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate input
    const validation = schema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({...})
    }

    // 2. Call service
    const result = await service.doWork(validation.data)

    // 3. Generate token (if auth)
    const token = jwtToken.sign({ id: result.id })

    // 4. Set cookie (if auth)
    cookies.set(res, 'token', token)

    // 5. Log action
    logger.info(`Action completed: ${result.id}`)

    // 6. Return response
    res.status(201).json({
      message: 'Success',
      data: result,
    })
  } catch (error) {
    // Handle specific errors
    if (error.message === 'Specific') {
      return res.status(409).json({ error: error.message })
    }

    // Generic error
    logger.error('Handler error', error)
    next(error)
  }
}
```

### Middleware Pattern

**Security Middleware:**

```typescript
export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user role
    const role = req.user?.role || 'guest'

    // Configure rate limit based on role
    const limit = getLimitForRole(role)

    // Create Arcjet client with rule
    const client = aj.withRule(slidingWindow({ interval: '1m', max: limit }))

    // Create fetch request for Arcjet
    const fetchRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
    })

    // Check with Arcjet
    const decision = await client.protect(fetchRequest)

    // Handle denial reasons
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        return res.status(403).json({ error: 'Bots not allowed' })
      }
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: 'Too many requests' })
      }
    }

    // Allow request
    next()
  } catch (error) {
    logger.error('Security middleware error', error)
    res.status(500).json({ error: 'Security check failed' })
  }
}
```

### Type Definitions

**Global Type Augmentation:**

```typescript
// src/types/index.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: number
        email?: string
        role?: string
        createdAt?: Date
        updatedAt?: Date
      }
    }
  }
}
```

**Usage:**

```typescript
// TypeScript knows about req.user
const userId = req.user?.id
```

---

## 9. Security Implementation

### Arcjet Integration

**Configuration (`src/config/arcjet.ts`):**

```typescript
const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }), // General protection
    detectBot({
      // Bot detection
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    slidingWindow({
      // Global rate limit
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
})
```

**Middleware Usage (`src/middleware/security.middleware.ts`):**

- Role-based rate limiting
- Bot detection
- Shield protection
- Request logging

### Rate Limiting by Role

**Limits:**

- Guest: 5 requests/minute
- User: 10 requests/minute
- Admin: 20 requests/minute

**Implementation:**

```typescript
const role = req.user?.role || 'guest'
const limit = getLimitForRole(role) // 5, 10, or 20
const client = aj.withRule(slidingWindow({ interval: '1m', max: limit }))
```

### Bot Detection

**Configuration:**

- Blocks all bots except search engines
- Logs blocked bot requests
- Returns 403 Forbidden

**Detection:**

```typescript
if (decision.isDenied() && decision.reason.isBot()) {
  logger.warn('Bot blocked', { ip: req.ip, userAgent: req.get('User-Agent') })
  return res.status(403).json({ error: 'Automated requests not allowed' })
}
```

### Shield Protection

**Purpose:** General protection against malicious requests

**Response:**

```typescript
if (decision.isDenied() && decision.reason.isShield()) {
  logger.warn('Shield blocked', { ip: req.ip, path: req.path })
  return res.status(403).json({ error: 'Request blocked by security policy' })
}
```

### JWT Token Management

**Signing (`src/utils/jwt.ts`):**

```typescript
export const jwtToken = {
  sign: (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  },
  verify: (token: string) => {
    return jwt.verify(token, JWT_SECRET)
  },
}
```

**Usage:**

```typescript
// Sign token
const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role })

// Verify token (in auth middleware)
const decoded = jwtToken.verify(token)
```

**Security:**

- Secret from environment variable
- Expiration time configurable
- Payload should not include sensitive data

### Cookie Security

**Configuration (`src/utils/cookies.ts`):**

```typescript
export const cookies = {
  getOptions: (): CookieOptions => ({
    httpOnly: true, // Prevents XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict', // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
  }),
  set: (res: Response, name: string, value: string) => {
    res.cookie(name, value, cookies.getOptions())
  },
  clear: (res: Response, name: string) => {
    res.clearCookie(name, cookies.getOptions())
  },
}
```

**Security Features:**

- `httpOnly`: Prevents JavaScript access (XSS protection)
- `secure`: HTTPS only in production
- `sameSite: strict`: CSRF protection
- Short expiration (15 minutes)

### Password Hashing

**Implementation (`src/services/auth.service.ts`):**

```typescript
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword)
}
```

**Security:**

- Salt rounds: 10 (good balance of security and performance)
- Never store plain text passwords
- Use `bcrypt.compare` for verification (timing-safe)

### Helmet Middleware

**Configuration (`src/app.ts`):**

```typescript
app.use(helmet())
```

**Protects Against:**

- XSS attacks
- Clickjacking
- MIME type sniffing
- Information disclosure

---

## 10. Database Management

### Drizzle ORM Setup

**Configuration (`drizzle.config.js`):**

```typescript
export default {
  schema: './src/models/*.model.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}
```

**Database Connection (`src/config/database.ts`):**

```typescript
import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

// Configure for Neon Local in development
if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'neon-local:5432'
  neonConfig.useSecureWebSocket = false
  neonConfig.poolQueryViaFetch = true
}

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

export { db, sql }
```

**Key Points:**

- Automatically detects Neon Cloud vs Neon Local
- Uses HTTP proxy for Neon Cloud (serverless)
- Uses Postgres protocol for Neon Local

### Migration Workflow

**1. Make Schema Changes:**
Edit `src/models/*.model.ts`

**2. Generate Migration:**

```bash
bun run db:generate
```

**3. Review Generated SQL:**
Check `drizzle/0000_*.sql`

**4. Apply Migration:**

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app bun run db:migrate

# Production
docker-compose -f docker-compose.prod.yml exec app bun run db:migrate

# Local
bun run db:migrate
```

**5. Verify:**

```bash
bun run db:studio
```

### Model Definitions

**Example (`src/models/user.model.ts`):**

```typescript
import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

**Key Features:**

- Type-safe column definitions
- Constraints (notNull, unique, default)
- Type inference for queries

### Query Patterns

**Select:**

```typescript
// Single user
const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

// All users
const allUsers = await db.select().from(users)
```

**Insert:**

```typescript
const [newUser] = await db
  .insert(users)
  .values({
    name,
    email,
    password: hash,
    role,
  })
  .returning({
    id: users.id,
    name: users.name,
    email: users.email,
  })
```

**Update:**

```typescript
const [updated] = await db
  .update(users)
  .set({ name: 'New Name' })
  .where(eq(users.id, userId))
  .returning()
```

**Delete:**

```typescript
await db.delete(users).where(eq(users.id, userId))
```

### Neon Local vs Neon Cloud

**Neon Local (Development):**

- Docker container
- Local Postgres database
- Ephemeral branches
- Syncs with Neon Cloud schema
- Fast iteration

**Neon Cloud (Production):**

- Serverless Postgres
- Auto-scaling
- HTTPS connection required
- Branching for schema changes
- Managed backups

**Connection Handling:**
The `@neondatabase/serverless` package automatically detects:

- Neon Cloud URL → HTTP proxy
- Standard Postgres URL → Postgres protocol

---

## 11. Logging & Monitoring

### Winston Configuration

**Setup (`src/config/logger.ts`):**

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'dev-ops-compare-api',
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  )
}
```

### Log Levels

**Available Levels:**

- `error`: Error events
- `warn`: Warning events
- `info`: Informational messages
- `debug`: Debug messages
- `verbose`: Verbose messages
- `silly`: Silly messages

**Usage:**

```typescript
logger.error('Error message', error)
logger.warn('Warning message', { context })
logger.info('Info message', { data })
logger.debug('Debug message', { details })
```

### File Logging

**Files:**

- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All logs

**Format:** JSON (structured logging)

**Example Log Entry:**

```json
{
  "level": "info",
  "message": "User signed up successfully",
  "service": "dev-ops-compare-api",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Console Logging

**Development Only:**

- Colorized output
- Simple format (readable)
- All log levels

**Production:**

- No console logging (file only)
- Reduces noise
- Better performance

### Structured Logging

**Best Practices:**

```typescript
// Good: Structured data
logger.info('User created', {
  userId: user.id,
  email: user.email,
  role: user.role,
})

// Bad: String concatenation
logger.info(`User created: ${user.id} - ${user.email}`)
```

**Benefits:**

- Easy to parse
- Searchable
- Queryable (if using log aggregation)
- Consistent format

### Morgan Integration

**HTTP Request Logging (`src/app.ts`):**

```typescript
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
)
```

**Format:** Apache combined log format

**Example:**

```
127.0.0.1 - - [15/Jan/2024:10:30:00 +0000] "GET /api/auth/sign-in HTTP/1.1" 200 123
```

---

## 12. Scripts & Automation

### Development Startup Script (`scripts/dev.sh`)

**What It Does:**

1. Checks for `.env.development` file
2. Verifies Docker is running
3. Creates `.neon_local/` directory
4. Adds `.neon_local/` to `.gitignore` if missing
5. Starts Docker Compose services
6. Waits for Neon Local to be ready
7. Runs database migrations
8. Shows success message and logs

**Usage:**

```bash
bun run dev:docker
# Or:
sh ./scripts/dev.sh
```

### Production Startup Script (`scripts/prod.sh`)

**What It Does:**

1. Checks for `.env.production` file
2. Verifies Docker is running
3. Builds and starts production containers
4. Waits for container startup
5. Runs database migrations
6. Shows success message and useful commands

**Usage:**

```bash
bun run prod:docker
# Or:
sh ./scripts/prod.sh
```

**Note:** There's a bug in the script - it references `acquisition-app-prod` instead of `dev_ops_compare_app_prod` (see Improvements section).

### NPM/Bun Scripts

**Development:**

- `dev`: Start dev server with hot reload
- `dev:docker`: Start development with Docker

**Production:**

- `start`: Start production server
- `prod:docker`: Start production with Docker

**Code Quality:**

- `lint`: Run ESLint
- `lint:fix`: Fix ESLint errors
- `format`: Format with Prettier
- `format:check`: Check formatting
- `type-check`: TypeScript type checking

**Database:**

- `db:generate`: Generate migrations
- `db:migrate`: Run migrations
- `db:studio`: Open Drizzle Studio

### Migration Scripts

**Generate Migration:**

```bash
bun run db:generate
```

**Apply Migration:**

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app bun run db:migrate

# Production
docker-compose -f docker-compose.prod.yml exec app bun run db:migrate

# Local
bun run db:migrate
```

**Open Drizzle Studio:**

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app bun run db:studio

# Local
bun run db:studio
```

---

## 13. Improvements & Recommendations

### Missing Features

#### Testing Infrastructure

**Current State:** No tests implemented

**Recommendations:**

- Add unit tests for services
- Add integration tests for API endpoints
- Add E2E tests for critical flows
- Use Bun's built-in test runner or Vitest
- Target: 80%+ code coverage

**Implementation:**

```bash
bun add -d vitest @vitest/ui
```

Create `vitest.config.ts` and test files in `src/**/*.test.ts`

#### CI/CD Pipeline

**Current State:** No CI/CD

**Recommendations:**

- GitHub Actions workflow
- Run tests on PR
- Lint and type-check on PR
- Build Docker image on merge
- Deploy to staging/production

**Example GitHub Actions:**

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun test
```

#### Error Handling Middleware

**Current State:** Basic error handling in controllers

**Recommendations:**

- Centralized error handling middleware
- Custom error classes
- Consistent error response format
- Error logging

**Implementation:**

```typescript
// src/middleware/error.middleware.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error', { error: err, path: req.path })

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message })
  }

  if (err instanceof AuthError) {
    return res.status(401).json({ error: err.message })
  }

  res.status(500).json({ error: 'Internal server error' })
}
```

#### Authentication Middleware

**Current State:** No JWT verification middleware

**Recommendations:**

- JWT verification middleware
- Extract user from token
- Attach user to request object
- Protect routes with middleware

**Implementation:**

```typescript
// src/middleware/auth.middleware.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = cookies.get(req, 'token')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwtToken.verify(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

#### API Documentation

**Current State:** No API documentation

**Recommendations:**

- OpenAPI/Swagger documentation
- Auto-generate from code
- Interactive API explorer
- Version API endpoints

**Implementation:**

```bash
bun add swagger-ui-express swagger-jsdoc
```

#### Environment Variable Validation

**Current State:** No validation of environment variables

**Recommendations:**

- Validate required env vars on startup
- Use Zod for env validation
- Fail fast if missing required vars
- Type-safe env access

**Implementation:**

```typescript
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  ARCJET_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
})

export const env = envSchema.parse(process.env)
```

### Code Quality Improvements

#### ESLint/Prettier Conflict

**Issue:** ESLint requires semicolons, Prettier removes them

**Fix:**

```json
// .prettierrc
{
  "semi": true,  // Change from false to true
  ...
}
```

Or disable ESLint semicolon rule if you prefer no semicolons.

#### Type Safety Improvements

**Recommendations:**

- Enable `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json`
- Add stricter type checks
- Use `satisfies` operator where appropriate
- Avoid `any` types

#### Error Messages

**Issue:** Some error messages have typos (e.g., "errror" instead of "error")

**Fix:** Review all error messages for typos and consistency

#### Password Validation

**Issue:** Password min length message says "8 characters" but validation requires 6

**Fix:** Align validation and error messages

### Security Enhancements

#### JWT Secret

**Issue:** Default JWT secret in code

**Fix:** Require `JWT_SECRET` environment variable, fail if not set

#### Password Strength

**Recommendations:**

- Enforce stronger passwords (min 8 chars, uppercase, lowercase, number)
- Use password strength library (e.g., `zxcvbn`)

#### Rate Limiting

**Recommendations:**

- Add per-endpoint rate limits
- Add IP-based rate limiting
- Add distributed rate limiting for production

#### CORS Configuration

**Issue:** CORS allows all origins

**Fix:**

```typescript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
)
```

#### Input Sanitization

**Recommendations:**

- Sanitize user inputs
- Prevent SQL injection (Drizzle helps, but be careful)
- Prevent XSS in responses

### Performance Optimizations

#### Database Connection Pooling

**Recommendations:**

- Configure connection pool size
- Monitor connection usage
- Use connection pooling for Neon Cloud

#### Caching

**Recommendations:**

- Add Redis for session caching
- Cache frequently accessed data
- Cache JWT verification results

#### Response Compression

**Recommendations:**

- Add compression middleware
- Compress JSON responses
- Enable gzip/brotli

**Implementation:**

```bash
bun add compression
```

```typescript
import compression from 'compression'
app.use(compression())
```

### Documentation Improvements

#### README Updates

**Recommendations:**

- Add more examples
- Add troubleshooting section
- Add architecture diagrams
- Add API endpoint documentation

#### Code Comments

**Recommendations:**

- Add JSDoc comments to functions
- Document complex logic
- Add examples in comments

#### Inline Documentation

**Recommendations:**

- Document environment variables
- Document API endpoints
- Document database schema

### DevOps Improvements

#### Health Check Endpoint

**Current:** Basic health check exists

**Enhancements:**

- Add database connectivity check
- Add external service checks
- Add readiness vs liveness probes

#### Logging Improvements

**Recommendations:**

- Add structured logging with correlation IDs
- Add request ID tracking
- Integrate with log aggregation (Datadog, CloudWatch)
- Add log rotation

#### Monitoring

**Recommendations:**

- Add application metrics (Prometheus)
- Add error tracking (Sentry)
- Add performance monitoring (APM)
- Add uptime monitoring

#### Docker Improvements

**Recommendations:**

- Multi-stage build optimization
- Smaller base image
- Health checks in Dockerfile
- Non-root user in container

**Example:**

```dockerfile
FROM oven/bun:latest-slim AS base
# ... rest of Dockerfile

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Agentic Coding Considerations

#### Stable Base Setup

**Current State:** Good foundation

**Enhancements:**

- Add `.cursorrules` file with project conventions
- Document common patterns for AI assistants
- Add example implementations for common tasks
- Create template files for new features

#### Code Generation Templates

**Recommendations:**

- Template for new controllers
- Template for new services
- Template for new routes
- Template for new models

#### Documentation for AI

**Recommendations:**

- Document architectural decisions
- Document why certain patterns are used
- Document common pitfalls
- Document extension points

---

## 14. Best Practices for Agentic Coding

### Project Structure Recommendations

**Maintain Consistent Structure:**

```
src/
├── config/        # Configuration (singletons)
├── controllers/  # HTTP handlers
├── middleware/   # Express middleware
├── models/       # Database schemas
├── routes/       # Route definitions
├── services/     # Business logic
├── types/        # TypeScript types
├── utils/        # Pure utilities
└── validations/  # Zod schemas
```

**Why This Structure:**

- Clear separation of concerns
- Easy to navigate
- Predictable for AI assistants
- Scales well

### Naming Conventions

**Files:**

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Routes: `*.routes.ts`
- Middleware: `*.middleware.ts`
- Validations: `*.validation.ts`
- Utils: `*.ts` (descriptive names)

**Functions:**

- Controllers: `verbNoun` (e.g., `signUp`, `getUser`)
- Services: `verbNoun` (e.g., `createUser`, `authenticateUser`)
- Utils: `verbNoun` or `nounVerb` (e.g., `hashPassword`, `formatDate`)

**Variables:**

- camelCase for variables
- PascalCase for types/classes
- UPPER_CASE for constants

### Code Organization

**Single Responsibility:**

- Each function does one thing
- Each file has one purpose
- Each module has one responsibility

**Example:**

```typescript
// Good: Single responsibility
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Bad: Multiple responsibilities
export const createUserAndSendEmail = async (userData: UserData) => {
  // Creates user AND sends email - too many responsibilities
}
```

### Error Handling

**Consistent Pattern:**

```typescript
try {
  // Operation
} catch (error) {
  // Log error
  logger.error('Context', error)

  // Throw or return appropriate error
  throw new Error('User-friendly message')
}
```

**Error Types:**

- Use specific error classes
- Include context in errors
- Don't expose internal details

### Type Safety

**Avoid `any`:**

```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: UserData) { ... }
```

**Use Type Inference:**

```typescript
// Good: Type inferred from schema
const result = schema.parse(data)
// result is typed!

// Bad: Manual typing
const result: UserData = schema.parse(data)
```

**Type Guards:**

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

### Documentation Standards

**Function Documentation:**

```typescript
/**
 * Creates a new user in the database.
 *
 * @param userData - User data including name, email, password, and role
 * @returns The created user object (without password)
 * @throws Error if user already exists or creation fails
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  // Implementation
}
```

**File Headers:**

```typescript
/**
 * Authentication service
 *
 * Handles user authentication, password hashing, and user creation.
 * All database operations related to authentication.
 */
```

### Extension Points

**Document How to Add:**

- New routes
- New controllers
- New services
- New models
- New middleware

**Example Template:**

```markdown
## Adding a New Feature

1. Create model in `src/models/feature.model.ts`
2. Create validation in `src/validations/feature.validation.ts`
3. Create service in `src/services/feature.service.ts`
4. Create controller in `src/controllers/feature.controller.ts`
5. Create routes in `src/routes/feature.routes.ts`
6. Register routes in `src/app.ts`
7. Generate and run migrations
```

---

## 15. Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**

1. **Development (Neon Local):**
   - Check Neon Local container is running: `docker ps`
   - Check `DATABASE_URL` uses `neon-local` hostname (not `localhost`)
   - Verify network: `docker network ls`
   - Check logs: `docker logs dev_ops_compare_neon_local`

2. **Production (Neon Cloud):**
   - Verify `DATABASE_URL` includes `?sslmode=require`
   - Check credentials are correct
   - Verify network connectivity
   - Check Neon Cloud dashboard for connection issues

3. **General:**
   - Verify `DATABASE_URL` is set in environment
   - Check connection string format
   - Test connection: `bun run db:studio`

#### Docker Issues

**Problem:** Container won't start

**Solutions:**

1. Check Docker is running: `docker info`
2. Check port availability: `netstat -an | grep 3000`
3. Check logs: `docker-compose logs app`
4. Rebuild: `docker-compose build --no-cache`
5. Remove old containers: `docker-compose down -v`

**Problem:** Hot reload not working

**Solutions:**

1. Verify volumes are mounted: `docker-compose config`
2. Check file permissions
3. Verify `bun --watch` command is running
4. Check container logs for errors

#### Environment Variable Issues

**Problem:** Environment variables not loading

**Solutions:**

1. Verify `.env.development` or `.env.production` exists
2. Check file is in project root
3. Verify variable names match code
4. Restart containers after changing env vars
5. Check `env_file` in docker-compose.yml

#### Migration Issues

**Problem:** Migrations fail

**Solutions:**

1. Check database connection
2. Verify migration files exist in `drizzle/`
3. Check migration SQL syntax
4. Review migration journal: `drizzle/meta/_journal.json`
5. Manually verify SQL in database

**Problem:** Schema out of sync

**Solutions:**

1. Generate new migration: `bun run db:generate`
2. Review generated SQL
3. Apply migration: `bun run db:migrate`
4. Verify with Drizzle Studio

#### TypeScript Errors

**Problem:** Type errors

**Solutions:**

1. Run type check: `bun run type-check`
2. Check `tsconfig.json` settings
3. Verify imports use correct path aliases
4. Clear TypeScript cache
5. Restart IDE/TypeScript server

#### ESLint/Prettier Conflicts

**Problem:** Formatting conflicts

**Solutions:**

1. Run `bun run lint:fix`
2. Run `bun run format`
3. Check `.prettierrc` and `eslint.config.js` alignment
4. Use `eslint-config-prettier` to disable conflicting rules

#### Port Already in Use

**Problem:** Port 3000 already in use

**Solutions:**

1. Change `PORT` in `.env` file
2. Update port mapping in `docker-compose.yml`
3. Kill process using port:

   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

#### Arcjet Errors

**Problem:** Arcjet blocking legitimate requests

**Solutions:**

1. Check `ARCJET_KEY` is set
2. Verify Arcjet dashboard for false positives
3. Adjust rate limits in `src/config/arcjet.ts`
4. Check bot detection settings
5. Review logs for blocked requests

#### JWT Token Issues

**Problem:** Token invalid or expired

**Solutions:**

1. Check `JWT_SECRET` is set
2. Verify token expiration time
3. Check cookie settings (httpOnly, secure, sameSite)
4. Verify token format
5. Check token in browser DevTools

---

## 16. Future Project Setup Checklist

### Initial Setup

- [ ] Clone or create new project
- [ ] Initialize Bun project: `bun init`
- [ ] Copy `package.json` structure
- [ ] Set up path aliases in `package.json`
- [ ] Copy `tsconfig.json`
- [ ] Copy `eslint.config.js`
- [ ] Copy `.prettierrc`
- [ ] Copy `.gitignore`
- [ ] Copy `.dockerignore`

### Docker Setup

- [ ] Copy `Dockerfile`
- [ ] Copy `docker-compose.dev.yml`
- [ ] Copy `docker-compose.prod.yml`
- [ ] Create `.env.development.example`
- [ ] Create `.env.production.example`
- [ ] Copy `scripts/dev.sh`
- [ ] Copy `scripts/prod.sh`
- [ ] Update container names in scripts

### Source Code Structure

- [ ] Create `src/` directory structure:
  - [ ] `src/config/`
  - [ ] `src/controllers/`
  - [ ] `src/middleware/`
  - [ ] `src/models/`
  - [ ] `src/routes/`
  - [ ] `src/services/`
  - [ ] `src/types/`
  - [ ] `src/utils/`
  - [ ] `src/validations/`
- [ ] Copy base files:
  - [ ] `src/app.ts`
  - [ ] `src/server.ts`
  - [ ] `src/index.ts`
  - [ ] `src/config/logger.ts`
  - [ ] `src/types/index.d.ts`

### Database Setup

- [ ] Install Drizzle: `bun add drizzle-orm`
- [ ] Install Neon driver: `bun add @neondatabase/serverless`
- [ ] Copy `drizzle.config.js`
- [ ] Create first model in `src/models/`
- [ ] Generate initial migration: `bun run db:generate`
- [ ] Set up database connection in `src/config/database.ts`

### Security Setup

- [ ] Install Arcjet: `bun add @arcjet/bun`
- [ ] Set up Arcjet config: `src/config/arcjet.ts`
- [ ] Create security middleware: `src/middleware/security.middleware.ts`
- [ ] Install JWT: `bun add jsonwebtoken @types/jsonwebtoken`
- [ ] Create JWT utils: `src/utils/jwt.ts`
- [ ] Install bcrypt: `bun add bcrypt @types/bcrypt`
- [ ] Set up password hashing in service

### Authentication Setup

- [ ] Create user model
- [ ] Create auth validation schemas
- [ ] Create auth service
- [ ] Create auth controller
- [ ] Create auth routes
- [ ] Register routes in `src/app.ts`
- [ ] Create cookie utils: `src/utils/cookies.ts`

### Logging Setup

- [ ] Install Winston: `bun add winston`
- [ ] Copy `src/config/logger.ts`
- [ ] Create `logs/` directory
- [ ] Add `logs/` to `.gitignore`
- [ ] Set up Morgan integration in `src/app.ts`

### Validation Setup

- [ ] Install Zod: `bun add zod`
- [ ] Create validation schemas
- [ ] Create format utils: `src/utils/format.ts`

### Testing Setup (Recommended)

- [ ] Install test framework: `bun add -d vitest`
- [ ] Create `vitest.config.ts`
- [ ] Set up test directory structure
- [ ] Create example tests

### CI/CD Setup (Recommended)

- [ ] Create `.github/workflows/ci.yml`
- [ ] Set up test workflow
- [ ] Set up lint/type-check workflow
- [ ] Set up Docker build workflow

### Documentation

- [ ] Copy `README.md` template
- [ ] Update project-specific information
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Create architecture diagrams

### Final Steps

- [ ] Install all dependencies: `bun install`
- [ ] Run linting: `bun run lint`
- [ ] Run type check: `bun run type-check`
- [ ] Test development setup: `bun run dev:docker`
- [ ] Test production build: `docker build -t test .`
- [ ] Verify all scripts work
- [ ] Commit initial setup

---

## 17. B2B Providers & Backend-as-a-Service Platforms

> **Overview**: This section covers modern B2B providers and Backend-as-a-Service (BaaS) platforms that can replace or complement traditional database and backend infrastructure. These services offer managed solutions that reduce operational overhead.

### Database & Backend Providers

#### Convex

**What is Convex?**
Convex is a backend-as-a-service platform that provides:

- Real-time database with automatic reactivity
- Serverless functions (no infrastructure management)
- Built-in authentication
- File storage
- TypeScript-first with automatic type generation
- Real-time subscriptions

**Key Features:**

- **Reactive Queries**: Queries automatically update when data changes
- **Type Safety**: TypeScript types generated from schema
- **Serverless Functions**: Write backend logic in TypeScript
- **Real-time**: Built-in WebSocket support for live updates
- **No ORM Needed**: Direct queries with type safety
- **Free Tier**: Generous free tier for development

**When to Use Convex:**

- ✅ Real-time applications (chat, dashboards, collaborative apps)
- ✅ Rapid prototyping
- ✅ Projects needing real-time sync
- ✅ TypeScript-first projects
- ✅ Serverless architecture preference
- ❌ Complex SQL queries
- ❌ Existing Postgres/MySQL infrastructure
- ❌ Need for direct database access

**Migration from Neon/Drizzle:**

```typescript
// Current: Neon + Drizzle
import { db } from '#config/database.ts'
const users = await db.select().from(users).where(eq(users.email, email))

// Convex
import { query } from './_generated/server'
import { v } from 'convex/values'

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('email', q => q.eq('email', args.email))
      .first()
  },
})
```

**Setup:**

```bash
npm install convex
npx convex dev
```

**Pros:**

- Zero infrastructure management
- Excellent developer experience
- Real-time out of the box
- Type-safe queries
- Generous free tier

**Cons:**

- Vendor lock-in
- Less control over database
- Learning curve for reactive patterns
- Limited SQL features

---

#### Supabase

**What is Supabase?**
Open-source Firebase alternative providing:

- PostgreSQL database (managed)
- Real-time subscriptions
- Authentication
- Storage
- Edge Functions
- Auto-generated REST API

**Key Features:**

- **PostgreSQL**: Full SQL database
- **Real-time**: Postgres changes via WebSockets
- **Auth**: Built-in authentication
- **Storage**: File storage with CDN
- **Edge Functions**: Serverless functions
- **Self-hostable**: Open-source option available

**When to Use Supabase:**

- ✅ Need PostgreSQL features
- ✅ Real-time requirements
- ✅ Open-source preference
- ✅ Self-hosting option needed
- ✅ Existing Postgres knowledge
- ❌ Need for complex migrations
- ❌ Vendor lock-in concerns

**Comparison with Neon:**

- Similar: Both are Postgres-based
- Difference: Supabase includes auth, storage, real-time
- Neon: More focused on database, better branching

**Migration Path:**

```typescript
// Current: Neon + Drizzle
import { db } from '#config/database.ts'

// Supabase
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const { data } = await supabase.from('users').select('*').eq('email', email)
```

---

#### PlanetScale

**What is PlanetScale?**
MySQL-compatible serverless database platform:

- Branching (like Git for databases)
- Serverless scaling
- No connection limits
- Vitess-based (scales horizontally)
- Free tier available

**Key Features:**

- **MySQL Compatible**: Standard MySQL protocol
- **Branching**: Create database branches for development
- **Serverless**: Auto-scaling
- **No Connection Limits**: Unlimited connections
- **Vitess**: Built on Vitess for scale

**When to Use PlanetScale:**

- ✅ MySQL preference
- ✅ Need for database branching
- ✅ High concurrency requirements
- ✅ Serverless architecture
- ❌ Need PostgreSQL features
- ❌ Complex migration requirements

**ORM Compatibility:**

- Works with Prisma, Drizzle, TypeORM
- Standard MySQL drivers

---

#### Turso

**What is Turso?**
SQLite-compatible edge database:

- SQLite compatibility
- Edge replication
- Low latency globally
- Serverless
- Free tier available

**Key Features:**

- **SQLite Compatible**: Familiar SQLite API
- **Edge Replication**: Low latency globally
- **Serverless**: No infrastructure management
- **Lightweight**: SQLite-based
- **Free Tier**: Generous free tier

**When to Use Turso:**

- ✅ Edge computing needs
- ✅ Low latency requirements globally
- ✅ SQLite familiarity
- ✅ Simple data models
- ❌ Complex relational queries
- ❌ Need for advanced Postgres features

---

#### Upstash

**What is Upstash?**
Serverless Redis and Kafka:

- Serverless Redis
- Serverless Kafka
- Pay-per-request pricing
- Global edge network
- Free tier available

**Key Features:**

- **Redis**: Serverless Redis with REST API
- **Kafka**: Serverless Kafka
- **Edge**: Low latency globally
- **Pay-per-use**: Cost-effective for low traffic

**When to Use Upstash:**

- ✅ Caching needs
- ✅ Rate limiting
- ✅ Session storage
- ✅ Message queues
- ✅ Low traffic applications
- ❌ Primary database (use with another DB)

**Use Cases:**

- Rate limiting (replace Arcjet Redis backend)
- Caching
- Session storage
- Real-time features

---

### Authentication Providers

#### Clerk

**What is Clerk?**
Complete authentication solution:

- Pre-built UI components
- Social logins (Google, GitHub, etc.)
- User management dashboard
- Session management
- Multi-factor authentication
- Webhooks

**Key Features:**

- **Pre-built UI**: Drop-in components
- **Social Logins**: 20+ providers
- **User Management**: Admin dashboard
- **Sessions**: Secure session handling
- **MFA**: Built-in 2FA support

**When to Use Clerk:**

- ✅ Need quick auth setup
- ✅ Multiple auth providers
- ✅ Pre-built UI needed
- ✅ User management dashboard
- ❌ Custom auth requirements
- ❌ Cost concerns (paid service)

**Replacement for JWT:**

- Handles all auth logic
- No need for JWT management
- Built-in session handling

---

#### Auth0

**What is Auth0?**
Enterprise authentication platform:

- Enterprise features
- SSO support
- Compliance (SOC2, HIPAA)
- Extensive customization
- Enterprise support

**Key Features:**

- **Enterprise**: Advanced enterprise features
- **SSO**: Single Sign-On
- **Compliance**: SOC2, HIPAA ready
- **Customization**: Highly customizable
- **Support**: Enterprise support

**When to Use Auth0:**

- ✅ Enterprise requirements
- ✅ Compliance needs
- ✅ SSO requirements
- ✅ Advanced customization
- ❌ Simple projects (overkill)
- ❌ Cost concerns

---

### Payment Providers

#### Stripe

**What is Stripe?**
Payment processing platform:

- Payment processing
- Subscription management
- Invoicing
- Tax calculation
- Fraud prevention

**Integration:**

```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
})
```

---

### Email Providers

#### Resend

**What is Resend?**
Modern email API for developers:

- Simple API
- React Email support
- Great deliverability
- Developer-friendly
- Free tier available

**Key Features:**

- **React Email**: Use React components for emails
- **API**: Simple REST API
- **Deliverability**: High inbox rates
- **Free Tier**: 3,000 emails/month

**When to Use Resend:**

- ✅ Transactional emails
- ✅ React-based email templates
- ✅ Developer experience priority
- ✅ Modern API preference

---

#### SendGrid

**What is SendGrid?**
Email delivery service:

- Email API
- Marketing emails
- Analytics
- Templates
- Free tier available

**Key Features:**

- **Marketing**: Marketing email features
- **Analytics**: Email analytics
- **Templates**: Email templates
- **API**: REST API

**When to Use SendGrid:**

- ✅ Marketing emails
- ✅ Need for analytics
- ✅ Template management

---

### Storage Providers

#### Cloudflare R2

**What is Cloudflare R2?**
S3-compatible object storage:

- S3-compatible API
- No egress fees
- CDN integration
- Global distribution

**When to Use R2:**

- ✅ S3 compatibility needed
- ✅ High egress traffic
- ✅ CDN integration
- ✅ Cost optimization

---

#### AWS S3

**What is AWS S3?**
Object storage service:

- Industry standard
- Extensive integrations
- Mature ecosystem
- Pay for what you use

**When to Use S3:**

- ✅ AWS ecosystem
- ✅ Enterprise requirements
- ✅ Complex storage needs

---

### Monitoring & Analytics

#### Sentry

**What is Sentry?**
Error tracking and monitoring:

- Error tracking
- Performance monitoring
- Release tracking
- User feedback

**Integration:**

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

---

#### Datadog

**What is Datadog?**
Observability platform:

- APM (Application Performance Monitoring)
- Logs
- Metrics
- Traces
- Infrastructure monitoring

**When to Use Datadog:**

- ✅ Enterprise monitoring
- ✅ Full observability stack
- ✅ Infrastructure monitoring
- ❌ Cost concerns (expensive)

---

### Provider Comparison Matrix

| Provider        | Type        | Free Tier   | Best For             | Cost             |
| --------------- | ----------- | ----------- | -------------------- | ---------------- |
| **Convex**      | BaaS        | ✅ Generous | Real-time apps       | Pay-as-you-go    |
| **Supabase**    | BaaS        | ✅ Generous | Postgres + Auth      | Pay-as-you-go    |
| **Neon**        | Database    | ✅ Generous | Postgres only        | Pay-as-you-go    |
| **PlanetScale** | Database    | ✅ Limited  | MySQL branching      | Pay-as-you-go    |
| **Turso**       | Database    | ✅ Generous | Edge SQLite          | Pay-as-you-go    |
| **Upstash**     | Cache/Queue | ✅ Generous | Redis/Kafka          | Pay-per-request  |
| **Clerk**       | Auth        | ✅ Limited  | Quick auth setup     | Per-user pricing |
| **Auth0**       | Auth        | ✅ Limited  | Enterprise auth      | Per-user pricing |
| **Stripe**      | Payments    | ❌          | Payment processing   | Transaction fees |
| **Resend**      | Email       | ✅ 3K/month | Transactional emails | Pay-per-email    |
| **SendGrid**    | Email       | ✅ 100/day  | Marketing emails     | Pay-per-email    |

### Choosing the Right Provider

**Decision Framework:**

1. **Database Needs:**
   - Real-time → Convex or Supabase
   - Postgres → Neon or Supabase
   - MySQL → PlanetScale
   - SQLite → Turso
   - Caching → Upstash Redis

2. **Authentication:**
   - Quick setup → Clerk
   - Enterprise → Auth0
   - Custom → Build with JWT

3. **Email:**
   - Modern API → Resend
   - Marketing → SendGrid
   - Enterprise → AWS SES

4. **Storage:**
   - S3-compatible → Cloudflare R2
   - AWS ecosystem → S3
   - Simple → Supabase Storage

### Migration Strategies

#### From Neon to Convex

**Step 1: Set up Convex**

```bash
npm install convex
npx convex dev
```

**Step 2: Define Schema**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('email', ['email']),
})
```

**Step 3: Migrate Data**

- Export from Neon
- Transform to Convex format
- Import to Convex

**Step 4: Update Code**

- Replace Drizzle queries with Convex queries
- Use Convex mutations for writes
- Set up real-time subscriptions if needed

#### From Neon to Supabase

**Step 1: Set up Supabase**

```bash
npm install @supabase/supabase-js
```

**Step 2: Migrate Schema**

- Supabase uses Postgres (same as Neon)
- Can use same Drizzle schemas
- Or use Supabase migrations

**Step 3: Update Connection**

```typescript
// Replace Neon connection
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

**Step 4: Update Queries**

- Use Supabase client instead of Drizzle
- Or keep Drizzle with Supabase Postgres connection

### Cost Considerations

**Free Tier Limits:**

- **Convex**: 1M function calls/month, 1GB storage
- **Supabase**: 500MB database, 1GB bandwidth
- **Neon**: 0.5GB storage, 1 compute unit
- **PlanetScale**: 1 database, 1GB storage
- **Turso**: 500 databases, 500MB storage
- **Upstash**: 10K commands/day (Redis)
- **Clerk**: 10K MAU
- **Resend**: 3K emails/month

**Scaling Costs:**

- Most providers charge based on usage
- Consider data transfer costs
- Monitor usage to avoid surprises
- Set up billing alerts

### Best Practices

1. **Vendor Lock-in:**
   - Use abstraction layers where possible
   - Keep business logic separate from provider APIs
   - Have migration plans ready

2. **Multi-provider Strategy:**
   - Use best provider for each service
   - Don't put all eggs in one basket
   - Consider redundancy

3. **Cost Management:**
   - Monitor usage regularly
   - Set up billing alerts
   - Use free tiers for development
   - Optimize queries and usage

4. **Security:**
   - Never commit API keys
   - Use environment variables
   - Rotate keys regularly
   - Use least privilege access

5. **Testing:**
   - Test with provider SDKs
   - Mock providers in unit tests
   - Use provider test environments
   - Test error scenarios

### Integration Examples

#### Convex Integration

```typescript
// convex/users.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getUser = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      password: args.password,
      role: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})
```

#### Supabase Integration

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

// Usage
const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
```

#### Clerk Integration

```typescript
// src/middleware/auth.middleware.ts
import { clerkMiddleware } from '@clerk/express'

export const authMiddleware = clerkMiddleware()

// Usage in routes
app.use('/api/protected', authMiddleware, protectedRoutes)
```

---

## 18. Adapting to Other Technology Stacks

> **Note**: While this project uses Bun + Express + Neon, the architectural patterns, project structure, and best practices can be adapted to any technology stack. This section provides guidance on applying these patterns to different runtimes, frameworks, and databases.

### Core Principles (Technology-Agnostic)

Regardless of your technology stack, these principles apply:

1. **Separation of Concerns**: Controllers → Services → Models
2. **Type Safety**: Use your language's type system (TypeScript, Go types, Python type hints, etc.)
3. **Validation**: Validate inputs at the boundary (API layer)
4. **Error Handling**: Centralized, consistent error handling
5. **Security**: Rate limiting, input sanitization, authentication
6. **Logging**: Structured logging with context
7. **Configuration**: Environment-based configuration
8. **Testing**: Unit, integration, and E2E tests
9. **Documentation**: Keep it updated and comprehensive

### Adapting to Different Runtimes

#### Node.js

- **Package Manager**: Use `npm`, `yarn`, or `pnpm` instead of `bun`
- **Scripts**: Update `package.json` scripts to use `node` instead of `bun`
- **TypeScript**: Requires compilation step (`tsc` or `tsx`)
- **Hot Reload**: Use `nodemon` or `tsx --watch`
- **Docker**: Use `node:20-alpine` base image

#### Deno

- **Package Manager**: Built-in, uses URLs for imports
- **TypeScript**: Native support (no compilation needed)
- **Hot Reload**: Built-in `--watch` flag
- **Docker**: Use `denoland/deno:alpine` base image
- **Path Aliases**: Use `import_map.json` instead of `package.json` imports

#### Python (FastAPI/Flask)

- **Structure**: Similar separation (routes → services → models)
- **Type Safety**: Use `typing` module and Pydantic for validation
- **ORM**: SQLAlchemy, Tortoise ORM, or Prisma Python
- **Docker**: Use `python:3.11-slim` base image
- **Hot Reload**: Built-in with FastAPI (`uvicorn --reload`)

#### Go

- **Structure**: `handlers/`, `services/`, `models/`, `middleware/`
- **Type Safety**: Built-in strong typing
- **Validation**: Use `validator` or `go-playground/validator`
- **ORM**: GORM, Ent, or SQLBoiler
- **Docker**: Use `golang:1.21-alpine` base image

### Adapting to Different Frameworks

#### Fastify (Node.js)

- **Similarities**: Middleware pattern, route handlers
- **Differences**: Faster, schema validation built-in
- **Migration**: Replace Express middleware with Fastify plugins
- **Example**: `fastify.register(securityPlugin)` instead of `app.use(securityMiddleware)`

#### Hono (Bun/Deno/Node)

- **Similarities**: Express-like API
- **Differences**: Edge-first, framework-agnostic
- **Migration**: Very similar to Express, minimal changes needed

#### NestJS (Node.js)

- **Structure**: Built-in separation (controllers, services, modules)
- **Differences**: Decorator-based, dependency injection
- **Migration**: Use NestJS decorators (`@Controller`, `@Service`, `@Module`)

#### Next.js API Routes

- **Structure**: `app/api/` or `pages/api/` directories
- **Differences**: File-based routing, serverless functions
- **Migration**: Extract route handlers to API route files

#### FastAPI (Python)

- **Structure**: Similar (routers → services → models)
- **Differences**: Decorator-based, automatic OpenAPI docs
- **Migration**: Use FastAPI decorators (`@app.post`, `@router.get`)

### Adapting to Different Databases

#### MongoDB (NoSQL)

- **ORM/ODM**: Mongoose (Node.js), Motor (Python), MongoEngine (Python)
- **Migrations**: Use migration tools or manual scripts
- **Connection**: Connection pooling similar concepts
- **Queries**: Document-based queries instead of SQL

#### MySQL/PostgreSQL (Traditional)

- **ORM**: Prisma, TypeORM, Sequelize (Node.js), SQLAlchemy (Python)
- **Migrations**: Most ORMs have migration systems
- **Connection**: Connection pooling essential
- **Queries**: SQL-based, similar to current setup

#### SQLite (Embedded)

- **ORM**: Drizzle (works with SQLite), Prisma, better-sqlite3
- **Migrations**: Same migration concepts apply
- **Connection**: File-based, no connection pooling needed
- **Use Case**: Development, small projects, embedded systems

#### Prisma (Multi-database ORM)

- **Works With**: PostgreSQL, MySQL, SQLite, MongoDB, SQL Server
- **Migration**: Built-in migration system (`prisma migrate`)
- **Type Safety**: Excellent TypeScript support
- **Migration Path**: Can replace Drizzle with minimal changes

### Adapting Project Structure

The core structure remains the same across stacks:

```
project/
├── src/
│   ├── config/          # Configuration (language-specific)
│   ├── controllers/     # Request handlers (framework-specific)
│   ├── middleware/     # Middleware/interceptors (framework-specific)
│   ├── models/          # Data models (ORM/ODM-specific)
│   ├── routes/          # Route definitions (framework-specific)
│   ├── services/        # Business logic (language-agnostic)
│   ├── types/           # Type definitions (language-specific)
│   ├── utils/           # Utilities (language-agnostic)
│   └── validations/     # Validation schemas (library-specific)
├── tests/               # Tests (framework-specific)
├── docker/              # Docker files (same)
└── docs/                # Documentation (same)
```

### Adapting Configuration Patterns

#### Environment Variables

- **All Stacks**: Use `.env` files, validate on startup
- **Node.js**: `dotenv` package
- **Python**: `python-dotenv` package
- **Go**: `godotenv` package
- **Deno**: Built-in `Deno.env`

#### Path Aliases

- **Node.js/Bun**: `package.json` imports or `tsconfig.json` paths
- **Deno**: `import_map.json`
- **Python**: `pyproject.toml` or `setup.py`
- **Go**: Module paths

### Adapting Security Patterns

#### Rate Limiting

- **Node.js**: `express-rate-limit`, `@upstash/ratelimit`
- **Python**: `slowapi`, `fastapi-limiter`
- **Go**: `golang.org/x/time/rate`
- **All**: Arcjet supports multiple runtimes

#### Authentication

- **JWT**: Available in all languages (`jsonwebtoken`, `PyJWT`, `jwt-go`)
- **Cookies**: Framework-specific but same principles
- **OAuth**: Libraries available for all stacks

### Adapting Docker Patterns

The Docker multi-stage build pattern applies to all stacks:

```dockerfile
# Example: Python FastAPI
FROM python:3.11-slim AS base
WORKDIR /app

FROM base AS install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS release
COPY --from=install /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Migration Checklist for New Stack

When adapting to a new technology stack:

- [ ] Identify equivalent packages/libraries
- [ ] Map current patterns to new framework patterns
- [ ] Update project structure (if needed)
- [ ] Adapt configuration files
- [ ] Update Docker setup
- [ ] Migrate tests to new testing framework
- [ ] Update CI/CD pipelines
- [ ] Document stack-specific differences
- [ ] Create migration guide for team

### Example: Express → FastAPI Migration

**Before (Express):**

```typescript
app.post('/api/auth/sign-up', async (req, res) => {
  const validation = signUpSchema.safeParse(req.body)
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed' })
  }
  const user = await createUser(validation.data)
  res.status(201).json({ user })
})
```

**After (FastAPI):**

```python
@app.post('/api/auth/sign-up', response_model=UserResponse)
async def sign_up(user_data: SignUpSchema):
    user = await create_user(user_data)
    return user
```

**Key Differences:**

- FastAPI handles validation automatically via Pydantic
- Type hints provide type safety
- Automatic OpenAPI documentation
- Async/await is first-class

### Technology Stack Decision Matrix

| Factor         | Bun + Express | Node.js + Fastify | Python + FastAPI | Go + Gin   |
| -------------- | ------------- | ----------------- | ---------------- | ---------- |
| Performance    | ⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐        | ⭐⭐⭐           | ⭐⭐⭐⭐⭐ |
| Type Safety    | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐          | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐ |
| Ecosystem      | ⭐⭐⭐        | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐         | ⭐⭐⭐     |
| Learning Curve | ⭐⭐⭐⭐      | ⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐       | ⭐⭐       |
| Hot Reload     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐       | ⭐⭐⭐     |

### Recommendations

1. **Start with Patterns, Not Implementation**: Understand the architectural patterns first
2. **Language-Agnostic Principles**: Focus on separation of concerns, type safety, validation
3. **Framework-Specific Optimizations**: Adapt to framework strengths (e.g., FastAPI's automatic docs)
4. **Keep Structure Consistent**: Maintain similar folder structure across projects
5. **Document Stack-Specific Decisions**: Note why you chose specific libraries/patterns

---

## Conclusion

This documentation provides a comprehensive reference for the `dev_ops_compare` project setup. Use it as a template and guide for future projects, especially when working with agentic coding assistants.

**Key Takeaways:**

- Clean architecture with separation of concerns
- Type-safe development with TypeScript and Zod
- Security-first approach with Arcjet and best practices
- Docker-based development and production workflows
- Comprehensive logging and error handling
- Scalable project structure

**Remember:**

- Keep this documentation updated as the project evolves
- Add project-specific patterns and conventions
- Document architectural decisions
- Maintain consistency across projects

---

**Last Updated:** 2024-01-15  
**Project Version:** 1.0.0  
**Documentation Version:** 1.0.0
