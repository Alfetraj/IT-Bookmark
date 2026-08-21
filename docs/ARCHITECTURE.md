# IT Bookmark — Architecture & Working Principle

This document outlines the true architecture and working principles of the **IT-Bookmark** project as currently implemented. 

## 1. High-Level Architecture
IT Bookmark is a full-stack web application designed for saving, organizing, and archiving webpages.
- **Frontend**: A Single Page Application (SPA) built with **React**, **Vite**, and **TypeScript**.
- **Backend**: A RESTful API server built with **Node.js** and **Express**.
- **Database & Storage**: Powered by **Supabase** (PostgreSQL for relational data, Supabase Storage for archived files).
- **Archiving Engine**: A custom background worker running inside the Node.js backend using **Playwright** and **Mozilla Readability**.

---

## 2. Data Persistence & Schema
While Supabase is used as the database, IT-Bookmark implements a custom schema architecture rather than relying entirely on Supabase's built-in features:
- **Custom Authentication (`public.users`)**: Instead of using Supabase Auth (`auth.users`), the app uses a custom `users` table in the `public` schema. User registration and password hashing (using `bcrypt`) are handled entirely by the Express backend.
- **Entities**: 
  - `bookmarks`: Stores URL, metadata, and archive paths.
  - `collections`: Allows organizing bookmarks into hierarchical folders (with `parent_id`).
  - `tags` & `bookmark_tags`: Enables tagging and categorizing.

---

## 3. Authentication Flow
The application uses a standard stateless JWT (JSON Web Token) authentication flow:
1. **Login/Register**: The user submits credentials to the Express backend (`auth.controller.ts`).
2. **Token Generation**: The backend validates the password and generates a JWT signed with a secret key (`JWT_SECRET`).
3. **Frontend Storage**: The frontend stores this JWT (typically in localStorage) and attaches it as a `Bearer` token to the `Authorization` header of all Axios requests.
4. **API Validation**: Protected Express routes pass through `auth.middleware.ts`, which verifies the JWT and attaches the `user_id` to the request object, ensuring users can only access their own collections and bookmarks.

---

## 4. The Archiving Engine (Working Principle)
Unlike massive enterprise apps that use Redis and BullMQ, IT-Bookmark was specifically designed to run on constrained infrastructure without needing Redis. 

### How Webpages are Archived:
1. **Saving the Bookmark**: When a user adds a bookmark via the frontend, the Express API inserts the record into PostgreSQL with `archive_status = 'pending'`.
2. **In-Memory Worker (`ArchiveWorker`)**: When the Node.js backend starts (`server.ts`), it launches an instance of the `ArchiveWorker`. This worker uses `setInterval` to poll the database every 10 seconds for bookmarks with a `pending` status.
3. **Processing (Playwright)**:
   - The worker launches a headless Chromium browser instance using **Playwright**.
   - It navigates to the target URL and waits for the page to load.
   - It captures a **Screenshot** and a **PDF** of the page.
   - It runs `@mozilla/readability` against the DOM to extract a clean, ad-free "Reader View" version of the article text.
4. **Storage & Database Update**:
   - The generated PDF, screenshot, and HTML text are uploaded to a Supabase Storage bucket (`archives`).
   - The database record is updated with the file paths and `archive_status = 'success'`.
5. **Frontend Refresh**: The React frontend (using React Query) refetches the data, and the user can now view the permanently archived version of the webpage.

---

## 5. Frontend UI/UX Principles
- **State Management**: Uses **TanStack Query (React Query)** for server state (fetching bookmarks, collections) and mutation management. This ensures the UI stays synchronized with the backend.
- **Routing**: **React Router** handles client-side navigation.
- **Styling**: Built with modular SCSS (`.module.scss`) and CSS variables for theming. The design language emphasizes modern, gradient-heavy, glassmorphic elements for a premium feel.
- **Component Structure**: Follows a feature-based module structure (e.g., `src/modules/collections`, `src/modules/bookmarks`), keeping components, hooks, and types neatly organized by domain.
