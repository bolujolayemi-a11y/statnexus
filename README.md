# StatNexus

AI-powered nursing exam preparation platform. Practice realistic exam simulations across three nursing boards, generate AI study notes, and track your progress over time.

## Features

- **Exam Simulations** — Timed, realistic practice exams for three boards:
  - **NCLEX-RN** (8 clinical categories)
  - **NMCN-RN** (Nursing & Midwifery Council of Nigeria)
  - **UK-NMC-CBT** (Computer Based Test, including OSCE-focused skills)
- **Results & Review** — Score breakdowns, full answer review, and an exam history you can revisit anytime
- **AI Study Notes** — Generate structured, exam-focused study notes for any nursing topic, with:
  - **Persistent search history** — every generated note is saved per-topic so you can reopen, regenerate, or delete past notes
  - Clinical relevance sections, exam tips, and clinical pearls
- **Accounts** — Email/password auth with JWT sessions, email verification, and password reset
- **Progress Tracking** — Dashboard, results history, and a personal profile

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide icons |
| Backend | Express 4 (Node.js), JWT auth, bcryptjs, Nodemailer |
| Database | CockroachDB (PostgreSQL wire protocol via `pg`) |
| AI | Groq API (`groq-sdk`) |
| Deploy | Netlify (static build + serverless function mirror of the API) |

## Project Structure

```
├── src/                  # React frontend (pages, components, hooks, routes)
├── server/               # Express API (local development)
│   ├── migrations/       # SQL migrations (001–004)
│   └── src/              # routes, db, middleware, services
├── netlify/functions/    # api.js — serverless mirror of the Express API
├── netlify.toml          # build + /api/* redirect to the function
└── vite.config.js        # dev server proxies /api → localhost:3003
```

> The Express routes (`server/src/routes/`) and the Netlify function (`netlify/functions/api.js`) intentionally mirror each other — **change both** when adding an endpoint.

## Getting Started

### Prerequisites

- Node.js 18+
- A CockroachDB (or any PostgreSQL) database
- A Groq API key

### 1. Install

```bash
npm install
cd server && npm install && cd ..
```

### 2. Environment

**Root `.env`** (frontend):

```bash
VITE_GROQ_API_KEY=your-groq-api-key
```

**`server/.env`** (API):

# Frontend URL(s) — comma-separated for Netlify + localhost
CLIENT_ORIGIN=http://localhost:5173,https://your-site.netlify.app
APP_URL=https://your-site.netlify.app

# Email (Resend SMTP example — or Gmail, SendGrid, etc.)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
EMAIL_FROM=StatNexus <onboarding@yourdomain.com>

# Set to true to block login until email is verified
REQUIRE_EMAIL_VERIFICATION=false
```

See `server/.env.example` and `.env.example` for templates.

> **Tip:** If your database password contains special characters, percent-encode them in `DATABASE_URL` (e.g. `@` → `%40`).

### 3. Migrate

```bash
cd server && npm run migrate
```

Runs all SQL files in `server/migrations/` (idempotent), creating the schema and the `ai_note_history` table.

### 4. Run

```bash
# Terminal 1 — API on :3003
cd server && npm run dev

# Terminal 2 — frontend on :5173
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:3003`.

## Scripts

**Frontend (root)**

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

**API (`server/`)**

| Command | Description |
|---|---|
| `npm run dev` | Start Express with auto-reload |
| `npm run start` | Start Express |
| `npm run migrate` | Run pending SQL migrations |

## API Overview

All endpoints are prefixed with `/api`.

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me`, `DELETE /auth/account` |
| Profile | `GET /profile`, `PATCH /profile` |
| Test Results | `GET /test-results`, `POST /test-results` |
| AI Notes | `POST /ai-notes/generate`, `POST /ai-notes/classify`, `GET /ai-notes/history`, `GET /ai-notes/history/:id`, `DELETE /ai-notes/history/:id`, `DELETE /ai-notes/history` |

Authenticated endpoints require `Authorization: Bearer <token>`.

## Deployment (Netlify)

- `netlify.toml` builds the frontend (`npm run build` → `dist/`) and redirects `/api/*` to the `api` serverless function.
- Set the same environment variables in your Netlify project (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `APP_URL`, SMTP settings, `VITE_GROQ_API_KEY`, etc.).
- Run migrations against the production database before deploying backend changes: `cd server && npm run migrate`.

## License

Private project — all rights reserved.

