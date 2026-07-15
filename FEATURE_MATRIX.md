# IT Bookmark — Feature Matrix

> **Version**: 1.0.0-alpha  
> **Last Updated**: 2026-07-14  
> Legend: ✅ Planned | 🔶 Partial / Limited | ❌ Not in Scope | 🔮 Future

---

## 1. Core Bookmark Management

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Add bookmark by URL | P0 | 1 | Single URL input, instant save |
| Auto-fetch title + description | P0 | 1 | Open Graph + HTML meta tags |
| Auto-fetch favicon | P0 | 1 | Stored in Supabase Storage |
| Auto-detect domain | P0 | 1 | Normalized hostname extraction |
| Edit bookmark metadata | P0 | 1 | Title, description, notes |
| Delete bookmark | P0 | 1 | Soft delete with 30-day recovery |
| Mark as read / unread | P0 | 1 | Toggle `is_read` flag |
| Star / favorite | P0 | 1 | Toggle `is_starred` flag |
| Personal notes (Markdown) | P1 | 1 | Markdown editor on bookmark detail |
| Duplicate detection | P1 | 1 | Warn if URL already saved |
| Bulk select + actions | P1 | 1 | Move, delete, tag multiple bookmarks |
| Keyboard shortcuts | P1 | 2 | Vim-inspired: `n` new, `/` search, etc. |
| Drag-and-drop reorder | P2 | 2 | Sort within collection |
| Browser extension | P1 | 2 | One-click save from any page |
| iOS Share Sheet / Shortcut | P2 | 3 | iOS Shortcuts integration |
| Android Share Intent | P2 | 3 | Share to IT Bookmark from Android |

---

## 2. Collection Management

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Create collection | P0 | 1 | Name, icon (emoji), color |
| Edit collection | P0 | 1 | Rename, change icon/color, description |
| Delete collection | P0 | 1 | With bookmark reassignment option |
| Sub-collections (nesting) | P1 | 1 | Up to 5 levels deep |
| Move bookmark to collection | P0 | 1 | Drag or context menu |
| Sort bookmarks within collection | P1 | 1 | By date, title, domain, manual |
| Collection visibility: private | P0 | 1 | Default — owner only |
| Collection visibility: shared (link) | P1 | 1 | Read-only share link with token |
| Collection visibility: public | P2 | 2 | Indexable public page |
| Collaborate on collection | P1 | 1 | Invite users by email |
| Member permission levels | P1 | 1 | Owner / Editor / Viewer |
| Remove member from collection | P1 | 1 | Owner can remove any member |
| Leave collection | P1 | 1 | Non-owner members can leave |
| Collection RSS feed | P2 | 2 | Atom/RSS feed for public collections |
| Smart collections (saved searches) | P2 | 3 | Dynamic collections by filter rules |

---

## 3. Tagging System

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Create tags | P0 | 1 | Name + optional color |
| Add tags to bookmark | P0 | 1 | Multi-select tag picker |
| Remove tag from bookmark | P0 | 1 | |
| Delete tag | P1 | 1 | With reassignment / bulk remove |
| Rename tag | P1 | 1 | Cascades to all bookmarks |
| Filter by tag | P0 | 1 | Tag-based filtered view |
| Tag autocomplete | P1 | 1 | Fuzzy search on tag input |
| AI auto-tagging | P1 | 2 | Optional — via AI adapter |
| Tag cloud / overview | P2 | 2 | Visual tag frequency map |
| Tag merge | P2 | 2 | Merge two tags into one |

---

## 4. Search & Filtering

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Full-text search | P0 | 1 | PostgreSQL `tsvector`, weighted by title/desc/notes |
| Search by URL | P0 | 1 | Substring match on `url` column |
| Filter by collection | P0 | 1 | Dropdown / sidebar nav |
| Filter by tag | P0 | 1 | Multi-tag filter (AND logic) |
| Filter by domain | P1 | 1 | e.g. "all from github.com" |
| Filter by read/unread | P1 | 1 | `is_read` toggle filter |
| Filter by starred | P1 | 1 | `is_starred` toggle filter |
| Filter by date range | P1 | 1 | Created / updated date picker |
| Filter by archive status | P2 | 2 | Find archived / pending |
| Sort results | P0 | 1 | Date added, title A-Z, last updated |
| Search in notes | P1 | 1 | Included in `search_vector` (C weight) |
| Search archived content | P2 | 3 | Full-text search over Readability extracts |
| Advanced query syntax | P2 | 3 | `tag:typescript domain:github.com` |

---

## 5. Web Archiving & Preservation

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Screenshot capture (PNG) | P0 | 1 | Playwright headless Chromium |
| PDF capture | P0 | 1 | Playwright PDF export |
| HTML snapshot (single file) | P1 | 1 | Monolith-style single-file HTML |
| Readable text extraction | P1 | 1 | Mozilla Readability.js |
| Wayback Machine submission | P2 | 2 | Optional — POST to Wayback API |
| Archive on demand (manual) | P1 | 1 | Trigger re-archive button |
| Archive retry on failure | P1 | 1 | Auto-retry with exponential backoff |
| Archive storage in Supabase | P0 | 1 | Private bucket with signed URLs |
| Archive download by user | P1 | 2 | Download PDF/screenshot locally |
| Metadata extraction | P1 | 1 | Author, publish date, reading time |

