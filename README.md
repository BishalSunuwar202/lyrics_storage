# Bhajan Lyrics Library

A full-stack web application for collecting, managing, and presenting devotional lyrics (Bhajans, Koras, and other songs). The app supports community submissions with an admin moderation workflow, fast search across titles, writers, numbers, and content, and a built-in projector mode for live performance.

**Live app:** [lyrics-storage.vercel.app](https://lyrics-storage.vercel.app)

---

## Features

- **Browse & search** approved lyrics by title, writer, number, or full-text content
- **Category filters** for Bhajan, Koras, and Other
- **Public submissions** — anyone can submit a lyric; entries enter a `pending` queue until reviewed
- **Admin dashboard** — review, approve, edit, or delete submissions
- **Projector mode** — distraction-free fullscreen view for stage and worship use
- **Responsive UI** — mobile-first layout, works across phone, tablet, and desktop
- **Secure authentication** — JWT access tokens with HTTP-only refresh cookies

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Query, React Router |
| Backend | Node.js, Express 5, Zod (validation) |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt + HTTP-only refresh cookies |
| Deployment | Vercel (frontend & backend) |

---

## Project Structure

```
bhajan/
├── backend/
│   ├── database/         # Schema + table bootstrap scripts
│   ├── middleware/       # Auth, validation
│   ├── routes/           # auth.js, lyrics.js
│   ├── validation/       # Zod schemas
│   ├── db.js             # Postgres pool
│   └── index.js          # Express entry point
└── frontend/
    └── src/
        ├── api/          # Typed API client
        ├── components/   # EditModal, ConfirmModal, ProjectorMode
        ├── contexts/     # Auth context
        ├── pages/        # Home, Submit, LyricsView, AdminLogin, AdminDashboard
        ├── App.tsx
        └── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Supabase recommended)

### 1. Clone and install

```bash
git clone https://github.com/BishalSunuwar202/bhajan.git
cd bhajan

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your-strong-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-initial-admin-password
PORT=3001
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:3001/api
```

> Only `VITE_`-prefixed variables are exposed to the browser. Never put secrets in the frontend env.

### 3. Run locally

```bash
# Backend (http://localhost:3001)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

On first boot, the backend bootstraps the `lyrics`, `admin`, and `refresh_tokens` tables, and seeds an initial admin user from the env credentials.

---

## API Overview

Base URL: `/api`

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/lyrics` | List approved lyrics. Supports `page`, `limit`, `category`, `search` |
| `GET` | `/lyrics/:id` | Fetch a single lyric |
| `POST` | `/lyrics` | Submit a new lyric (enters `pending` status) |
| `GET` | `/health` | Health check |

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Admin login — returns access token, sets refresh cookie |
| `POST` | `/auth/refresh` | Rotate access token using refresh cookie |
| `POST` | `/auth/logout` | Invalidate refresh token |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/lyrics/pending` | List pending submissions |
| `PUT` | `/lyrics/:id` | Edit a lyric |
| `PATCH` | `/lyrics/:id/approve` | Approve a pending lyric |
| `DELETE` | `/lyrics/:id` | Delete a lyric |

---

## Security

- All input is validated server-side with Zod before reaching the database.
- All SQL is parameterized — no string interpolation of user input.
- Access tokens are short-lived; refresh tokens live in `httpOnly`, `Secure`, `SameSite=Strict` cookies.
- Admin routes are gated by both `authenticateToken` and `isAdmin` middleware.
- CORS is restricted to a known allowlist; no wildcard origins.
- Internal errors are logged server-side and never returned to the client.

---

## Scripts

### Backend

```bash
npm run dev     # Start with nodemon
npm start       # Start in production mode
```

### Frontend

```bash
npm run dev     # Vite dev server
npm run build   # Type-check + production build
npm run lint    # ESLint
npm run preview # Preview production build locally
```

---

## Deployment

Both the frontend and backend deploy to Vercel from `main`. Pushes to `main` trigger automatic builds. Environment variables are managed in the Vercel project settings — they are never committed to the repo.

---

## License

ISC — personal project, contributions by invitation only.
