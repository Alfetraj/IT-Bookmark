# IT Bookmark — API Specification

> **Version**: v1  
> **Base URL**: `https://your-domain.com/api/v1`  
> **Format**: REST / JSON  
> **Auth**: Bearer token (Supabase JWT or Personal API Token)  
> **Content-Type**: `application/json`  
> **OpenAPI Version**: 3.1.0  
> **Last Updated**: 2026-07-14

---

## 1. Authentication

### Headers

All authenticated endpoints require:

```
Authorization: Bearer <access_token>
```

Token can be either:
1. **Supabase JWT** — obtained via Supabase Auth login flow
2. **Personal API Token** — prefixed `itbm_` created in user settings

### Auth Endpoints

#### POST `/auth/register`
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "john_doe"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "john_doe"
    },
    "access_token": "eyJ...",
    "refresh_token": "..."
  }
}
```

---

#### POST `/auth/login`
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

---

#### POST `/auth/refresh`
Refresh an expired access token.

**Request Body**:
```json
{
  "refresh_token": "..."
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "expires_in": 3600
  }
}
```

---

#### POST `/auth/logout`
Invalidate the current session.

**Response** `204 No Content`

---

## 2. Bookmarks

### GET `/bookmarks`
Get all bookmarks for the authenticated user (paginated).

**Query Parameters**:
| Param | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | null | Cursor for pagination (bookmark ID) |
| `limit` | integer | 20 | Items per page (max: 100) |
| `collection_id` | UUID | null | Filter by collection |
| `tag` | string[] | null | Filter by tag slug(s) — repeatable |
| `domain` | string | null | Filter by domain |
| `is_read` | boolean | null | Filter read/unread |
| `is_starred` | boolean | null | Filter starred |
| `archive_status` | string | null | `pending\|processing\|done\|failed` |
| `sort` | string | `created_at` | `created_at\|updated_at\|title\|domain` |
| `order` | string | `desc` | `asc\|desc` |
| `q` | string | null | Full-text search query |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "url": "https://github.com/example/repo",
        "title": "Example Repository",
        "description": "An example GitHub repo",
        "favicon_url": "https://storage.supabase.co/...",
        "og_image_url": "https://opengraph.githubassets.com/...",
        "domain": "github.com",
        "is_read": false,
        "is_starred": true,
        "reading_time": 5,
        "archive_status": "done",
        "collection_id": "uuid",
        "tags": [
          { "id": "uuid", "name": "typescript", "color": "#3178c6", "slug": "typescript" }
        ],
        "created_at": "2026-07-14T12:00:00Z",
        "updated_at": "2026-07-14T12:05:00Z"
      }
    ],
    "next_cursor": "uuid-of-last-item",
    "has_more": true,
    "total": 342
  }
}
```

---

### POST `/bookmarks`
Create a new bookmark.

**Request Body**:
```json
{
  "url": "https://github.com/example/repo",
  "collection_id": "uuid",
  "title": "Optional override title",
  "description": "Optional override description",
  "notes": "# My notes\n\nMarkdown supported",
  "tag_ids": ["uuid1", "uuid2"],
  "is_starred": false,
  "archive": true
}
```

**Validation**:
- `url` — required, valid URL format
- `collection_id` — optional, must belong to user or be a member collection
- `archive` — optional, boolean (default: `true` if user preference enabled)

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://github.com/example/repo",
    "title": "example/repo",
    "description": "Fetched from OG meta",
    "archive_status": "pending",
    ...
  }
}
```

**Error** `409 Conflict` (duplicate URL):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_BOOKMARK",
    "message": "This URL has already been saved",
    "data": { "existing_id": "uuid" }
  }
}
```

---

### GET `/bookmarks/:id`
Get a single bookmark with all details.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "...",
    "title": "...",
    "description": "...",
    "notes": "...",
    "author": "Jane Doe",
    "published_at": "2026-07-10T00:00:00Z",
    "reading_time": 8,
    "word_count": 1640,
    "domain": "github.com",
    "is_read": false,
    "is_starred": false,
    "archive_status": "done",
    "metadata": {
      "language": "en",
      "site_name": "GitHub",
      "content_type": "article"
    },
    "collection": {
      "id": "uuid",
      "name": "TypeScript Resources",
      "color": "#3178c6"
    },
    "tags": [...],
    "archives": [
      { "format": "screenshot", "url": "https://...", "status": "done" },
      { "format": "pdf", "url": "https://...", "status": "done" },
      { "format": "readability", "url": "https://...", "status": "done" }
    ],
    "annotations": [
      {
        "id": "uuid",
        "type": "highlight",
        "selected_text": "TypeScript is a typed superset",
        "note": "Key definition",
        "color": "#FBBF24",
        "created_at": "2026-07-14T12:10:00Z"
      }
    ],
    "created_at": "2026-07-14T12:00:00Z",
    "updated_at": "2026-07-14T12:05:00Z"
  }
}
```

---

### PATCH `/bookmarks/:id`
Update a bookmark's metadata.

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "notes": "Updated notes",
  "collection_id": "new-collection-uuid",
  "is_read": true,
  "is_starred": false,
  "tag_ids": ["uuid1", "uuid3"]
}
```

