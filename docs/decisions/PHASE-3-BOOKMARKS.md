# Phase 3: Bookmarks Detail UI
**Subsystem**: Bookmark Detail Page

## 1. Linkwarden Reference Implementation
- **Source**: `apps/web/components/LinkDetails.tsx`, `apps/web/pages/links/[id].tsx`
- **Execution Path**: A standalone page fetches a single Link. The UI is a centered card with a hero image (screenshot) at the top. Below the image are fields for Name, URL (with copy button), Collection, Tags, and Description. Below that is a list of preserved formats (Webpage, Screenshot, PDF, Readable).
- **Database**: Relies on `links` with `tags` and `collection`.
- **Security Controls**: Edit access checks. SSR applies.

## 2. IT-Bookmark Status
- We have `BookmarkCard.tsx` but no dedicated `BookmarkDetail` page or component.
- The `is_archived` status, `screenshot_path`, `pdf_path`, etc., exist in the database and API but are not well-surfaced.

## 3. Decision
- **ADAPT**: Create `BookmarkDetail.tsx` in `frontend/src/modules/bookmarks/components/`.
- Create a route in `frontend/src/App.tsx` (or equivalent router) for `/bookmarks/:id`.
- The detail view will feature the hero image layout and display the preserved formats clearly.
- Note: The actual preservation worker is Phase 6/7, so for now, the UI will gracefully show placeholders or existing mocked data for the preserved formats.

## 4. Implementation Steps
1. Create `BookmarkDetail.tsx` and `BookmarkDetail.module.scss`.
2. Ensure the frontend router handles `/bookmarks/:id` to render the detail page.
3. Verify it integrates cleanly with the existing `bookmarks` endpoints.
