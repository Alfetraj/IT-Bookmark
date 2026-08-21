# IT-Bookmark

<div align="center">

**A self-hosted, open-source bookmark manager, web archiver, and collaborative knowledge hub.**

[![Version](https://img.shields.io/badge/version-1.0.0--stable-blue.svg)](./docs/CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](./docker-compose.prod.yml)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Self-Hosting](#-self-hosting) • [Documentation](#-documentation)

</div>

---

## 🌟 Overview

**IT-Bookmark** is a privacy-first, self-hostable bookmarking and digital archiving platform engineered for developers, power users, and teams. Built with functional parity to **Linkwarden 2.16.1** in mind, it preserves your digital trail against link rot by automatically capturing screenshots, PDFs, and clean readable text for every URL you save.

---

## ✨ Features

- 📑 **Comprehensive Bookmark Management**
  - Instant URL metadata extraction (title, description, favicon, OpenGraph image).
  - Nestable collections with color-coding and icons.
  - Tag management with multi-tag filtering.
  - Quick filters: Favorites, Read Later, and Archive.
- 💾 **Automated Multi-Format Web Archiving**
  - **Headless Chromium Worker (Playwright)**: Full-page high-resolution screenshot captures.
  - **Vector PDF Generation**: High-fidelity printable document archives.
  - **Reader View (Mozilla Readability)**: Distraction-free article reader mode with typography controls.
- 📡 **Automated RSS Feed Ingestion**
  - Subscribe to any RSS/Atom feed and route new posts automatically into specific collections.
  - Built-in DNS-level SSRF protection blocking loopback and private CIDRs.
  - Scheduled feed polling via asynchronous PostgreSQL-backed job queue (`pg-boss`).
- 👥 **Collaboration & Public Sharing**
  - Granular collection collaboration with Viewer and Editor role management.
  - Cryptographic one-click public share links (`/shared/:token`) for read-only guest browsing.
- 🔄 **Universal Import & Export**
  - Import bookmarks from Netscape HTML format (Chrome, Firefox, Safari, Edge) and Pocket HTML.
  - Export full data to JSON or Netscape HTML bookmark standards.
- 🔍 **Full-Text & Domain Search**
  - Fast search across titles, descriptions, domains, and extracted article text.
- 🛡️ **Enterprise-Grade Security**
  - SSRF protection on all external requests (RSS and bookmark scrapers).
  - Rate limiting on API endpoints and authentication routes.
  - Hardened HTTP security headers (`Helmet`, custom CSP, CORS protection).

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, SCSS Modules | High-performance SPA with modern UI/UX |
| **Backend** | Node.js, Express, TypeScript | REST API server with layered Clean Architecture |
| **Queue / Workers** | `pg-boss` (PostgreSQL job queue) | Asynchronous web archiving & scheduled RSS polling |
| **Archival Engine** | Playwright (Chromium), Readability.js, JSDOM | Screenshots, PDFs, and text extraction |
| **Database & Storage** | PostgreSQL, Supabase Auth & Storage | Relational data persistence and asset storage |
| **Containerization** | Docker, Docker Compose, Nginx | Multi-stage production container images |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Docker & Docker Compose** (optional for local database)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/it-bookmark.git
cd it-bookmark
npm install
```

### 2. Configure Environment Variables

Copy the example configuration files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Ensure your `backend/.env` contains your Supabase or PostgreSQL credentials.

### 3. Run Development Servers

```bash
# Starts both frontend (port 5173) and backend (port 3000) concurrently
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🐳 Self-Hosting

Deploy IT-Bookmark on any Linux VPS or server using Docker Compose:

```bash
# Start production stack with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build
```

For complete VPS setup, Nginx reverse proxy configuration, SSL with Let's Encrypt, and database backups, see the **[Self-Hosting Guide](./docs/SELF_HOSTING.md)**.

---

## 📚 Documentation

- 📖 **[Architecture Guide](./docs/ARCHITECTURE.md)**: Deep dive into the clean architecture and job queue model.
- 🗄️ **[Database Schema](./docs/DATABASE_SCHEMA.md)**: PostgreSQL schemas, tables, and RLS policies.
- 🌐 **[API Specification](./docs/API_SPEC.md)**: Complete REST API documentation.
- ⚖️ **[Linkwarden Parity Matrix](./docs/LINKWARDEN-2.16.1-COMPARISON.md)**: Comparison with Linkwarden 2.16.1.
- 🗺️ **[Project Roadmap](./docs/ROADMAP.md)**: Future phases (Annotations, Browser Extensions, Mobile App, AI).
- 🔒 **[Security Policy](./docs/SECURITY.md)**: Security practices and reporting vulnerabilities.

---

## 🧪 Testing

Run the automated backend test suite:

```bash
cd backend
npm test
```

---

## 📄 License

This project is licensed under the MIT License.
