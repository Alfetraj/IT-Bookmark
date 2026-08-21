# Feature Parity Matrix: IT-Bookmark vs. Linkwarden

| Feature Area | Sub-Feature | Linkwarden Status | IT-Bookmark Status | Target Phase | Notes / Dependencies |
|--------------|-------------|-------------------|--------------------|--------------|----------------------|
| **Auth** | Registration | IMPLEMENTED | IMPLEMENTED | - | Custom Express implementation. |
| | Login | IMPLEMENTED | IMPLEMENTED | - | Custom JWT. |
| | User Preferences | IMPLEMENTED | NOT STARTED | Phase 2 | Needs DB schema updates. |
| | API Keys | IMPLEMENTED | NOT STARTED | Phase 19 | Needs DB schema, auth middleware update. |
| **Collections**| CRUD | IMPLEMENTED | IMPLEMENTED | - | |
| | Nested Hierarchies | IMPLEMENTED | IMPLEMENTED | - | |
| | Tree View | IMPLEMENTED | IMPLEMENTED | - | |
| | Ordering / Sorting | IMPLEMENTED | NOT STARTED | Phase 3 | |
| | Icons & Colors | IMPLEMENTED | IN PROGRESS | Phase 3 | Colors exist, icons needed. |
| | Public / Private | IMPLEMENTED | IMPLEMENTED | - | |
| | Collaboration | IMPLEMENTED | NOT STARTED | Phase 18 | Needs `collection_members` table and roles. |
| **Bookmarks** | CRUD | IMPLEMENTED | IMPLEMENTED | - | |
| | Favorite / Read Later| IMPLEMENTED | IMPLEMENTED | - | |
| | Move to Collection | IMPLEMENTED | NOT STARTED | Phase 3 | |
| | Bookmark Detail Page | IMPLEMENTED | NOT STARTED | Phase 3 | |
| | Tagging | IMPLEMENTED | IN PROGRESS | Phase 4 | Needs UI component for multi-select. |
| **Archiving** | Queue Worker | IMPLEMENTED | IN PROGRESS | Phase 6 | Currently in-memory. Move to Postgres-backed. |
| | Screenshot | IMPLEMENTED | IMPLEMENTED | - | |
| | PDF | IMPLEMENTED | IMPLEMENTED | - | |
| | Readability Text | IMPLEMENTED | IMPLEMENTED | - | |
| | Monolith HTML | IMPLEMENTED | NOT STARTED | Phase 7 | Need to integrate Monolith library or equivalent. |
| | SSRF Protection | IMPLEMENTED | NOT STARTED | Phase 7 | Critical security requirement before prod. |
| **Search** | Full-Text Search | IMPLEMENTED | NOT STARTED | Phase 10 | PostgreSQL `tsvector` implementation. |
| | Metadata Indexing | IMPLEMENTED | NOT STARTED | Phase 10 | |
| **RSS** | Feed Subscription | IMPLEMENTED | NOT STARTED | Phase 14 | Needs cron worker and feed parser. |
| **AI Tagging** | Suggest Tags | IMPLEMENTED | NOT STARTED | Phase 15 | Implement Vercel AI SDK on Express. |
| **Notes & Ann.**| Bookmark Notes | IMPLEMENTED | NOT STARTED | Phase 16 | |
| | Highlights | IMPLEMENTED | NOT STARTED | Phase 16 | Needs text selection offset tracking. |
| **Import/Export**| Netscape HTML Import | IMPLEMENTED | IN PROGRESS | Phase 13 | Make it async/background for large files. |
| | Export to JSON/HTML| IMPLEMENTED | NOT STARTED | Phase 13 | |
| **Dashboard** | Metrics & Stats | IMPLEMENTED | NOT STARTED | Phase 5 | Remove UI placeholders, wire up real data. |
| **Bulk Ops** | Delete/Archive/Move | IMPLEMENTED | NOT STARTED | Phase 12 | |