---

## 6. Reading Experience

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Reader mode (Readability.js) | P0 | 1 | Clean typography, no ads |
| Adjustable font size | P1 | 1 | 14/16/18/20px options |
| Font family choice | P1 | 1 | Sans / Serif / Mono |
| Dark / Light / System theme | P0 | 1 | Stored in user preferences |
| Estimated reading time | P1 | 1 | Based on word count (200 wpm) |
| Progress tracking | P2 | 2 | Scroll position saved per bookmark |
| Text highlight | P1 | 2 | Select text → highlight with color |
| Annotation notes on highlight | P1 | 2 | Attach note to selection |
| All annotations view | P2 | 2 | List all highlights/notes for a bookmark |
| Export annotations | P2 | 3 | Export to Markdown, Obsidian, Notion |

---

## 7. Import / Export

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Import from browser HTML export | P0 | 1 | Chrome/Firefox/Safari bookmarks |
| Import from Pocket | P1 | 1 | Pocket HTML export format |
| Import from Raindrop.io | P1 | 1 | Raindrop CSV format |
| Import from Linkwarden | P1 | 2 | JSON export format |
| Import from Omnivore | P2 | 2 | JSON/CSV export format |
| Export to JSON | P0 | 1 | Full data export (IT Bookmark format) |
| Export to Markdown | P1 | 2 | Flat Markdown file with frontmatter |
| Export to CSV | P1 | 2 | Spreadsheet-friendly format |
| Export single collection | P2 | 2 | Subset export by collection |
| Scheduled auto-export | P2 | 3 | Weekly backup to storage |

---

## 8. User Account & Settings

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Email + password registration | P0 | 1 | Supabase Auth |
| Magic link login | P0 | 1 | Supabase Auth |
| OAuth: GitHub | P0 | 1 | Supabase Auth provider |
| OAuth: Google | P1 | 1 | Supabase Auth provider |
| OAuth: Discord | P2 | 2 | Supabase Auth provider |
| Profile editing | P0 | 1 | Username, display name, bio, avatar |
| Avatar upload | P1 | 1 | Stored in Supabase Storage `avatars` bucket |
| Password change | P0 | 1 | Via Supabase Auth |
| Account deletion | P1 | 1 | Full data wipe with confirmation |
| API token management | P1 | 1 | Create / revoke named tokens with scopes |
| Session management | P1 | 2 | View and revoke active sessions |
| Two-factor authentication (TOTP) | P2 | 3 | Supabase MFA support |
| Email notifications | P2 | 2 | Collection invites, share activity |

---

## 9. AI Features (All Optional)

| Feature | Priority | Phase | AI Adapter |
|---|---|---|---|
| Auto-tag by content | P1 | 2 | Ollama (local), OpenAI, Gemini |
| AI summary of bookmark | P2 | 2 | Any LLM adapter |
| Smart content classification | P2 | 3 | Article / tool / video / PDF |
| AI-powered search (semantic) | P2 | 3 | Embeddings via pgvector |
| Duplicate content detection | P2 | 3 | Embedding similarity |

---

## 10. API & Integrations

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| REST API v1 | P0 | 1 | Full CRUD for all resources |
| OpenAPI 3.1 specification | P0 | 1 | Auto-generated docs |
| Personal API tokens | P1 | 1 | Named tokens with scopes |
| Webhook outbound events | P2 | 3 | bookmark.created, archive.done, etc. |
| Zapier / Make integration | P2 | 3 | Via webhook receiver |
| Slack integration | P2 | 3 | `/bookmark [url]` slash command |
| IFTTT integration | P3 | 3 | Via webhook |

---

## 11. Administration (Self-Hosted)

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Docker Compose deployment | P0 | 1 | Single command startup |
| Environment config via `.env` | P0 | 1 | Full documentation provided |
| User registration enable/disable | P1 | 1 | ENV: `ALLOW_REGISTRATION=false` |
| Health check endpoint | P1 | 1 | `GET /api/health` |
| Metrics endpoint | P2 | 2 | Prometheus-compatible `/metrics` |
| Backup script | P1 | 2 | pg_dump + Supabase Storage export |
| Admin user panel | P2 | 3 | User management UI |

---

## 12. UI / UX Features

| Feature | Priority | Phase | Notes |
|---|---|---|---|
| Grid view | P0 | 1 | Card layout with OG image |
| List view | P0 | 1 | Compact rows |
| Compact view | P1 | 1 | Maximum density |
| Sidebar navigation | P0 | 1 | Collections tree, tags, filters |
| Responsive / Mobile-first | P0 | 1 | Works on all screen sizes |
| PWA installable | P1 | 2 | App manifest + Service Worker |
| Offline read mode (PWA) | P2 | 3 | Cached archived content |
| Keyboard navigation | P1 | 2 | Full keyboard accessibility |
| Drag-and-drop | P1 | 2 | Bookmark reordering |
| Infinite scroll | P1 | 1 | Cursor-based pagination |
| Toast notifications | P0 | 1 | Action feedback |
| Command palette | P1 | 2 | `Cmd+K` quick actions |
| Quick-add modal | P0 | 1 | Global keyboard shortcut `n` |
