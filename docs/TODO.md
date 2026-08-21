# IT Bookmark — TODO

> **Last Updated**: 2026-07-14  
> Priority: P0 = Critical | P1 = High | P2 = Medium | P3 = Low

---

## Immediate (Before Code Begins)

- [ ] **[P0]** Create Supabase project (cloud or self-hosted)
- [ ] **[P0]** Set up GitHub repository with branch protection rules
- [ ] **[P0]** Configure `.env.example` with all required variables
- [ ] **[P0]** Choose and register a domain name for the project
- [ ] **[P1]** Set up Supabase local development environment (`supabase start`)
- [ ] **[P1]** Define CI/CD pipeline (GitHub Actions)
  - Lint on push
  - Test on PR
  - Build check on PR
  - Deploy to staging on merge to `main`
- [ ] **[P1]** Review and finalize DATABASE_SCHEMA.md — any missing tables?
- [ ] **[P2]** Select icon library (Lucide React recommended)
- [ ] **[P2]** Confirm design system tokens (colors, spacing, typography)

---

## Phase 1 Development TODOs

### Infrastructure Setup
- [ ] **[P0]** Initialize pnpm monorepo (`pnpm-workspace.yaml`)
- [ ] **[P0]** `apps/web` — Vite + React 19 + TypeScript scaffold
- [ ] **[P0]** `apps/server` — Express + TypeScript scaffold
- [ ] **[P0]** `packages/shared` — TypeScript types package
- [ ] **[P0]** `packages/ui` — component library skeleton
- [ ] **[P0]** Configure TypeScript project references
- [ ] **[P1]** ESLint config (flat config format)
- [ ] **[P1]** Prettier config
- [ ] **[P1]** Husky + lint-staged pre-commit hooks
- [ ] **[P1]** Vitest configuration
- [ ] **[P1]** Playwright configuration (E2E)
- [ ] **[P1]** Docker Compose for local dev (Redis + Supabase local)
- [ ] **[P2]** `commitlint` configuration for conventional commits

### Authentication
- [ ] **[P0]** Supabase Auth client initialization (frontend)
- [ ] **[P0]** `verifyJWT` Express middleware (backend)
- [ ] **[P0]** Login page component
- [ ] **[P0]** Registration page component
- [ ] **[P0]** `handle_new_user` Supabase trigger (SQL migration)
- [ ] **[P0]** Route guard — redirect to `/login` if unauthenticated
- [ ] **[P1]** GitHub OAuth configuration
- [ ] **[P1]** Token auto-refresh in Axios interceptor
- [ ] **[P1]** Logout functionality (clear tokens)
- [ ] **[P2]** Google OAuth configuration

### Database Migrations
- [ ] **[P0]** Migration: `users` table
- [ ] **[P0]** Migration: `collections` table + indexes
- [ ] **[P0]** Migration: `collection_members` table
- [ ] **[P0]** Migration: `bookmarks` table + indexes + search trigger
- [ ] **[P0]** Migration: `tags` table
- [ ] **[P0]** Migration: `bookmark_tags` junction table
- [ ] **[P0]** Migration: `archives` table
- [ ] **[P1]** Migration: `annotations` table
- [ ] **[P1]** Migration: `api_tokens` table
- [ ] **[P1]** Migration: `import_jobs` table
- [ ] **[P0]** RLS policies for all tables
- [ ] **[P0]** Supabase Storage bucket setup (archives, avatars, exports)

### Core Use Cases (Backend)
- [ ] **[P0]** `CreateBookmarkUseCase` — save URL + trigger metadata fetch
- [ ] **[P0]** `GetBookmarksUseCase` — paginated list with filters
- [ ] **[P0]** `GetBookmarkByIdUseCase` — detail with tags, archives, annotations
- [ ] **[P0]** `UpdateBookmarkUseCase` — edit metadata, collection, tags
- [ ] **[P0]** `DeleteBookmarkUseCase` — soft delete
- [ ] **[P0]** `CreateCollectionUseCase`
- [ ] **[P0]** `GetCollectionsUseCase`
- [ ] **[P0]** `UpdateCollectionUseCase`
- [ ] **[P0]** `DeleteCollectionUseCase`
- [ ] **[P0]** `InviteCollaboratorUseCase`
- [ ] **[P0]** `UpdateMemberRoleUseCase`
- [ ] **[P0]** `RemoveMemberUseCase`
- [ ] **[P0]** `CreateTagUseCase`
- [ ] **[P0]** `UpdateTagUseCase`
- [ ] **[P0]** `DeleteTagUseCase`
- [ ] **[P1]** `ShareCollectionUseCase` — generate share token
- [ ] **[P1]** `RevokeShareLinkUseCase`
- [ ] **[P1]** `SearchBookmarksUseCase` — full-text search
- [ ] **[P1]** `TriggerArchiveUseCase` — dispatch BullMQ job
- [ ] **[P1]** `GetReadabilityContentUseCase`
- [ ] **[P1]** `CreateAnnotationUseCase`
- [ ] **[P1]** `ExportBookmarksUseCase` — JSON format
- [ ] **[P1]** `ImportBookmarksUseCase` — browser HTML format
- [ ] **[P1]** `CreateApiTokenUseCase`
- [ ] **[P1]** `RevokeApiTokenUseCase`
- [ ] **[P1]** `GetUserProfileUseCase`
- [ ] **[P1]** `UpdateUserProfileUseCase`

