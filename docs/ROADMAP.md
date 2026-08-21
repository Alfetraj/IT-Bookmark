# IT Bookmark — Roadmap

> **Version**: 1.0.0-alpha  
> **Last Updated**: 2026-07-14  
> **Status**: Planning Phase

---

## Roadmap Overview

```
2026
 Q3 ──────── Phase 1: Foundation & Core         (Jul – Sep)
 Q4 ──────── Phase 2: Power Features & Extension (Oct – Dec)
2027
 Q1 ──────── Phase 3: AI, Mobile & Scale         (Jan – Mar)
 Q2 ──────── Phase 4: Polish & Enterprise        (Apr – Jun)
```

---

## Phase 1 — Foundation & Core (v0.1 → v1.0)

**Timeline**: July 2026 – September 2026  
**Goal**: A fully functional bookmark manager that is self-hostable and production-ready.

### Milestone 1.1 — Project Bootstrap (Week 1–2)
- [ ] Initialize pnpm monorepo (`apps/web`, `apps/server`, `packages/shared`, `packages/ui`)
- [ ] Configure Vite + React 19 + TypeScript for frontend
- [ ] Configure Express + TypeScript for backend
- [ ] Set up Supabase project (local dev with `supabase start`)
- [ ] Configure shared `packages/shared` types and Zod schemas
- [ ] Set up ESLint + Prettier + Husky pre-commit hooks
- [ ] Set up Vitest for unit tests
- [ ] Set up Playwright for E2E tests
- [ ] Write initial `docker-compose.yml`

### Milestone 1.2 — Authentication (Week 3–4)
- [ ] Integrate Supabase Auth on backend (JWT middleware)
- [ ] Login page — email/password + magic link
- [ ] Registration page
- [ ] OAuth: GitHub login
- [ ] Supabase `users` table + `handle_new_user` trigger
- [ ] Protected route guard in React Router
- [ ] JWT auto-refresh via Supabase client

### Milestone 1.3 — Collections (Week 5–6)
- [ ] Create / edit / delete collections
- [ ] Sub-collection nesting (parent_id)
- [ ] Sidebar navigation with collections tree
- [ ] Collection detail page
- [ ] Collection settings page (members, visibility)
- [ ] Invite user to collection by email
- [ ] Permission enforcement (Owner / Editor / Viewer)

### Milestone 1.4 — Bookmarks Core (Week 7–9)
- [ ] Add bookmark by URL (quick-add modal)
- [ ] Auto-fetch metadata (title, description, OG image, favicon)
- [ ] Edit bookmark
- [ ] Delete bookmark (soft delete)
- [ ] Star / mark as read
- [ ] Assign to collection
- [ ] Tag picker (add/remove tags)
- [ ] Full-text search (tsvector)
- [ ] Filter by tag, collection, domain, read/unread, starred
- [ ] Grid view + List view + Compact view
- [ ] Infinite scroll (cursor pagination)
- [ ] Duplicate URL detection

### Milestone 1.5 — Web Archiving (Week 10–12)
- [ ] Set up BullMQ + Redis queue
- [ ] Archive worker: Playwright screenshot capture
- [ ] Archive worker: PDF generation
- [ ] Archive worker: Readability.js text extraction
- [ ] Upload archives to Supabase Storage
- [ ] Archive status badges on bookmark cards
- [ ] Retry logic with exponential backoff
- [ ] Realtime archive status updates via Supabase channels

### Milestone 1.6 — Reader View (Week 11–12)
- [ ] Reader view page (`/bookmarks/:id`)
- [ ] Render extracted Readability content
- [ ] Font size and family controls
- [ ] Estimated reading time display
- [ ] Dark / Light / System theme

### Milestone 1.7 — Import / Export (Week 13)
- [ ] Import from browser HTML (Chrome/Firefox/Safari)
- [ ] Import from Pocket HTML export
- [ ] Export to JSON (full data)
- [ ] Import job progress tracking (polling)

### Milestone 1.8 — API & Settings (Week 14)
- [ ] `GET /api/health` health check endpoint
- [ ] API token creation and management UI
- [ ] Personal API tokens (scoped)
- [ ] User profile editing (username, display name, avatar)
- [ ] User preferences (theme, default view)
- [ ] Account deletion

### Milestone 1.9 — Sharing (Week 15)
- [ ] Generate share link for collection (share_token)
- [ ] Public read-only shared collection page
- [ ] Revoke share link

### Milestone 1.10 — QA & Release (Week 16)
- [ ] Full test suite (unit + integration + E2E)
- [ ] Performance audit (Lighthouse)
- [ ] Security audit (OWASP Top 10 checklist)
- [ ] Docker Compose production configuration
- [ ] Write README and self-hosting guide
- [ ] Tag `v1.0.0` release

