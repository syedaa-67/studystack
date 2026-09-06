# 📚 StudyStack

### The all-in-one, real-time, AI-powered collaborative study platform.

**Live App:** https://studystack-seven.vercel.app
**API:** https://studystack-z2b3.onrender.com

StudyStack isn't just another to-do list bolted onto a chat app — it's a **full-stack, production-deployed, real-time collaborative study ecosystem**, built from scratch with a custom FastAPI + SQLModel backend and a React/Vite/TypeScript frontend, engineered to help student groups actually get work done together instead of just talking about it.

---

## ✨ Features

### 🧑‍🤝‍🧑 Group Collaboration
- Create/join study groups, manage members with role-based permissions (owner vs member)
- Group Detail pages with live member lists, resource sharing, and task/deadline tracking
- Per-member contribution tracking — see exactly who's completed what on shared project tasks, visible to group admins

### ⏱️ Real-Time Presence & Pomodoro
- Live WebSocket-powered presence system — see who's actively studying with you, right now
- Synchronized group Pomodoro timers so your whole squad can grind in lockstep

### 🤖 App-Wide AI Assistant (Gemini-powered)
- A persistent, context-aware AI chat assistant available across **all 4 group tabs** — not just a single dashboard widget
- Built on a dedicated `/ai/assistant` backend endpoint that understands what group/tab you're in and responds accordingly
- Evolved from an earlier "Live Dashboard only" resource summarizer into a true full-app assistant

### 📊 Analytics Dashboard
- Visual breakdowns of study activity, progress, and engagement using Recharts
- Calendar view with grid-aligned month pills, weekday labels, and "today" highlighting

### 🏆 Gamification & Leaderboards
- Points, badges, and leaderboards to keep the competitive spirit (and the actual studying) alive

### 🔐 Auth, Security & Versioning
- Full JWT-based auth system with a dedicated `User` table separate from group membership
- Resource versioning via a dedicated `ResourceVersion` table — never lose an old draft again
- Role-based access control across groups

### 🎨 Dual-Theme UI
- A hand-built dark glassmorphism theme AND a light "bento" color-block theme, fully CSS-variable driven and toggleable app-wide
- Fully responsive — dashboard, group pages, and calendar all rebuilt from hardcoded grids into true responsive layouts, with fixed mobile overflow, fixed clipping notification dropdowns, and consistent padding across every page

### 🚀 DevOps & Deployment
- Dockerized backend, deployed live on Render
- Frontend deployed on Vercel with SPA routing fallback
- Full CI/CD via GitHub Actions — backend pytest suite (14 tests) and frontend build both gate the Docker deploy job, so broken code never ships
- Environment-based secrets management (Gemini API key, JWT secret) with rotation practices in place

---

## 🛠️ Tech Stack

**Backend:** FastAPI, SQLModel, WebSockets, Gemini API, Docker, Pytest
**Frontend:** React, Vite, TypeScript, Recharts, CSS variables (dual-theme engine)
**Infra:** Render (backend, Dockerized), Vercel (frontend), GitHub Actions (CI/CD)

---

## 🧠 How It Was Built

StudyStack was built iteratively, feature-by-feature, with a strict engineering discipline:
- Every roadmap item (group pages → real-time presence → analytics → AI → RBAC/versioning → gamification → CI/CD/deployment) was built, tested, and verified end-to-end before moving to the next
- All 31 TypeScript errors across the codebase were triaged by root cause and eliminated — type-only imports, stale theme state, mismatched chart types — until `tsc -b --noEmit` passed clean
- Deploy-blocking encoding bugs (UTF-16/BOM corruption silently breaking Vite/PostCSS builds) were traced and fixed at the byte level
- Full CI pipeline enforces that tests and builds pass *before* any Docker deploy — no more shipping broken builds
- Mobile responsiveness was treated as a first-class citizen, not an afterthought — every page audited and fixed for overflow, padding, and clipping issues

---

## ⚠️ Known Limitations

- Render's free tier has no persistent disk — the database resets on every redeploy. Postgres migration is the next major infra milestone.

---

## 🗺️ Roadmap

- [x] Group detail pages
- [x] Real-time presence + Pomodoro (WebSockets)
- [x] Analytics dashboard
- [x] AI-powered assistant (Gemini)
- [x] RBAC + resource versioning + background jobs
- [x] Gamification + leaderboards
- [x] Docker + tests + CI + deployment
- [ ] Migrate SQLite → Postgres for persistent data
- [ ] Toast-based validation error UI

---

Built solo, end-to-end — backend, frontend, infra, and AI integration — as a real, deployed, actively-used product, not a toy project.