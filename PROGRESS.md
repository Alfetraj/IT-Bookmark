# IT Bookmark — Progress Tracker

> **Last Updated**: 2026-07-14  
> **Current Phase**: Documentation  
> **Current Version**: 0.0.1-docs

---

## Project Lifecycle Status

```
[✅] Documentation Phase      ← CURRENT
[ ] Phase 1: Foundation
[ ] Phase 2: Power Features
[ ] Phase 3: AI & Mobile
[ ] Phase 4: Enterprise
```

---

## Documentation Status

| Document | Status | Date |
|---|---|---|
| PROJECT_CONTEXT.md | ✅ Complete | 2026-07-14 |
| ARCHITECTURE.md | ✅ Complete | 2026-07-14 |
| DATABASE_SCHEMA.md | ✅ Complete | 2026-07-14 |
| FEATURE_MATRIX.md | ✅ Complete | 2026-07-14 |
| ROADMAP.md | ✅ Complete | 2026-07-14 |
| API_SPEC.md | ✅ Complete | 2026-07-14 |
| PROGRESS.md | ✅ Complete | 2026-07-14 |
| TODO.md | ✅ Complete | 2026-07-14 |
| CHANGELOG.md | ✅ Complete | 2026-07-14 |

---

## Phase 1 Progress (Not Started)

### Milestone 1.1 — Project Bootstrap
| Task | Status | Notes |
|---|---|---|
| Initialize pnpm monorepo | ⬜ Pending | |
| Configure Vite + React 19 | ⬜ Pending | |
| Configure Express + TypeScript | ⬜ Pending | |
| Set up Supabase project | ⬜ Pending | |
| Configure shared packages | ⬜ Pending | |
| ESLint + Prettier + Husky | ⬜ Pending | |
| Vitest setup | ⬜ Pending | |
| Playwright setup | ⬜ Pending | |
| docker-compose.yml | ⬜ Pending | |

### Milestone 1.2 — Authentication
| Task | Status | Notes |
|---|---|---|
| Supabase Auth integration | ⬜ Pending | |
| Login page | ⬜ Pending | |
| Registration page | ⬜ Pending | |
| GitHub OAuth | ⬜ Pending | |
| JWT middleware (backend) | ⬜ Pending | |
| Protected route guard (frontend) | ⬜ Pending | |

### Milestone 1.3 — Collections
| Task | Status | Notes |
|---|---|---|
| Collections CRUD API | ⬜ Pending | |
| Sub-collection nesting | ⬜ Pending | |
| Sidebar navigation | ⬜ Pending | |
| Collaborator invite | ⬜ Pending | |
| Permission enforcement | ⬜ Pending | |

### Milestone 1.4 — Bookmarks Core
| Task | Status | Notes |
|---|---|---|
| Add bookmark by URL | ⬜ Pending | |
| Metadata auto-fetch | ⬜ Pending | |
| Edit / delete bookmark | ⬜ Pending | |
| Star / read toggle | ⬜ Pending | |
| Tag assignment | ⬜ Pending | |
| Full-text search | ⬜ Pending | |
| Filters | ⬜ Pending | |
| Grid / List / Compact views | ⬜ Pending | |
| Infinite scroll | ⬜ Pending | |

### Milestone 1.5 — Web Archiving
| Task | Status | Notes |
|---|---|---|
| BullMQ + Redis setup | ⬜ Pending | |
| Screenshot worker | ⬜ Pending | |
| PDF worker | ⬜ Pending | |
| Readability extraction | ⬜ Pending | |
| Supabase Storage upload | ⬜ Pending | |
| Realtime status updates | ⬜ Pending | |

### Milestone 1.6 — Reader View
| Task | Status | Notes |
|---|---|---|
| Reader page | ⬜ Pending | |
| Readability rendering | ⬜ Pending | |
| Font controls | ⬜ Pending | |
| Theme support | ⬜ Pending | |

### Milestone 1.7 — Import/Export
| Task | Status | Notes |
|---|---|---|
| Browser HTML import | ⬜ Pending | |
| Pocket import | ⬜ Pending | |
| JSON export | ⬜ Pending | |

### Milestone 1.8 — API & Settings
| Task | Status | Notes |
|---|---|---|
| Health check endpoint | ⬜ Pending | |
| API token management | ⬜ Pending | |
| User profile settings | ⬜ Pending | |
| Account deletion | ⬜ Pending | |

### Milestone 1.9 — Sharing
| Task | Status | Notes |
|---|---|---|
| Share link generation | ⬜ Pending | |
| Public collection page | ⬜ Pending | |
| Revoke share link | ⬜ Pending | |

### Milestone 1.10 — QA & Release
| Task | Status | Notes |
|---|---|---|
| Test suite | ⬜ Pending | |
| Performance audit | ⬜ Pending | |
| Security audit | ⬜ Pending | |
| Docker prod config | ⬜ Pending | |
| v1.0.0 release | ⬜ Pending | |

---

## Known Blockers

| Blocker | Type | Owner | Status |
|---|---|---|---|
| None currently | — | — | — |

---

## Metrics Snapshot

| Metric | Current | Target |
|---|---|---|
| Total features planned | 120+ | — |
| Phase 1 features | 60 | — |
| Documentation pages | 9 | 9 |
| Test coverage | 0% | 80% |
| API endpoints | 0 | 40+ |
| DB tables | 0 | 10 |

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-14 | Use Supabase instead of raw PostgreSQL | Built-in Auth, Storage, Realtime channels eliminate significant boilerplate |
| 2026-07-14 | Use BullMQ over agenda.js | Better TypeScript support, Redis-based, higher throughput for archive jobs |
| 2026-07-14 | Use cursor pagination over offset | Consistent performance at scale; avoids N+offset table scans |
| 2026-07-14 | Soft delete for bookmarks | Allows 30-day undo; user trust & data safety |
| 2026-07-14 | pnpm workspaces monorepo | Share types between frontend and backend; avoids duplication |
| 2026-07-14 | Use Playwright for archiving | Full browser rendering — handles SPAs, lazy-loaded images, complex layouts |
