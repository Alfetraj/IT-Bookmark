# Phase 3: Bookmarks & Collections Polish
**Subsystem**: Collections & Bookmark Detail UI

## 1. Linkwarden Reference Implementation
- **Source**: `apps/web/components/CollectionCard.tsx`, `apps/web/components/CollectionListing.tsx`
- **Execution Path**: React component renders a gradient card, utilizing `_count.links` for totals, and a dropdown menu for inline Edit/Delete/Share actions.
- **Database**: Pulls from `Collection` model with `members` relation and `links` count.
- **Security Controls**: Role checks via `usePermissions(collection.id)` hook (Owner/Editor/Viewer) to conditionally render Edit/Delete buttons.

## 2. IT-Bookmark Status
- We have `CollectionCard.tsx` in `frontend/src/modules/collections/components/`.
- It currently displays the title, custom colors, date, and edit/delete icons on hover.
- It lacks: member avatars, exact Linkwarden gradient styling (diagonal 45deg fade), explicit `_count.links` (the API might not return it yet), and public icon visibility.

## 3. Decision
- **ADAPT**: We will adapt Linkwarden's visual cues (gradient `45deg` fade, member avatars layout, and the clean dropdown menu) into our `CollectionCard.tsx`.
- We will update the backend `getCollections` endpoint to ensure it includes the `_count: { bookmarks: true }` field, matching Linkwarden's data payload.
- We will update our TypeScript interfaces in `shared/src/types` to support `icon`, `icon_weight`, and `bookmarkCount`.

## 4. Implementation Steps
1. Update `shared/src/types/collection.ts`.
2. Update Backend repository `src/infrastructure/database/supabase.collection.repository.ts` to include `count: 'exact'` or similar for bookmarks.
3. Update `CollectionCard.tsx` frontend styles and markup.
4. Test rendering and permissions logic.
