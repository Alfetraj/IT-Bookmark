# Phase 5: Real Dashboard
**Subsystem**: Dashboard

## 1. Linkwarden Reference Implementation
- **Data Model**: The user can arrange "Dashboard Sections" on their dashboard. Types include:
  - `STATS`: Total Links, Collections, Tags, Pinned Links.
  - `RECENT_LINKS`: Last N links added by the user.
  - `PINNED_LINKS`: Links that the user has explicitly pinned.
  - `COLLECTION`: A specific collection pinned to the dashboard.
- **API**: A single `/api/v1/dashboardData` endpoint fetches the sections, the stats, the recent links, pinned links, and any links for the pinned collections.

## 2. IT-Bookmark Status
- **Backend**: We have `dashboard_sections` table via Phase 2 migration. We currently only have a generic `/dashboard/stats` endpoint.
- **Frontend**: A generic hardcoded UI in `Dashboard.tsx`.

## 3. Decision
- **ADAPT**: We will implement `GET /api/v1/dashboard` in `dashboard.controller.ts`.
- The endpoint will query:
  1. User's dashboard sections. If none exist, it will create default ones (`STATS`, `RECENT_LINKS`, `PINNED_LINKS`).
  2. Aggregated stats.
  3. Recent bookmarks (limit 5).
  4. Pinned bookmarks.
  5. Links for any `COLLECTION` dashboard sections.
- The frontend `Dashboard.tsx` will be refactored to iterate through the returned `sections` array and render a `DashboardSection` component for each, passing in the relevant data.
- Note: Pinned links requires a `pinnedBy` concept in Linkwarden. In IT-Bookmark, we use `is_favorite`. We will map "pinned" to `is_favorite` for bookmarks.

## 4. Execution Plan
- Update `backend/src/controllers/dashboard.controller.ts`.
- Update `backend/src/routes/dashboard.routes.ts`.
- Update frontend `dashboard.service.ts` and `useDashboardStats.ts`.
- Refactor `Dashboard.tsx` and create `DashboardSection.tsx` and `DashboardLinks.tsx` components.