**Response** `200 OK`: Updated bookmark object

---

### DELETE `/bookmarks/:id`
Soft-delete a bookmark.

**Response** `204 No Content`

---

### POST `/bookmarks/:id/archive`
Manually trigger re-archiving of a bookmark.

**Response** `202 Accepted`:
```json
{
  "success": true,
  "data": { "archive_status": "pending" }
}
```

---

### GET `/bookmarks/:id/readability`
Get the extracted readable text content for reader view.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "title": "Article title",
    "content": "<article>...</article>",
    "text_content": "Plain text version...",
    "reading_time": 8,
    "word_count": 1640
  }
}
```

---

## 3. Collections

### GET `/collections`
Get all collections for the authenticated user (own + joined).

**Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TypeScript Resources",
      "slug": "typescript-resources",
      "description": "All things TS",
      "icon": "📘",
      "color": "#3178c6",
      "visibility": "private",
      "bookmark_count": 42,
      "parent_id": null,
      "role": "owner",
      "member_count": 3,
      "sub_collections": [
        { "id": "uuid", "name": "Official Docs", "bookmark_count": 5 }
      ],
      "created_at": "2026-07-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/collections`
Create a new collection.

**Request Body**:
```json
{
  "name": "React Resources",
  "description": "All React-related links",
  "icon": "⚛️",
  "color": "#61dafb",
  "parent_id": null,
  "visibility": "private"
}
```

**Response** `201 Created`: Created collection object

---

### GET `/collections/:id`
Get collection details with members.

**Response** `200 OK`: Full collection object with `members` array

---

### PATCH `/collections/:id`
Update collection metadata.

**Authorization**: Owner or Editor role

**Request Body** (all optional): name, description, icon, color, visibility

**Response** `200 OK`: Updated collection object

---

### DELETE `/collections/:id`
Delete a collection.

**Authorization**: Owner only

**Query Parameters**:
| Param | Type | Description |
|---|---|---|
| `bookmark_action` | string | `delete` or `unassign` (default: `unassign`) |

**Response** `204 No Content`

---

### GET `/collections/:id/members`
Get all members of a collection.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "...",
      "role": "editor",
      "accepted_at": "2026-07-10T00:00:00Z"
    }
  ]
}
```

---

### POST `/collections/:id/members`
Invite a user to collaborate.

**Authorization**: Owner only

**Request Body**:
```json
{
  "email": "collaborator@example.com",
  "role": "editor"
}
```

**Response** `201 Created`

---

### PATCH `/collections/:id/members/:userId`
Update a member's role.

**Authorization**: Owner only

**Request Body**:
```json
{ "role": "viewer" }
```

**Response** `200 OK`

---

### DELETE `/collections/:id/members/:userId`
Remove a member or leave a collection.

**Response** `204 No Content`

---

### POST `/collections/:id/share`
Generate or regenerate the share link token.

**Authorization**: Owner only

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "share_token": "abc123xyz",
    "share_url": "https://your-domain.com/public/username/typescript-resources"
  }
}
```

---

### DELETE `/collections/:id/share`
Revoke the share link.

**Response** `204 No Content`

---

## 4. Tags

### GET `/tags`
Get all tags for the authenticated user.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "typescript",
      "slug": "typescript",
      "color": "#3178c6",
      "bookmark_count": 28,
      "created_at": "..."
    }
  ]
}
```

---

### POST `/tags`
Create a new tag.

**Request Body**:
```json
{
  "name": "react",
  "color": "#61dafb"
}
```

**Response** `201 Created`

---

### PATCH `/tags/:id`
Update a tag.

**Request Body**: `name`, `color` (optional)

**Response** `200 OK`

---

### DELETE `/tags/:id`
Delete a tag (removes from all bookmarks).

**Response** `204 No Content`

---

## 5. Annotations

### GET `/bookmarks/:bookmarkId/annotations`
Get all annotations for a bookmark.

**Response** `200 OK`: Array of annotation objects

---

### POST `/bookmarks/:bookmarkId/annotations`
Create a highlight or note.

**Request Body**:
```json
{
  "type": "highlight",
  "selected_text": "TypeScript is a typed superset of JavaScript",
  "note": "This is the key definition",
  "color": "#FBBF24",
  "position": {
    "start_offset": 1234,
    "end_offset": 1280,
    "xpath": "/html/body/article/p[2]",
    "quote_context": "...surrounding text..."
  }
}
```

**Response** `201 Created`

---

### PATCH `/bookmarks/:bookmarkId/annotations/:annotationId`
Update an annotation's note or color.

**Request Body**: `note`, `color` (optional)

**Response** `200 OK`

---

### DELETE `/bookmarks/:bookmarkId/annotations/:annotationId`
Delete an annotation.

**Response** `204 No Content`

---

## 6. Search

### GET `/search`
Full-text search across bookmarks.

**Query Parameters**:
| Param | Type | Description |
|---|---|---|
| `q` | string | **Required.** Search query |
| `cursor` | string | Pagination cursor |
| `limit` | integer | Results per page (default 20) |
| `collection_id` | UUID | Scope to collection |
| `tag` | string[] | Filter by tags |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "next_cursor": "...",
    "has_more": false,
    "total": 12,
    "query_time_ms": 8
  }
}
```

