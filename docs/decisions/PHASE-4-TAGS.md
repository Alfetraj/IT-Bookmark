# Phase 4: Tags
**Subsystem**: Tag Management

## 1. Linkwarden Reference Implementation
- **Features**: Tags can be created, updated, and deleted. They are attached/detached from bookmarks. Each tag is unique to the user (case-insensitive name).
- **Security Controls**: Tag access is bound to the user's scope. 

## 2. IT-Bookmark Status
- **Backend**: `tag.service.ts` already enforces `name` uniqueness per user in application logic.
- **Database**: `supabase_migration.sql` already contains `UNIQUE(name, user_id)` and `UNIQUE(slug, user_id)`.
- **Frontend**: `frontend/src/pages/Tags.tsx`, `TagForm.tsx`, `TagCard.tsx`, and `BookmarkForm.tsx` (for attach/detach) are fully implemented.

## 3. Decision
- The requirements for Phase 4 are fully met by the existing architecture and prior work.
- We will proceed to Phase 5: Real Dashboard.
