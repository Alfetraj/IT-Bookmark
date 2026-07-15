# IT Bookmark — Project Context

> **Version**: 1.0.0-alpha  
> **Created**: 2026-07-14  
> **Status**: Pre-Development / Documentation Phase  
> **Inspired by**: [Linkwarden](https://github.com/linkwarden/linkwarden) (feature analysis only — no code copied)

---

## 1. What Is IT Bookmark?

**IT Bookmark** is a full-stack, self-hostable bookmark and knowledge management application designed for IT professionals, developers, and knowledge workers who demand precision, speed, and control over their digital reading workflows.

It is **not** a simple bookmarking tool. It is a **personal and team knowledge archive** — combining the best concepts from read-it-later apps, web archiving, collaborative note-taking, and AI-assisted organization into a single, clean, opinionated system.

---

## 2. Problem Statement

The modern knowledge worker faces these problems daily:

| Problem | Impact |
|---|---|
| **Link Rot** — URLs die, pages disappear | Saved references become useless |
| **Tab Hoarding** — browsers choke with hundreds of tabs | Lost context, wasted time |
| **Scattered tools** — Pocket, Notion, browser bookmarks, Slack saved items | No single source of truth |
| **No offline access** — can't read saved articles without internet | Poor reliability |
| **No collaboration** — individual bookmarking tools don't scale to teams | Knowledge silos |
| **No annotation** — saving without understanding is passive | Poor retention |

**IT Bookmark** solves all of the above in one integrated, privacy-first application.

---

## 3. Core Philosophy

1. **Preservation First** — A bookmark that can disappear is not a bookmark. Every link saved is archived in multiple formats (screenshot, PDF, readable text).
2. **Speed Over Everything** — Adding a bookmark must be frictionless (≤ 2 clicks or keystrokes).
3. **Clean Architecture** — Business logic is infrastructure-agnostic and fully testable.
4. **Privacy-First** — No telemetry, no ads, no tracking by default. Self-hostable with Supabase.
5. **Team-Ready** — Designed from day 1 to support multi-user collaboration, sharing, and permission control.
6. **AI-Augmented, Not AI-Dependent** — AI features are optional enhancements, not requirements.

---

## 4. Target Audience

| Persona | Use Case |
|---|---|
| **Solo Developer** | Curating technical resources, documentation, blog posts |
| **Research Team** | Shared knowledge base with annotations and tagging |
| **Content Creator** | Inspiration boards, reference libraries |
| **IT Administrator** | Self-hosted deployment, team-wide link management |
| **Student / Learner** | Study references, highlight annotations, reading queue |

---

## 5. Technology Choices & Rationale

### Frontend: React 19 + Vite + TypeScript

| Choice | Rationale |
|---|---|
| **React 19** | Latest stable, improved hydration, `use()` hook, Actions API |
| **Vite** | Extremely fast HMR, native ESM, minimal config overhead |
| **TypeScript** | End-to-end type safety from API contracts to UI components |

### Backend: Node.js + Express + TypeScript

| Choice | Rationale |
|---|---|
| **Node.js** | JavaScript ecosystem alignment with frontend, large async I/O throughput |
| **Express** | Minimal, flexible, battle-tested; easy to wrap in Clean Architecture layers |
| **TypeScript** | Shared types between frontend and backend via monorepo `packages/shared` |

### Database: Supabase (PostgreSQL)

| Choice | Rationale |
|---|---|
| **Supabase** | Managed PostgreSQL with Auth, Realtime, Storage built-in |
| **PostgreSQL** | Full-text search, JSONB columns, UUID support, Row-Level Security |
| **Supabase Storage** | Archive files (PDFs, screenshots, HTML snapshots) |
| **Supabase Auth** | OAuth, magic links, JWTs — no custom auth wheel-reinvention |

---

## 6. Repository Structure (Planned)

```
it-bookmark/
├── apps/
│   ├── web/                  # React 19 + Vite frontend
│   └── server/               # Express + Node.js backend
├── packages/
│   ├── shared/               # Shared TypeScript types & contracts
│   └── ui/                   # Shared UI component library (Radix UI + CSS)
├── docs/                     # Documentation directory
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── FEATURE_MATRIX.md
│   ├── ROADMAP.md
│   ├── API_SPEC.md
│   ├── PROGRESS.md
│   ├── TODO.md
│   └── CHANGELOG.md
├── docker-compose.yml        # Self-hosting stack
├── .env.example
└── README.md
```

---

## 7. Differentiation from Linkwarden (Inspiration)

IT Bookmark learns from Linkwarden's strengths and addresses its gaps:

| Feature | Linkwarden | IT Bookmark |
|---|---|---|
| Tech Stack | Next.js + Prisma + PostgreSQL | React 19 + Express + Supabase |
| Architecture | Monolith (Next.js app dir) | Clean Architecture (separated layers) |
| Auth | NextAuth | Supabase Auth (OAuth, magic link, email/pass) |
| AI Tagging | Local AI via Ollama | Pluggable AI adapters (Ollama, OpenAI, Gemini) |
| Storage | Local filesystem / S3 | Supabase Storage (S3-compatible) |
| Browser Extension | Yes | Planned (Phase 2) |
| Mobile App | Yes | Planned (Phase 3 — React Native) |
| API Design | REST (NextJS routes) | Clean REST with OpenAPI 3.1 spec |
| Realtime | No | Yes (Supabase Realtime channels) |
| Type Safety | Partial | End-to-end (shared types package) |
| Testing | Minimal | Unit + Integration + E2E (Vitest + Playwright) |

---

## 8. Non-Goals (v1.0)

- No social feed or public discovery features
- No payment / subscription infrastructure in v1.0
- No native desktop app (web + PWA is sufficient)
- No real-time collaborative editing of annotations (future)
- No custom domain support for shared collections (future)

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time to save a bookmark | < 3 seconds |
| Archive generation time | < 30 seconds (background job) |
| API response time (P99) | < 200ms |
| Frontend First Contentful Paint | < 1.5s |
| Test coverage | > 80% for core business logic |
| Self-hosting setup time | < 15 minutes (Docker Compose) |

---

## 10. Constraints & Assumptions

- **Supabase** is used as the primary infrastructure for PostgreSQL, Auth, and Storage
- Archive generation (headless browser for screenshots/PDFs) runs as a background job queue using BullMQ with Redis
- The application supports **English** as the primary language (i18n support in Phase 2)
- Minimum supported browsers: Chrome 120+, Firefox 121+, Safari 17+
- Node.js version: 20 LTS minimum
