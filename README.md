# StudyNest — Backend (Server)

Node.js + Express + TypeScript + MongoDB (Mongoose) REST API for the StudyNest platform.

## Setup (local)

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI, DB_NAME, JWT_SECRET
npm run dev             # starts on http://localhost:5000
```

Seed the database with realistic demo accounts and content:

```bash
npm run seed
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with hot reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server (`dist/server.js`) |
| `npm run seed` | Wipe and reseed the database with sample data |
| `npm run seed:destroy` | Wipe all collections without reseeding |

## Environment Variables

See `.env.example`. **`DB_NAME` must exactly match your MongoDB Atlas database name** — a mismatch here is the #1 cause of "my data disappeared" bugs.

## API Overview

Base URL (local): `http://localhost:5000/api`

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/profile` |
| Resources | `GET /resources`, `GET /resources/:id`, `GET /resources/mine`, `POST /resources`, `DELETE /resources/:id`, `POST /resources/:id/reviews` |
| Study Groups | `GET /study-groups`, `GET /study-groups/:id`, `POST /study-groups`, `POST /study-groups/:id/join`, `POST /study-groups/:id/leave` |
| Tutors | `GET /tutors`, `GET /tutors/:id`, `POST /tutors/:id/book`, `GET /tutors/bookings/mine` |
| Admin | `GET /admin/stats`, `GET /admin/resources`, `GET /admin/users` (all require `role: admin`) |

Auth uses a JWT stored in an httpOnly cookie (`token`), and is also returned in the JSON response body for clients that prefer `Authorization: Bearer <token>`.