### BullMQ Workers
- [ ] **[P0]** Redis connection setup
- [ ] **[P0]** BullMQ queue definitions
- [ ] **[P0]** Worker: `archive:screenshot` (Playwright PNG)
- [ ] **[P0]** Worker: `archive:pdf` (Playwright PDF)
- [ ] **[P1]** Worker: `archive:readability` (Readability.js extraction)
- [ ] **[P1]** Worker: `archive:metadata` (fetch OG/meta tags)
- [ ] **[P1]** Job retry logic with exponential backoff
- [ ] **[P1]** Supabase Realtime event emission on job complete
- [ ] **[P2]** Worker: `archive:wayback` (Wayback Machine submission)

### Frontend Pages & Components
- [ ] **[P0]** App shell (sidebar + main content layout)
- [ ] **[P0]** Sidebar: collections tree navigation
- [ ] **[P0]** Dashboard page (all bookmarks)
- [ ] **[P0]** Collection detail page
- [ ] **[P0]** Bookmark card (grid view)
- [ ] **[P0]** Bookmark row (list view)
- [ ] **[P0]** Quick-add bookmark modal
- [ ] **[P0]** Bookmark detail / reader view page
- [ ] **[P0]** Settings page (profile)
- [ ] **[P0]** Login page
- [ ] **[P0]** Register page
- [ ] **[P1]** Search results page
- [ ] **[P1]** Tags overview page
- [ ] **[P1]** Collection settings page (members)
- [ ] **[P1]** Public shared collection page (unauthenticated)
- [ ] **[P1]** API tokens settings page
- [ ] **[P1]** Import page

### TanStack Query Hooks
- [ ] **[P0]** `useBookmarks(filters)` — list with infinite scroll
- [ ] **[P0]** `useBookmark(id)` — single bookmark
- [ ] **[P0]** `useCreateBookmark()` — mutation
- [ ] **[P0]** `useUpdateBookmark()` — mutation
- [ ] **[P0]** `useDeleteBookmark()` — mutation with optimistic update
- [ ] **[P0]** `useCollections()` — list
- [ ] **[P0]** `useCreateCollection()` — mutation
- [ ] **[P0]** `useTags()` — list
- [ ] **[P1]** `useSearch(query)` — full-text search with debounce
- [ ] **[P1]** `useAnnotations(bookmarkId)` — annotations list

---

## Phase 2 TODOs

- [ ] Annotations highlight system in reader view
- [ ] Browser extension (Chrome Manifest v3)
- [ ] AI tagging adapter interface + Ollama implementation
- [ ] Command palette (`Cmd+K`)
- [ ] Keyboard shortcuts system
- [ ] Drag-and-drop bookmark reordering
- [ ] Tag cloud visualization
- [ ] Import: Raindrop.io CSV
- [ ] Import: Linkwarden JSON
- [ ] Export: Markdown
- [ ] Export: CSV
- [ ] Collection RSS feed
- [ ] Wayback Machine submission worker
- [ ] PWA manifest + service worker
- [ ] Google OAuth

---

## Phase 3 TODOs

- [ ] pgvector extension + embedding generation
- [ ] Semantic similarity search
- [ ] React Native mobile app scaffold
- [ ] Outbound webhook system
- [ ] Smart collections (saved search rules)
- [ ] Offline read mode (PWA)

---

## Documentation TODOs

- [ ] Write detailed README.md with screenshots
- [ ] Write self-hosting Docker guide
- [ ] Write developer contribution guide (CONTRIBUTING.md)
- [ ] Write API usage examples
- [ ] Set up OpenAPI spec generation from code

---

## Bug / Issue Tracking

| # | Description | Priority | Status |
|---|---|---|---|
| — | No issues yet — | — | — |

---

## Questions / Decisions Pending

- [ ] Should soft-deleted bookmarks be excluded from search by default, or show with a "deleted" badge?
- [ ] Should the share link URL include the username or just the token? (e.g., `/s/<token>` vs `/public/<username>/<slug>`)
- [ ] Should the archive worker run in the same Node.js process or a separate one? (Recommendation: separate container)
- [ ] Is `pgvector` required for Phase 1 or can semantic search wait until Phase 3?
- [ ] What should happen to shared collections when the owner deletes their account?
