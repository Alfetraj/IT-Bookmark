# IT Bookmark — Architecture

> **Version**: 1.0.0-alpha  
> **Pattern**: Clean Architecture (Uncle Bob / Hexagonal)  
> **Last Updated**: 2026-07-14

---

## 1. Overview

IT Bookmark follows **Clean Architecture** principles, ensuring:

- Business logic is completely independent of frameworks, databases, and UI
- All external dependencies (Express, Supabase, BullMQ) are isolated behind interfaces
- Every layer is independently testable with mocks

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Vite)           │
│   Pages  →  Components  →  Hooks  →  API Client (Axios)     │
└───────────────────────────────┬─────────────────────────────┘
                                │  HTTPS / REST API
┌───────────────────────────────▼─────────────────────────────┐
│                        Backend (Express + TypeScript)        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Presentation│  │  Application │  │     Domain        │  │
│  │   (Routes,   │→ │   (Use Cases │→ │  (Entities,       │  │
│  │  Middleware) │  │   Services)  │  │   Value Objects,  │  │
│  └──────────────┘  └──────────────┘  │   Domain Events)  │  │
│                                      └───────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                Infrastructure Layer                   │    │
│  │   Supabase Repos │ BullMQ Jobs │ Playwright Archive   │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Layout

```
it-bookmark/                        (pnpm workspace root)
├── apps/
│   ├── web/                        React 19 + Vite SPA
│   │   ├── src/
│   │   │   ├── pages/              Route-level components
│   │   │   ├── components/         Shared UI components
│   │   │   │   ├── bookmarks/
│   │   │   │   ├── collections/
│   │   │   │   ├── tags/
│   │   │   │   └── layout/
│   │   │   ├── hooks/              Custom React hooks
│   │   │   ├── api/                Axios API client (typed)
│   │   │   ├── stores/             Zustand global state
│   │   │   ├── utils/              Pure utility functions
│   │   │   └── types/              Re-exports from shared
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── server/                     Node.js + Express API
│       ├── src/
│       │   ├── presentation/       HTTP boundary
│       │   │   ├── routes/         Express routers
│       │   │   ├── middleware/     Auth, validation, error handler
│       │   │   └── dto/            Request / Response DTOs
│       │   ├── application/        Use-case orchestration
│       │   │   ├── use-cases/      One class per action
│       │   │   └── services/       Cross-cutting app services
│       │   ├── domain/             Pure business logic
│       │   │   ├── entities/       Bookmark, Collection, User, Tag
│       │   │   ├── value-objects/  URL, Permission, ArchiveStatus
│       │   │   ├── repositories/   Interfaces (ports)
│       │   │   └── events/         Domain events
│       │   └── infrastructure/    Adapters (driven)
│       │       ├── database/       Supabase repository impls
│       │       ├── storage/        Supabase Storage adapter
│       │       ├── queue/          BullMQ job definitions
│       │       ├── archive/        Playwright headless browser
│       │       ├── ai/             AI tagging adapters
│       │       └── cache/          Redis cache adapter
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                     Shared TypeScript types
│   │   ├── src/
│   │   │   ├── types/              Bookmark, Collection, User, Tag types
│   │   │   ├── schemas/            Zod validation schemas
│   │   │   └── constants/          Status codes, permission levels
│   │   └── package.json
│   │
│   └── ui/                         Shared component library
│       ├── src/
│       │   ├── components/         Button, Input, Modal, Card, etc.
│       │   └── tokens/             Design tokens (CSS vars)
│       └── package.json
│
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Layer Descriptions

### 3.1 Presentation Layer (`apps/server/src/presentation/`)

**Responsibility**: Accept HTTP requests, validate inputs, delegate to Application layer, return formatted responses.

```
Routes → Middleware → Controller (thin) → Use Case
```

- Express routers grouped by domain (bookmarks, collections, tags, users, auth)
- Request validation via **Zod** schemas (imported from `packages/shared`)
- Auth middleware extracts user from **Supabase JWT** and attaches to `req.user`
- Error handling middleware translates domain exceptions to HTTP status codes
- **No business logic here** — controllers are purely orchestrators

### 3.2 Application Layer (`apps/server/src/application/`)

**Responsibility**: Orchestrate domain objects to fulfil use cases. Coordinates repositories, domain services, and infrastructure adapters.

Use cases are single-purpose command/query handlers:

```
CreateBookmarkUseCase
UpdateBookmarkUseCase
DeleteBookmarkUseCase
GetBookmarksByCollectionUseCase
SearchBookmarksUseCase
CreateCollectionUseCase
InviteCollaboratorUseCase
ShareCollectionUseCase
TriggerArchiveJobUseCase
GetArchiveStatusUseCase
AddTagUseCase
AutoTagWithAIUseCase
ExportBookmarksUseCase
ImportBookmarksUseCase
```

### 3.3 Domain Layer (`apps/server/src/domain/`)

**Responsibility**: Core business rules — entities, value objects, domain events. Completely framework-free and infrastructure-free.

**Entities**:
- `Bookmark` — primary aggregate root
- `Collection` — container for bookmarks, owns membership
- `User` — represents a registered user
- `Tag` — labelling entity

**Value Objects** (immutable):
- `URL` — validated, normalized URL string
- `PermissionLevel` — enum (OWNER, EDITOR, VIEWER)
- `ArchiveStatus` — enum (PENDING, PROCESSING, DONE, FAILED)
- `CollectionVisibility` — enum (PRIVATE, SHARED, PUBLIC)

**Repository Interfaces (Ports)**:
- `IBookmarkRepository`
- `ICollectionRepository`
- `IUserRepository`
- `ITagRepository`
- `IArchiveRepository`

### 3.4 Infrastructure Layer (`apps/server/src/infrastructure/`)

**Responsibility**: Concrete implementations of repository interfaces and external service adapters.

| Component | Technology |
|---|---|
| Database repositories | Supabase JS client / `@supabase/supabase-js` |
| File storage | Supabase Storage buckets |
| Job queue | BullMQ + Redis |
| Archive generation | Playwright (headless Chromium) |
| AI tagging | Pluggable: Ollama (local) / OpenAI API / Gemini API |
| Cache | Redis (ioredis) |
| Email | Nodemailer / Resend API |

---

## 4. Frontend Architecture

### 4.1 Routing

React Router v7 with nested route structure:

```
/                         → Dashboard (all bookmarks, recent)
/login                    → Auth page
/register                 → Registration page
/collections              → Collections list
/collections/:id          → Single collection view
/collections/:id/settings → Collection settings & members
/bookmarks/:id            → Single bookmark detail / reader view
/tags                     → Tags overview
/tags/:slug               → Bookmarks filtered by tag
/search                   → Full-text search results
/settings                 → User profile & preferences
/settings/api             → API token management
/public/:username/:slug   → Public shared collection (unauthenticated)
```

### 4.2 State Management

| Layer | Tool | Purpose |
|---|---|---|
| Server State | TanStack Query v5 | API data fetching, caching, optimistic updates |
| Global UI State | Zustand | Modals, sidebar collapse, theme, preferences |
| Form State | React Hook Form + Zod | Typed form validation |
| URL State | React Router `useSearchParams` | Filters, sort, pagination |

### 4.3 API Client

Typed Axios instance with:
- Auto-attach Supabase JWT `Authorization` header
- Response interceptor for 401 → redirect to `/login`
- Request cancellation via `AbortController`
- Endpoint methods match `packages/shared` types exactly

---

## 5. Data Flow — Saving a Bookmark

```
User submits URL
      │
      ▼
