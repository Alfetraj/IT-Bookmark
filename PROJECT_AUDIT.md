# IT Bookmark — Project Audit Report

> **Audit Date**: 2026-07-17
> **Audited Against**: Uploaded project source (local zip snapshot)
> **Auditor**: Claude
> **Phase**: 1 — Audit / Bug Discovery / Missing API Discovery

---

## ⚠️ Scope Note — Please Read First

The task brief states this project lives at `https://github.com/Alfetraj/IT-Bookmark`, is "~65% complete,"
and that "Prisma has been completely removed" (implying Prisma was previously present).

None of that could be verified, and some of it is contradicted by the evidence:

- `https://github.com/Alfetraj/IT-Bookmark` returns **HTTP 404** — via `git clone`, the GitHub API, and a direct
  fetch. A web search turns up no matching repository either. I cannot audit a repo I cannot reach.
- The actual source available to me (uploaded earlier in this conversation) contains **zero references to
  Prisma** anywhere — no `schema.prisma`, no `@prisma/client` in any `package.json`, no Prisma imports. There's
  nothing to indicate Prisma was ever integrated, so "removed" isn't an accurate description of this codebase's
  history (it may be accurate for a *different* snapshot I don't have access to).
- Based on actual file contents (below), this codebase is **far short of 65% complete** — closer to 10-15% of
  the full feature set described in its own `TODO.md`/`ROADMAP.md`. See the "Completion Reality Check" section.

This audit is based entirely on the real files in the working directory. If there's a newer/different snapshot
of the repo (private, a different URL, a different branch), point me to it and I'll re-run this audit against
that instead — everything below could change.

---

## 1. Completion Reality Check

| Claimed | Actual (verified) |
|---|---|
| ~65% complete | ~10-15% of Phase 1 alone; Phase 2/3 features: 0% |
| Collections module ✔ complete | No collections controller, route, or DB migration exists |
| Bookmark module ✔ complete | No bookmark controller, route, or DB migration exists |
| Supabase integration ✔ complete (Prisma removed) | Supabase client wired for 2 tables only (`users`, ad-hoc counts); no migrations for any table exist in-repo |
| Basic API structure ✔ | Only `/api/auth/*` (register, login) and `/api/dashboard/stats` exist |

---

## 2. Completed Modules (verified working, end-to-end)

| Module | Status | Evidence |
|---|---|---|
| Project scaffold (frontend/backend/shared) | ✅ Done | `frontend/`, `backend/`, `shared/` all build-able via Vite/ts-node-dev |
| User registration | ✅ Done | `POST /api/auth/register` — bcrypt hash, Supabase insert, duplicate-email check |
| User login | ✅ Done | `POST /api/auth/login` — bcrypt compare, JWT issuance |
| Route protection (frontend) | ✅ Done | `ProtectedRoute.tsx` redirects unauthenticated users |
| JWT middleware (backend) | ✅ Done | `requireAuth` validates Bearer token |
| Theme (dark/light) toggle | ✅ Done | `ThemeContext.tsx`, persisted to `localStorage` |
| Dashboard shell / sidebar layout | ✅ Done | `DashboardLayout.tsx` — nav, header, search bar (UI only) |

---

## 3. Incomplete / Stub Modules

| Module | Status | Evidence |
|---|---|---|
| Dashboard stats | 🟡 Broken | `dashboard.controller.ts` reads `req.user?.id`, but the JWT payload only contains `userId` — this field is always `undefined`, so stats silently return 0/error |
| Collections | 🟡 UI stub only | Sidebar link exists; route renders `"Collections — coming in Phase 4"` |
| Bookmarks | 🟡 UI stub only | Sidebar link exists; route renders `"Bookmarks — coming in Phase 4"` |
| Tags | 🟡 UI stub only | Same placeholder pattern |
| Settings | 🟡 UI stub only | Renders `"Settings — coming soon"` |
| Search bar | 🟡 Decorative | Input renders in header; no `onChange`, no API call, no results view |
| `shared/index.ts` | 🟡 Unused | Defines one `User` interface; not imported by frontend or backend anywhere |

---

## 4. Missing APIs

None of these exist as routes, controllers, or use cases:

- `POST /api/bookmarks`, `GET /api/bookmarks`, `GET /api/bookmarks/:id`, `PATCH /api/bookmarks/:id`, `DELETE /api/bookmarks/:id`
- `POST /api/collections`, `GET /api/collections`, `PATCH /api/collections/:id`, `DELETE /api/collections/:id`
- `POST /api/collections/:id/members` (invite/role update/remove)
- `POST /api/tags`, `GET /api/tags`, `DELETE /api/tags/:id`
- `GET /api/search`
- `POST /api/auth/refresh` (refresh-token endpoint — brief specifies JWT + refresh token, but only access tokens exist today)
- `POST /api/auth/logout` (server-side token invalidation; frontend logout only clears `localStorage`)
- Archive/job endpoints (`POST /api/bookmarks/:id/archive`, status polling)
- Import/export endpoints
- API token management endpoints
- User profile update endpoint

## 5. Missing Database Tables

No SQL migrations exist anywhere in the repo. `DATABASE_SCHEMA.md` documents a schema that has never been
translated into actual migration files. Tables referenced by code but not defined anywhere:

- `users` (implied by auth controller; unclear if created manually in Supabase dashboard)
- `collections`, `collection_members`
- `bookmarks`
- `tags`, `bookmark_tags`
- `archives`
- `annotations`
- `api_tokens`
- `import_jobs`

No RLS policies exist in-repo for any table.

## 6. Missing Frontend Pages

- Collection detail page
- Bookmark detail / reader view
- Search results page
- Tags overview page
- Collection settings (members/permissions)
- Public shared-collection page (unauthenticated)
- API tokens settings page
- Import page
- Real settings/profile page (current one is a placeholder `div`)

## 7. Missing Backend Routes / Middleware

- No rate limiting (brute-force protection on `/auth/login` is absent)
- No request validation middleware (Zod is a frontend dependency only; backend has zero input schema validation — `register`/`login` only check truthiness, not shape)
- No centralized 404 handler (unmatched API routes fall through to the generic error handler with an unhelpful message)
- No refresh-token middleware/rotation logic
- No role/permission middleware (needed once collections support multiple members/roles)
- No request-logging correlation IDs (Morgan logs exist but aren't structured)

## 8. Missing Validation

- Backend accepts any string as `email`/`password` — no format or length checks server-side (frontend has some via `minLength`, but that's trivially bypassed)
- No centralized error-shape contract between frontend and backend beyond `{ error: string }`
- No Zod schemas defined anywhere despite `zod` being a frontend dependency — it's currently unused

## 9. Missing Testing

- `backend`'s `test` script is a literal `echo "Error: no test specified" && exit 1`
- No Vitest config despite being planned in `TODO.md`
- No Playwright config, no E2E tests
- Zero test files exist anywhere in the repository
- No CI workflow (`.github/workflows`) present

## 10. Missing Documentation

- No `.env.example` despite `.gitignore` explicitly carving out an exception for one
- No `CONTRIBUTING.md`
- No API usage examples beyond the spec doc
- `README.md` not present at project root (only `frontend/README.md`, which is the default Vite template)

## 11. Code Quality Issues

- **Duplicate Supabase clients**: `backend/src/config/supabase.ts` and `backend/src/db/supabase.ts` are identical — dead code, confusing for future contributors
- **Dead/misleading UI copy**: `Dashboard.tsx` hardcodes a "Phase 3 Implementation" note describing features ("Secure routing established," etc.) that reads like AI-generated filler rather than real product copy
- **Stray file**: empty `Bash code` file sits at repo root
- **`(req as any).user`** used throughout instead of an extended Express `Request` type — no compile-time safety on the JWT payload shape, which is exactly how the `id` vs `userId` bug slipped through
- Inconsistent casing/quote style between `config/supabase.ts` (double quotes) and `app.ts` (single quotes) — no Prettier config to normalize this

## 12. Security Issues

- **Insecure JWT secret fallback**: `JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt'` — silently runs with a public, guessable default instead of failing startup when the env var is missing
- **No refresh token** despite the brief specifying JWT + refresh token — current tokens are long-lived (1 day) access tokens with no revocation path
- **No rate limiting** on auth endpoints — login/register are open to brute force and account-enumeration timing attacks
- **CORS wide open**: `app.use(cors())` with no origin allowlist
- **No RLS policies** — since no migrations exist, there's no way to confirm row-level security is enforced at the database layer at all; if the service-role key is used for all queries (it is — `SUPABASE_SERVICE_ROLE_KEY`), RLS wouldn't even apply, meaning **all authorization currently depends entirely on the Express layer remembering to filter by `user_id`** — a single missed `.eq("user_id", ...)` in any future controller is a full data leak
- **No password complexity enforcement server-side** — only client-side `minLength={8}`

## 13. Performance Notes (early-stage, low severity right now)

- `Promise.all` used correctly in `dashboard.controller.ts` — good pattern to keep
- No pagination anywhere yet (moot until bookmark/collection list endpoints exist, but worth designing in from the start rather than retrofitting)
- No caching headers / ETags on any response

---

## 14. Recommended Order of Operations (Phases 2+)

1. Fix the two live bugs first (`userId` mismatch, JWT secret fallback) — cheap, unblocks real dashboard data
2. Write actual SQL migrations for `users`, `collections`, `bookmarks`, `tags` + RLS policies (Phase 4 work, but should move earlier — everything else depends on it)
3. Build bookmarks CRUD end-to-end (backend use cases → routes → frontend page) — this is the core product surface, currently 0% real
4. Build collections CRUD end-to-end
5. Add backend Zod validation + centralized error handling
6. Add refresh-token flow
7. Then proceed to search/tags/import-export/extension/activity-log per the original phase plan

---

*This report reflects the codebase as of the upload in this conversation. If you can share the actual GitHub
repo (correct URL, or make it accessible), I'll re-audit against that and reconcile any differences.*
