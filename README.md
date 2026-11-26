# Portfolio Backend

Express API for the portfolio site. Serves public project data and an admin portal for managing projects (JWT auth + MongoDB).

## Stack

- Node.js + Express
- MongoDB (Mongoose)
- JWT (`jsonwebtoken`) + bcrypt
- Docker / PM2 for production
- Optional Nginx reverse proxy

## Requirements

- Node.js 20+
- MongoDB Atlas (or any MongoDB URI)
- Docker (optional, for containerized runs)

## Setup

```bash
cd backend
cp .env.example .env   # or create .env manually
npm install
```

### Environment variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign admin JWT tokens |
| `ADMIN_EMAIL` | Admin account email (seeded on startup if missing) |
| `ADMIN_PASSWORD` | Admin account password (used only when seeding) |
| `CORS_ORIGIN` | Comma-separated allowed origins (e.g. `http://localhost:3000`) |
| `PORT` | Server port (default `4000`) |

Example `.env`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/portfolio
JWT_SECRET=replace-with-a-long-random-string
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=change-me
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

On startup the server connects to MongoDB and seeds the admin user if it does not already exist.

## Run locally

```bash
npm run dev     # watch mode
npm start       # production-style (no watch)
```

API: [http://localhost:4000](http://localhost:4000)

Health check: `GET /health`

## Run with Docker

From the `backend` directory:

```bash
docker compose up --build -d backend   # API on http://localhost:4000
docker compose logs -f backend
docker compose down
```

To also start Nginx (proxies port 80 → backend):

```bash
docker compose up --build -d
```

## API overview

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/projects` | List projects |
| `GET` | `/api/projects/:id` | Get one project |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/admin/login` | Admin login → `{ token, user }` |
| `GET` | `/api/auth/admin/me` | Current admin (Bearer token) |

### Admin (Bearer token required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/projects` | List all projects |
| `GET` | `/api/admin/projects/:id` | Get one project |
| `POST` | `/api/admin/projects` | Create project |
| `PUT` | `/api/admin/projects/:id` | Update project |
| `DELETE` | `/api/admin/projects/:id` | Delete project |

Send auth as:

```http
Authorization: Bearer <token>
```

## Project structure

```
backend/
├── src/
│   ├── index.js              # App entry, CORS, Mongo connect, seed
│   ├── seed.js               # Admin + legacy data migration
│   ├── middleware/auth.js    # JWT auth helpers
│   ├── models/               # User, Project, TechStack
│   ├── routes/               # auth, admin, projects
│   └── controllers/          # Public project handlers
├── nginx/nginx.conf          # Reverse proxy config
├── dockerfile
├── docker-compose.yml
├── ecosystem.config.cjs      # PM2 process config
└── package.json
```