Frontend (React form)
  → validate URL via Zod
  → POST /api/v1/bookmarks (with JWT)
      │
      ▼
Presentation Layer (Express Route)
  → extract user from JWT middleware
  → validate request body
  → call CreateBookmarkUseCase(dto)
      │
      ▼
Application Layer (CreateBookmarkUseCase)
  → create Bookmark domain entity
  → call bookmarkRepository.save(bookmark)
  → dispatch ArchiveBookmarkJob to BullMQ queue
  → return saved bookmark DTO
      │
      ▼
Infrastructure (Supabase repository)
  → INSERT into bookmarks table
  → return persisted entity
      │
      ▼
BullMQ Worker (background)
  → fetch URL metadata (title, description, favicon)
  → launch Playwright headless browser
  → capture screenshot (PNG)
  → generate PDF
  → extract readable text (Readability.js)
  → upload all to Supabase Storage
  → UPDATE bookmark.archive_status = 'DONE'
  → emit Supabase Realtime event → frontend updates
      │
      ▼
Frontend (TanStack Query invalidation via Realtime)
  → bookmark card updates with archive badge
```

---

## 6. Authentication Flow

```
User → Login page
         │
         ▼
Supabase Auth (email/password or OAuth)
  → Issues JWT (access_token + refresh_token)
  → Stored in memory + httpOnly cookie (refresh only)
         │
         ▼
Frontend API client
  → Attaches JWT Bearer token to every request
         │
         ▼
Express middleware (verifySupabaseJWT)
  → Validates JWT against Supabase public key
  → Extracts user_id, email, role claims
  → Attaches to req.user
         │
         ▼
Use Case checks ownership / permissions
  → CollectionRepository checks membership table
  → THROW ForbiddenError if unauthorized
```

---

## 7. Job Queue Architecture

```
Express API → BullMQ Producer → Redis Queue
                                    │
                                    ▼
                            BullMQ Worker Process
                            ┌──────────────────────┐
                            │ archive:capture       │ → Playwright
                            │ archive:wayback       │ → Wayback API
                            │ ai:auto-tag           │ → AI Adapter
                            │ export:generate       │ → HTML/JSON gen
                            │ notification:send     │ → Email/Push
                            └──────────────────────┘
                                    │
                                    ▼
                            Supabase DB UPDATE + Realtime event
```

---

## 8. Security Architecture

| Concern | Implementation |
|---|---|
| Authentication | Supabase JWTs (RS256), short-lived access tokens |
| Authorization | Row-Level Security (RLS) in PostgreSQL + app-level checks |
| Input Validation | Zod schemas on every request body and query param |
| SQL Injection | Parameterized queries via Supabase client |
| XSS | React's built-in escaping + Content-Security-Policy headers |
| CSRF | SameSite=Strict cookies + CSRF token for state-mutating forms |
| Rate Limiting | `express-rate-limit` on auth and write endpoints |
| File Upload Safety | Type checking + size limits + virus scan (ClamAV optional) |
| Secrets | Environment variables only — no secrets in code |

---

## 9. Deployment Architecture

```
Internet
    │
    ▼
[Cloudflare / Nginx Reverse Proxy]
    │
    ├──▶ /                     → React SPA (static files)
    └──▶ /api/v1/              → Express API Server
              │
              ├──▶ Supabase (PostgreSQL + Auth + Storage)
              ├──▶ Redis (BullMQ queue + cache)
              └──▶ BullMQ Worker container
```

### Docker Services (docker-compose.yml)

| Service | Image | Purpose |
|---|---|---|
| `web` | nginx:alpine | Serve Vite build output |
| `api` | node:20-alpine | Express API server |
| `worker` | node:20-alpine | BullMQ job processor |
| `redis` | redis:7-alpine | Queue + cache backend |

> Supabase runs externally (managed cloud or self-hosted Supabase stack)
