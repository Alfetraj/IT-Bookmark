# Background Worker Architecture

IT-Bookmark utilizes a PostgreSQL-backed job queue for handling heavy, asynchronous background tasks (such as web archiving). We specifically avoid Redis to keep the infrastructure footprint minimal.

## 1. Job Queue Library
We use **pg-boss** as our job queue engine. It runs on top of our existing Supabase PostgreSQL instance and provides robust features natively:
- Concurrent job execution
- Automatic retries with backoff
- Dead-letter queues for failed jobs
- Cron-style scheduling (used for RSS polling)

## 2. Independent Logical Queues
Different background operations must remain entirely independent. We utilize the following specific logical queues:
- `bookmark.archive`: Handles the Playwright heavy lifting (Screenshot, PDF, Readability).
- `bookmark.index`: Pushes the extracted readability text into the PostgreSQL full-text search index.
- `bookmark.ai-tag`: Asynchronously fetches AI-suggested tags.
- `rss.poll`: Cron-based queue to fetch new links.
- `import.process`: Handles large batch Netscape HTML imports.
- `export.process`: Generates large JSON/HTML zip archives.

**Failure Isolation:**
- The failure of AI tagging MUST NEVER mark the archive processing as failed.
- The failure of search indexing MUST NEVER destroy the archived bookmark.
- RSS failures MUST NOT impact normal bookmark creation.

## 3. Archive Job States
Jobs follow explicit states:
`pending` -> `processing` -> `success` / `failed` (or `retrying` / `partial_success` where applicable).

Metrics tracked per job:
- `attempt_count`
- `last_error`
- `worker_id`
- `locked_at`
- `started_at`
- `completed_at`

## 4. Playwright Browser Lifecycle
Playwright must NOT be run blindly inside standard Express request handlers. It is strictly confined to the worker process.
- **Resource Management**: Browsers are reused where safe to avoid heavy startup penalties, but rotated/restarted periodically or upon timeout to prevent memory leaks.
- **Limits**: Hard timeouts, response size limits, and concurrency limits are enforced per browser context to prevent resource exhaustion attacks.
