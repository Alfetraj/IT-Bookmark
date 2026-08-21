# Security Architecture & Policies

## 1. SSRF Protection (Server-Side Request Forgery)
The Archive Worker processes arbitrary user-supplied URLs. This represents the highest security risk in the application.

**Validation Rules:**
- Do not rely solely on regex or hostname blacklists.
- All URLs must be validated before being passed to Playwright.
- Block the following unconditionally:
  - `localhost`, `127.0.0.1`, and alternative representations (e.g., `0177.0.0.1`, `2130706433`).
  - Private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Private/Link-local IPv6 ranges.
  - Multicast and Broadcast addresses.
  - Cloud metadata endpoints (e.g., `169.254.169.254` for AWS/GCP).
  - Unsafe schemes (`file://`, `javascript:`, `data:`).
  - Non-standard ports (e.g., internal admin ports).

**Redirect Handling:**
- Every redirect must be revalidated against the same rules to prevent DNS rebinding or redirect-to-internal-IP attacks.

**Network-Level Restrictions:**
- Beyond application logic, the worker container should have restricted network egress (e.g., iptables blocking access to private network spaces).

## 2. Browser Security (Archived Content)
Archived HTML is **untrusted content**.
- Preserved HTML MUST NOT be served from the privileged application origin (e.g., `app.example.com`).
- It must be served from a separate content origin or storage delivery strategy (e.g., `usercontent.example.com` or via Supabase Storage public URLs).
- This ensures that if the archived HTML contains malicious JavaScript, it cannot access application cookies, `localStorage`, JWTs, or internal APIs.

## 3. Authorization (IDOR Prevention)
- For every resource request (Bookmarks, Collections, Tags, Notes, Archives, Shares), backend authorization must enforce strict ownership.
- User A must never be able to access User B's resources unless explicitly shared.

## 4. API Key Management
- Raw API keys are never stored. Only hashes are stored in the database.
- Keys must have explicit scopes, expiration, and last-used tracking.

## 5. Secret Management
- Never commit `.env`, credentials, JWT secrets, or Supabase service keys.
- Do not log passwords, tokens, or authorization headers in the application logs.
