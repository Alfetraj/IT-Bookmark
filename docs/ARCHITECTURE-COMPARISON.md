# Architecture Comparison & Target Design

## Side-by-Side Comparison

| Component | Linkwarden 2.16.1 | IT-Bookmark (Current) | Target Architecture |
|-----------|--------------------|-----------------------|---------------------|
| **Frontend Framework** | Next.js (App Router), Server Components | React 19 (Vite), SPA | React 19 (Vite), SPA |
| **Styling** | Tailwind CSS | SCSS Modules + CSS Variables | SCSS Modules + CSS Variables |
| **State Management** | React Query / tRPC | Zustand + TanStack Query | Zustand + TanStack Query |
| **Routing** | Next.js App Router | React Router v7 | React Router v7 |
| **Backend Framework** | Next.js API Routes + Background Worker (Node) | Express (Node.js) REST API | Express (Node.js) REST API |
| **API Layer** | tRPC (Type-safe RPC) | REST with Zod validation | REST with Zod validation (Shared Types) |
| **Database** | PostgreSQL | Supabase (PostgreSQL) | Supabase (PostgreSQL) |
| **ORM / Data Access** | Prisma | Supabase JS Client | Supabase JS Client / raw SQL where needed |
| **Authentication** | NextAuth (Sessions) | Express Custom JWT | Express Custom JWT + API Keys |
| **Archiving Worker** | BullMQ + Redis + Playwright | In-memory `setInterval` + Playwright | PostgreSQL-backed Job Queue + Playwright |
| **Storage** | Pluggable (Local, S3) | Supabase Storage | `StorageProvider` Abstraction (Supabase backend) |
| **Search Indexing** | Meilisearch | Basic SQL `ILIKE` | PostgreSQL Full-Text Search (`tsvector`) |
| **AI Tagging** | Vercel AI SDK | None | Custom AI Adapter (Express) |

---

## Target Architecture Design

IT-Bookmark will retain its **Clean Architecture** (Express + React SPA) while achieving functional parity with Linkwarden.

### 1. The Job Queue (Worker Architecture)
Linkwarden heavily relies on BullMQ and Redis for background processing. To adhere to the "Infrastructure Principle" of keeping deployment simple (no unnecessary Redis), IT-Bookmark will implement a **PostgreSQL-backed Job Queue**.
- A new table `archive_jobs` will track job state (`pending`, `processing`, `failed`, `success`), locking (`locked_at`, `worker_id`), and retries (`attempt_count`).
- The Express backend will spawn a dedicated worker process (or interval loop) that safely claims jobs using `SELECT FOR UPDATE SKIP LOCKED` (standard Postgres locking).

### 2. Archiving Engine
The Playwright engine will be isolated within the worker. It will feature:
- Strict SSRF (Server-Side Request Forgery) protection to prevent scraping local IPs.
- A reusable browser context to avoid the high overhead of launching Chromium for every single bookmark, automatically restarting the browser if it crashes or reaches a timeout limit.
- 4-stage extraction: Screenshot, PDF, Readability (DOMPurify), and Monolith HTML.

### 3. Full-Text Search
Instead of introducing Meilisearch, IT-Bookmark will leverage PostgreSQL's powerful built-in Full-Text Search (`tsvector`, `tsquery`). A dedicated background job will parse the Readability text and populate a `search_index` column, enabling rapid, typo-tolerant searches without managing a separate search engine infrastructure.

### 4. API & Shared Types
IT-Bookmark will maintain its `packages/shared` structure. API endpoints will strictly follow REST conventions (`/api/v1/...`). Zod will be used on both the frontend (React Hook Form) and backend (Express Middleware) to ensure type safety, simulating the type-safe experience of tRPC without the architectural coupling.
