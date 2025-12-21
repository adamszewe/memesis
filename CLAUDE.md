# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memesis is a meme-sharing web application with a Go backend API and React frontend. It features infinite scroll, tag-based browsing, and individual post views.

## Architecture

### Backend (Go)
- **Framework**: Gin web framework (Go 1.25)
- **Database**: PostgreSQL with pgx/v5 connection pooling
- **Architecture Pattern**: Repository pattern with dependency injection

**Key Components**:
- `main.go`: Application entry point, sets up database pool, repository, handler, and routes
- `internal/entity/`: Domain models (Post, Tag)
- `internal/repo/`: Repository interfaces (`PostRepository`)
- `internal/infrastructure/database/`: PostgreSQL implementation of repositories and connection pool setup
- `internal/handler/`: HTTP handlers (Gin controllers)

**Database Connection**:
- Uses `pgxpool.Pool` for connection pooling (5-25 connections)
- Configuration loaded from defaults in `database.LoadConfigFromEnv()` (localhost:5432)
- Note: Environment variable loading is stubbed out - currently returns hardcoded defaults

**API Endpoints**:
- `GET /ping`: Health check
- `GET /posts?page=1`: Paginated posts (25 per page)
- `GET /posts/:id`: Single post by ID

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Key Features**: Infinite scroll (react-infinite-scroll-component), island theme UI

**Frontend Structure**:
- `web/src/App.tsx`: Router setup with Sidebar + main content area
- `web/src/components/`: PostCard, PostsList, Sidebar
- `web/src/pages/`: PostPage (individual post view)
- `web/src/services/api.ts`: API client (calls `/api/posts`)
- `web/src/types/post.ts`: TypeScript types

Frontend rules:
* Use TypeScript
* Use Vite for local development 
* Use re and rem unit sizes, avoid px
* Use island theme UI

## Development Commands

### Backend (Go)
```bash
# Run the server (starts on :8080)
go run main.go

# Run migrations (automatically applied on docker-compose up)
docker-compose up  # migrations in ./migrations/ auto-run

# Seed database with sample data
go run seeds/seed.go

# Build
go build -o memesis
```

### Frontend
```bash
cd web

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

### Database
```bash
# Start PostgreSQL via Docker
docker-compose up

# Database credentials (defaults):
# - Host: localhost
# - Port: 5432
# - User: memesis_user
# - Password: memesis_password
# - Database: memesis
```

## Database Schema

**Posts Table** (`migrations/001_create_posts_table.sql`):
- `id` (VARCHAR): Primary key
- `title` (TEXT): Post title
- `image_url` (TEXT): URL to image
- `description` (TEXT): Post description
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `tags` (TEXT[]): Array of tag names

**Indexes**:
- `idx_posts_created_at`: For chronological sorting
- `idx_posts_tags`: GIN index for tag queries
- `idx_posts_search`: Full-text search on title/description

## Key Patterns

### Repository Pattern
The codebase uses repository interfaces to decouple business logic from persistence:
1. Define interface in `internal/repo/` (e.g., `PostRepository`)
2. Implement in `internal/infrastructure/database/` (e.g., `PostgresPostRepository`)
3. Inject into handlers via constructor

### Pagination
API returns paginated responses with metadata:
```go
type PostsResponse struct {
    Posts      interface{} `json:"posts"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalShown int         `json:"total_shown"`
}
```

### Tag Storage
Tags are stored as PostgreSQL TEXT[] arrays in the posts table. The Tag entity has fields for `Id`, `Name`, and `IconUrl`, but currently only `Name` is populated from the database.

## Important Notes

- The frontend expects API at `/api` path (configured in `web/src/services/api.ts`)
- Environment variable loading is not implemented - `database.LoadConfigFromEnv()` returns hardcoded defaults
- No tests currently exist in the codebase
- Server runs on port 8080 by default
