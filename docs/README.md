# IT Bookmark

> **Version**: 1.0.0-alpha
> **Status**: Pre-Development / Documentation Phase

**IT Bookmark** is a full-stack, self-hostable bookmark and knowledge management application designed for IT professionals, developers, and knowledge workers who demand precision, speed, and control over their digital reading workflows.

It is **not** a simple bookmarking tool. It is a **personal and team knowledge archive** — combining the best concepts from read-it-later apps, web archiving, collaborative note-taking, and AI-assisted organization into a single, clean, opinionated system.

## 🚀 Core Philosophy

1. **Preservation First** — A bookmark that can disappear is not a bookmark. Every link saved is archived in multiple formats (screenshot, PDF, readable text).
2. **Speed Over Everything** — Adding a bookmark must be frictionless (≤ 2 clicks or keystrokes).
3. **Clean Architecture** — Business logic is infrastructure-agnostic and fully testable.
4. **Privacy-First** — No telemetry, no ads, no tracking by default. Self-hostable with Supabase.
5. **Team-Ready** — Designed from day 1 to support multi-user collaboration, sharing, and permission control.
6. **AI-Augmented, Not AI-Dependent** — AI features are optional enhancements, not requirements.

## 🛠 Tech Stack

### Frontend
- **React 19**
- **Vite**
- **TypeScript**

### Backend
- **Node.js**
- **Express**
- **TypeScript**

### Database & Infrastructure
- **Supabase** (Managed PostgreSQL with Auth, Realtime, Storage)
- **Supabase Storage** (Archive files: PDFs, screenshots, HTML snapshots)
- **Supabase Auth** (OAuth, magic links, JWTs)

## 📁 Repository Structure

The project is structured as a monorepo using npm workspaces:

```text
it-bookmark/
├── backend/                  # Express + Node.js backend
├── frontend/                 # React 19 + Vite frontend
├── shared/                   # Shared TypeScript types & contracts
├── docs/                     # Documentation directory
├── docker-compose.yml        # Self-hosting stack
├── package.json              # Workspace configuration
└── README.md
```

## 📚 Documentation

Detailed documentation is available in the root directory:

- [Project Context](./PROJECT_CONTEXT.md)
- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Specification](./API_SPEC.md)
- [Feature Matrix](./FEATURE_MATRIX.md)
- [Roadmap](./ROADMAP.md)
- [Progress](./PROGRESS.md)
- [Changelog](./CHANGELOG.md)

## 💻 Getting Started

Currently in the documentation and pre-development phase. You can spin up the development environment using npm workspaces:

### Requirements
- Node.js 20 LTS minimum
- Docker & Docker Compose (for self-hosting/database)

### Development

```bash
# Install dependencies across all workspaces
npm install

# Run both frontend and backend development servers concurrently
npm run dev
```

### Self-Hosting (Docker)

```bash
# Start the application stack
docker-compose up -d
# or via npm script
npm run start
```