---

## 7. Import / Export

### POST `/import`
Upload and import bookmarks from a file.

**Content-Type**: `multipart/form-data`

**Form Fields**:
| Field | Type | Description |
|---|---|---|
| `file` | file | The import file |
| `source` | string | `browser_html\|pocket\|raindrop\|linkwarden\|csv` |
| `collection_id` | UUID | Optional. Target collection for imported bookmarks |

**Response** `202 Accepted`:
```json
{
  "success": true,
  "data": {
    "import_job_id": "uuid",
    "status": "pending"
  }
}
```

---

### GET `/import/:jobId`
Get the status of an import job.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "processing",
    "total_items": 450,
    "processed_items": 120,
    "failed_items": 3,
    "created_at": "...",
    "completed_at": null
  }
}
```

---

### GET `/export`
Export all bookmarks.

**Query Parameters**:
| Param | Type | Description |
|---|---|---|
| `format` | string | `json\|csv\|markdown` (default: `json`) |
| `collection_id` | UUID | Export specific collection |

**Response** `200 OK`: File download (appropriate Content-Type header)

---

## 8. User / Profile

### GET `/me`
Get the authenticated user's profile.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "...",
    "bio": "Developer and reader",
    "preferences": {
      "theme": "dark",
      "default_view": "grid",
      "ai_tagging_enabled": false,
      "archive_enabled": true
    },
    "created_at": "..."
  }
}
```

---

### PATCH `/me`
Update profile.

**Request Body** (all optional): `username`, `display_name`, `bio`, `preferences`

**Response** `200 OK`

---

### POST `/me/avatar`
Upload avatar image.

**Content-Type**: `multipart/form-data`  
**Field**: `avatar` (image file, max 2MB, JPEG/PNG/WebP)

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { "avatar_url": "https://storage.supabase.co/..." }
}
```

---

## 9. API Tokens

### GET `/me/tokens`
List all personal API tokens.

**Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Browser Extension",
      "last_used": "2026-07-14T10:00:00Z",
      "expires_at": null,
      "scopes": ["bookmarks:read", "bookmarks:write"],
      "created_at": "..."
    }
  ]
}
```

---

### POST `/me/tokens`
Create a new API token.

**Request Body**:
```json
{
  "name": "Browser Extension",
  "scopes": ["bookmarks:read", "bookmarks:write"],
  "expires_at": null
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Browser Extension",
    "token": "itbm_a1b2c3d4e5f6...",
    "scopes": ["bookmarks:read", "bookmarks:write"]
  },
  "notice": "This token will only be shown once. Store it securely."
}
```

---

### DELETE `/me/tokens/:id`
Revoke an API token.

**Response** `204 No Content`

---

## 10. Public Endpoints (No Auth Required)

### GET `/public/:username/:slug`
Get a publicly shared collection.

**Response** `200 OK`: Collection with bookmarks (paginated)

---

### GET `/health`
Health check endpoint.

**Response** `200 OK`:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "queue": "connected",
  "timestamp": "2026-07-14T12:00:00Z"
}
```

---

## 11. Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "request_id": "uuid"
  }
}
```

### Standard Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body/params fail Zod validation |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | Authenticated but insufficient permissions |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., duplicate URL) |
| 413 | `PAYLOAD_TOO_LARGE` | File upload exceeds size limit |
| 422 | `UNPROCESSABLE` | Logically invalid request |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | Database or queue unreachable |

---

## 12. Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth endpoints (`/auth/*`) | 10 requests | 15 minutes |
| Write endpoints (POST/PATCH/DELETE) | 200 requests | 1 minute |
| Read endpoints (GET) | 500 requests | 1 minute |
| Import endpoint | 5 requests | 1 hour |
| Export endpoint | 10 requests | 1 hour |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1720958460
```

---

## 13. Token Scopes

| Scope | Description |
|---|---|
| `bookmarks:read` | Read bookmarks and archives |
| `bookmarks:write` | Create, update, delete bookmarks |
| `collections:read` | Read collections and members |
| `collections:write` | Create, update, delete collections |
| `tags:read` | Read tags |
| `tags:write` | Create, update, delete tags |
| `annotations:read` | Read annotations |
| `annotations:write` | Create, update, delete annotations |
| `import` | Upload and trigger import jobs |
| `export` | Download data exports |
| `profile:read` | Read user profile |
| `profile:write` | Update user profile |

---

## 14. Pagination

IT Bookmark uses **cursor-based pagination** (not offset) for performance:

```
GET /bookmarks?limit=20&cursor=<last_item_id>

Response:
{
  "data": {
    "items": [...],
    "next_cursor": "uuid-of-last-item",
    "has_more": true,
    "total": 342
  }
}
```

- `cursor` = the `id` of the last item received
- `next_cursor` = pass this as `cursor` in the next request
- `has_more` = `false` means you've reached the end
- `total` = approximate total count (not updated on every page)