---

## Phase 2 — Power Features & Extension (v1.1 → v1.5)

**Timeline**: October 2026 – December 2026  
**Goal**: Make IT Bookmark the daily driver for power users.

### v1.1 — Annotations
- [ ] Text highlight in reader view
- [ ] Color-coded highlights (4 colors)
- [ ] Attach notes to highlights
- [ ] Annotations list sidebar
- [ ] Annotation CRUD API

### v1.2 — Browser Extension
- [ ] Chrome Extension (Manifest v3)
- [ ] Firefox Extension
- [ ] One-click bookmark save
- [ ] Tag and collection selector in popup
- [ ] Keyboard shortcut to open popup
- [ ] Duplicate detection in extension

### v1.3 — AI Tagging
- [ ] Pluggable AI adapter interface
- [ ] Ollama adapter (local LLM)
- [ ] OpenAI adapter (GPT-4o-mini)
- [ ] Gemini adapter (Gemini Flash)
- [ ] AI auto-tagging as BullMQ job (triggered after archive)
- [ ] AI summary generation (optional)
- [ ] User can accept/reject AI suggestions

### v1.4 — Advanced Features
- [ ] Command palette (`Cmd+K`)
- [ ] Keyboard shortcuts system
- [ ] Drag-and-drop bookmark reordering
- [ ] Tag merge and rename
- [ ] Import from Raindrop.io
- [ ] Import from Linkwarden JSON
- [ ] Export to Markdown
- [ ] Export to CSV
- [ ] Collection RSS/Atom feed (public collections)
- [ ] Wayback Machine submission

### v1.5 — PWA & Mobile UX
- [ ] Service Worker for PWA
- [ ] App manifest + install prompt
- [ ] Push notifications (archive done, share activity)
- [ ] Improved mobile navigation
- [ ] iOS Safari "Add to Home Screen" optimizations

---

## Phase 3 — AI, Mobile & Scale (v2.0)

**Timeline**: January 2027 – March 2027  
**Goal**: First-class mobile app and advanced AI-powered features.

### v2.0 — Semantic Search
- [ ] Add `pgvector` extension to Supabase
- [ ] Embedding generation for bookmarks (title + description + readability text)
- [ ] Semantic similarity search endpoint
- [ ] Hybrid search (BM25 + cosine similarity)
- [ ] Duplicate content detection via embeddings

### v2.1 — Mobile App (React Native)
- [ ] React Native + Expo app
- [ ] Bookmark browsing and reading
- [ ] Share Sheet integration (iOS + Android)
- [ ] Offline reading (cached archives)
- [ ] Push notifications
- [ ] App Store + Google Play submission

### v2.2 — Webhooks & Integrations
- [ ] Outbound webhook system
- [ ] `bookmark.created`, `archive.done`, `collection.shared` events
- [ ] Slack slash command integration
- [ ] Zapier / Make webhook receiver

### v2.3 — Smart Collections
- [ ] Saved searches as dynamic collections
- [ ] Rule engine (if tag contains X AND domain is Y)
- [ ] Auto-add bookmarks matching rules

---

## Phase 4 — Polish & Enterprise (v2.5+)

**Timeline**: April 2027 – June 2027  
**Goal**: Enterprise-readiness, team management, and ecosystem maturity.

### v2.5 — Administration
- [ ] Admin dashboard (user management)
- [ ] Server-wide statistics
- [ ] Prometheus metrics endpoint
- [ ] Scheduled export / backup script
- [ ] Storage quota management per user

### v2.6 — Team Features
- [ ] Team workspace concept (shared user namespace)
- [ ] Team-scoped collections (not tied to individual user)
- [ ] Activity feed / audit log
- [ ] Email notification system (invites, mentions)

### v2.7 — Multi-language (i18n)
- [ ] i18next integration
- [ ] English (default)
- [ ] Arabic, French, German, Spanish (community translations)

### v2.8 — Advanced Export & Annotation Export
- [ ] Export annotations to Obsidian (markdown)
- [ ] Export annotations to Notion (via API)
- [ ] Export annotations to Readwise
- [ ] Custom domain for public collections

---

## Version Numbering

| Version | Description |
|---|---|
| `0.x.x` | Pre-release / development milestones |
| `1.0.0` | First stable, production-ready release |
| `1.x.0` | Minor feature releases |
| `1.x.x` | Patch / bug fix releases |
| `2.0.0` | Major release with breaking API changes |

---

## Backlog (Unscheduled)

- TOTP / 2FA via Supabase MFA
- SAML SSO (enterprise)
- Custom domain for shared collections
- Obsidian plugin
- VS Code extension
- Readwise integration
- AI-powered reading assistant (chat with your bookmarks)
