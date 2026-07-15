# IT Bookmark — Changelog

> All notable changes to this project will be documented in this file.  
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
> Versioning follows [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Added
- Initial project documentation suite:
  - `PROJECT_CONTEXT.md` — Project vision, philosophy, and technology rationale
  - `ARCHITECTURE.md` — Clean Architecture design, monorepo structure, data flows
  - `DATABASE_SCHEMA.md` — Full PostgreSQL schema with RLS, indexes, triggers, migrations strategy
  - `FEATURE_MATRIX.md` — Comprehensive feature list with priorities and phases
  - `ROADMAP.md` — 4-phase development roadmap (Q3 2026 – Q2 2027)
  - `API_SPEC.md` — Complete REST API specification with request/response shapes
  - `PROGRESS.md` — Progress tracker and decision log
  - `TODO.md` — Granular task list organized by milestone
  - `CHANGELOG.md` — This file

---

## [0.0.1-docs] — 2026-07-14

### Added
- Documentation phase initiated
- Comprehensive analysis of Linkwarden (open-source reference project) feature set:
  - Bookmark management (CRUD, metadata, archiving)
  - Collection organization and collaboration model
  - Tag system
  - Web archiving (screenshot, PDF, HTML snapshot, Readability)
  - Reader mode with annotation system
  - Import/Export capabilities
  - Authentication (OAuth, magic link, email/password)
  - Sharing (private, link-shared, public)
  - API with personal access tokens
- Designed original IT Bookmark architecture:
  - Clean Architecture with 4 distinct layers (Presentation, Application, Domain, Infrastructure)
  - React 19 + Vite + TypeScript frontend
  - Node.js + Express + TypeScript backend
  - Supabase PostgreSQL + Auth + Storage
  - BullMQ + Redis for background job queue
  - Playwright for headless web archiving
- Designed complete PostgreSQL schema (10 tables):
  - `users` — Extended Supabase Auth profile
  - `collections` — Nested bookmark containers with visibility
  - `collection_members` — Permission-based collaboration
  - `bookmarks` — Primary aggregate with full-text search via tsvector
  - `tags` — User-scoped labels
  - `bookmark_tags` — Many-to-many junction
  - `archives` — Multi-format preservation records
  - `annotations` — Text highlights with DOM position anchoring
  - `api_tokens` — Scoped personal access tokens
  - `import_jobs` — Bulk import progress tracking
- Defined 40+ REST API endpoints across 9 resource groups
- Defined 120+ features across 12 categories
- Planned 4-phase development roadmap with 16 milestones in Phase 1 alone

---

## Future Planned Releases

### [1.0.0] — Target: Q3 2026 (September)
First stable production-ready release. See `ROADMAP.md` Phase 1 for full details.

**Planned Features**:
- Complete bookmark management (CRUD, metadata, tags, collections)
- Web archiving (screenshot, PDF, Readability)
- Reader view
- Collaboration (invite, permission levels)
- Sharing (share links)
- Full-text search
- Import (browser HTML, Pocket)
- Export (JSON)
- Authentication (email/password, magic link, GitHub OAuth)
- Personal API tokens
- Self-hosting via Docker Compose

---

### [1.1.0] — Target: Q4 2026 (October)
**Planned Features**:
- Text highlights and annotations in reader view
- Annotation CRUD API
- Annotation export

---

### [1.2.0] — Target: Q4 2026 (November)
**Planned Features**:
- Chrome Browser Extension (Manifest v3)
- Firefox Browser Extension
- One-click save from any webpage
- Duplicate detection in extension

---

### [1.3.0] — Target: Q4 2026 (November–December)
**Planned Features**:
- AI auto-tagging (Ollama, OpenAI, Gemini adapters)
- AI bookmark summary
- AI suggestion accept/reject UI

---

### [1.4.0] — Target: Q4 2026 (December)
**Planned Features**:
- Command palette (`Cmd+K`)
- Keyboard shortcuts system
- Drag-and-drop reordering
- Tag merge and rename
- Import: Raindrop.io, Linkwarden JSON
- Export: Markdown, CSV
- Collection RSS/Atom feed
- Wayback Machine submission

---

### [1.5.0] — Target: Q4 2026 (December)
**Planned Features**:
- Progressive Web App (PWA) — installable
- Service Worker for offline caching
- Push notifications (archive done, invite received)
- Improved mobile navigation
- iOS Safari optimizations

---

### [2.0.0] — Target: Q1 2027 (March)
Major release with semantic search and mobile app.

**Planned Features**:
- pgvector semantic search (embeddings)
- Hybrid search (full-text + semantic)
- Duplicate content detection
- React Native mobile app (iOS + Android)
- Outbound webhooks
- Zapier / Make integration
- Smart collections (rule-based)

---

### [2.5.0] — Target: Q2 2027 (June)
Enterprise and team readiness.

**Planned Features**:
- Admin dashboard
- Team workspaces
- Activity audit log
- i18n support (Arabic, French, German, Spanish)
- Annotation export to Obsidian / Notion / Readwise
- Prometheus metrics
- TOTP two-factor authentication

---

## Versioning Policy

```
MAJOR.MINOR.PATCH[-PRE]

MAJOR — Breaking API or DB migration changes
MINOR — New backward-compatible features
PATCH — Bug fixes and security patches
PRE   — Pre-release: alpha, beta, rc
```

Examples:
- `1.0.0` — First stable release
- `1.1.0` — New feature (annotations)
- `1.1.1` — Bug fix in annotations
- `2.0.0-beta.1` — Pre-release of v2 with breaking API changes
