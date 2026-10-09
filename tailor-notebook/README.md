# Tailor Notebook — Digital Order Management

A full-stack web app that replaces a paper tailor's notebook: customers, versioned measurements, orders with multiple items, order-status tracking, payments, appointments with a calendar, in-app notifications, PDF measurement cards and receipts, and database backups.

## Features
- JWT login, bcrypt-hashed passwords, roles (`admin` = shop owner, `staff`)
- Customer CRUD with server-side search, pagination and soft delete (history is never lost)
- **Measurement versioning**: saving or "editing" always creates a new version; older versions stay, can be compared, printed and restored (restore = copy forward as a new version)
- Orders with multiple items, automatic totals, advance/remaining/payment status, chosen measurement version, status workflow with history
- Appointments with calendar + list views, double-booking prevention, reschedule/cancel
- Notifications stored in the database (unread count, mark read, mark all read); created on new orders, status changes, ready orders, new/cancelled appointments, and hourly reminders (appointments, deliveries due, payments pending)
- PDF measurement card and order receipt, generated from live database rows
- Admin-only database backup (`pg_dump`) with authenticated download
- Validation on both frontend (React Hook Form) and backend (Zod), consistent `{ success, message, data }` API responses

## Stack
React 18 + Vite, React Router, React Hook Form, Axios · Node 18+, Express, `pg`, Zod, PDFKit, Helmet, CORS, Morgan · PostgreSQL 13+

## Architecture
```
Browser (React SPA) ──/api (JWT in Authorization header)──▶ Express ──▶ PostgreSQL
                                   routes → validators → controllers → models (SQL) / services
```

## Folder structure
```
backend/
  database/    schema.sql  seed.sql  seed.js
  src/         config/ controllers/ routes/ middleware/ models/ services/ validators/ utils/ server.js
  tests/       orderCalc.test.js
  backups/     (server-side only, never served statically)
frontend/
  src/         components/ pages/ services/ context/ hooks/ utils/ App.jsx main.jsx index.css
```

## Database
Tables: `users`, `customers`, `measurements`, `orders`, `order_items`, `order_status_history`, `appointments`, `notifications`.
Key rules enforced **in the database**: one current measurement version per customer (partial unique index), `advance_amount <= total_amount`, delivery date not before order date, positive measurements/quantities, valid status enums, and one active appointment per time slot. Orders reference `measurements.id` so each order remembers the version used. Order numbers start at 1001.

## Prerequisites
Node.js 18+, PostgreSQL 13+ (with `pg_dump` for backups).

## Setup
```bash
# 1. PostgreSQL
createdb -U postgres tailor_notebook          # or: psql -U postgres -c "CREATE DATABASE tailor_notebook;"

# 2. Backend
cd backend
cp .env.example .env                          # then edit DATABASE_PASSWORD and JWT_SECRET
npm install
npm run seed                                  # creates all tables + development data (WIPES existing data)
npm run dev                                   # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                                   # http://localhost:5173  (proxies /api to :5000)
```
Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

To create the schema without sample data: `psql -U postgres -d tailor_notebook -f backend/database/schema.sql`, then insert your own admin user with a bcrypt hash.

**Seed logins** (change these immediately in real use): `admin@tailor.local / Admin@123`, `staff@tailor.local / Staff@123`.

Run tests: `cd backend && npm test`.

## Authentication
`POST /api/auth/login` checks the password with bcrypt and returns a signed JWT (expires per `JWT_EXPIRES_IN`). The frontend stores it and sends `Authorization: Bearer <token>`. Every route except login and health requires it; the user is re-loaded from the database on each request. JWTs are stateless, so logout discards the token client-side. Login is rate-limited. Role rules: deleting customers/orders and backups are admin-only.

## Business rules worth knowing
- Order total is computed on the server from items; the client cannot set it. Remaining = total − advance. Payment status is derived (0 → Pending, = total → Paid, else Partially paid).
- `DELIVERED` and `CANCELLED` orders are final (no status change or edit).
- Customers are soft-deleted; their orders, measurements and appointments remain.
- Creating an order with no chosen measurement uses the customer's current version.
- Appointment dates in the past are rejected on creation; two active appointments can't share a slot.

## PDFs
`GET /api/pdf/measurements/:customerId?measurementId=ID` (current version by default) and `GET /api/pdf/orders/:orderId`. Built with PDFKit from database rows (amounts print as "Rs." because standard PDF fonts lack the ₹ glyph). The frontend fetches them with the auth header and opens them in a new tab for download or printing.

## Backups
Admin → Profile → *Create backup* runs `pg_dump` on the server (password passed via `PGPASSWORD` env, never on the command line) into `backend/backups/` (file mode 600). Files are only reachable through `GET /api/backups/:name/download`, which requires an admin token. Set `PG_DUMP_PATH` if `pg_dump` is not on PATH. Restore with `psql -d tailor_notebook -f backup-….sql`.

## API
All responses: `{ "success": true|false, "message": "...", "data": ... }`. List endpoints return `data: { items, total, page, limit }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` · `PUT /api/auth/profile` |
| Customers | `GET /api/customers?search&page&limit` · `GET/PUT/DELETE /api/customers/:id` · `POST /api/customers` · `GET /api/customers/:id/history` |
| Measurements | `GET/POST /api/customers/:customerId/measurements` · `GET …/measurements/history` · `GET/PUT /api/measurements/:id` (PUT saves a new version) · `POST /api/measurements/:id/restore` |
| Orders | `GET /api/orders?search&status&payment_status&delivery_from&delivery_to&page&limit` · `POST /api/orders` · `GET/PUT/DELETE /api/orders/:id` · `PATCH /api/orders/:id/status` · `GET /api/customers/:customerId/orders` |
| Appointments | `GET /api/appointments?search&status&date&from&to` · `POST` · `GET/PUT/DELETE /api/appointments/:id` · `PATCH /api/appointments/:id/status` |
| Notifications | `GET /api/notifications` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all` |
| Dashboard | `GET /api/dashboard/stats` · `/recent-orders` · `/upcoming-appointments` |
| PDF | `GET /api/pdf/measurements/:customerId` · `GET /api/pdf/orders/:orderId` |
| Backups (admin) | `GET /api/backups` · `POST /api/backups` · `GET /api/backups/:name/download` |
| Health | `GET /api/health` |

## Troubleshooting
- **"Missing required environment variables"** — copy `backend/.env.example` to `.env` and fill it in.
- **`password authentication failed`** — check `DATABASE_USER` / `DATABASE_PASSWORD`.
- **Frontend shows "Cannot reach the server"** — start the backend; in production set `VITE_API_URL` and `FRONTEND_URL` (CORS).
- **Backup says pg_dump not found** — install PostgreSQL client tools or set `PG_DUMP_PATH`.
- **PDF tab blocked** — allow pop-ups; the app falls back to a download.

## Future enhancements
Email/SMS/WhatsApp notifications, password reset by email, refresh tokens, per-garment measurement templates, payment instalments, image attachments (fabric/design catalog), automated scheduled backups, integration tests with a test database.
