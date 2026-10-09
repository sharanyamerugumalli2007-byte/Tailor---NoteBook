# 🌸 Tailor Notebook — Bespoke Tailoring & Atelier Order Management System

A production-ready, full-stack tailoring studio management web application built with **React (Vite)**, **Node.js (Express)**, and **MySQL 8**, styled with an **Atelier Baby-Pink & Rose Gold** luxury aesthetic.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Interactive Landing & Catalog**: Bespoke service catalog (Blouses, Lehengas, Suits, Gowns, Kurtis, Alterations) with pricing calculators and turnaround times.
- **5-Step Order Placement Wizard**: Service selection, fabric specifications, custom body measurement capture, delivery options, and real-time pricing breakdown.
- **Digital Measurement Book**: Manage multi-garment profiles with instant unit conversions (`inches` ↔ `centimeters`).
- **UPI QR Payment Workflow**: Dynamic UPI QR code generation (`upi://pay`), instant payment reference (UTR / Transaction ID) submission, and live verification status.
- **Live Order & Shipment Tracking**: Visual timeline tracking from `ORDER_PLACED` → `CONFIRMED` → `MEASUREMENTS_VERIFIED` → `CUTTING` → `STITCHING` → `QUALITY_CHECK` → `READY_FOR_DISPATCH` → `SHIPPED` → `DELIVERED`.
- **In-App Notifications & Order History**: Instant notifications for payment verification, dispatch alerts, and status changes.

### 👑 Administrator / Master Tailor Atelier
- **Interactive Metrics Dashboard**: Live revenue, pending advance verifications, in-progress stitching jobs, and active deliveries.
- **Order Lifecycle Manager**: Transition stitching stages, assign tracking numbers, update courier carriers, and record status history notes.
- **Payment Verifier Desk**: Review customer-submitted UTR references and approve/reject with automated order balance deductions.
- **Service & Catalog Management**: Create, edit, activate/deactivate tailoring services, categories, turnaround times, and base prices.
- **Customer Directory**: View customer profiles, order histories, contact details, and measurement records.
- **Studio Configuration**: Live UPI ID payee configuration, advance percentage rules, delivery charges, and studio policies.

---

## 🎨 Design System & Color Palette

The user interface is engineered with a **Luxury Baby-Pink Atelier** aesthetic:

| Token | Color Code | Purpose |
| :--- | :--- | :--- |
| **Primary Accent** | `#D96C8A` | Primary actions, key badges, highlights |
| **Primary Deep** | `#A83F62` | Hover states, active tabs, header gradients |
| **Primary Light** | `#FCE4EC` | Soft badge backgrounds, card borders |
| **Soft Baby Pink** | `#F4B6C2` | Gradient undertones, delicate borders |
| **Page Background** | `#FFF8FA` | Main canvas background |
| **Surface Card** | `#FFFFFF` | Glassmorphism cards with `rgba(217,108,138,0.08)` shadows |
| **Dark Heading Text**| `#38272E` | High-contrast typography |
| **Body Muted Text** | `#806C74` | Secondary labels, descriptions |
| **Success Emerald** | `#2E8B57` | Verified payments, delivered badges |
| **Warning Amber** | `#D99A24` | Pending verification, in-review alerts |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, React Router v6, Lucide Icons, Axios, Pure CSS3 Design System.
- **Backend**: Node.js 18+, Express.js, Helmet, CORS, Morgan, JWT (`jsonwebtoken`), Bcrypt.js, `mysql2/promise`.
- **Database**: MySQL 8.0 (with automated schema provisioning and high-fidelity fallback local store).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org))
- **MySQL 8.0**: Running locally on port `3306` (or optional built-in zero-downtime local store)

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy configuration (if needed)
# Default .env connects to localhost MySQL (user: root, database: tailor_notebook)
```

#### MySQL Database Initialization
The backend **automatically creates** the database `tailor_notebook` and all tables defined in `database/schema.sql` on startup.

To start the backend server:
```bash
npm run dev
```
*The backend API will run on `http://localhost:5000`.*

---

### 3. Frontend Setup

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The client application will run on `http://localhost:5173`.*

---

## 🔑 Default Sign-in Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Studio Admin** | `admin@tailornotebook.com` | `admin123` | Full Atelier Admin Suite (`/admin/*`) |
| **Sample Customer**| `priya@example.com` | `customer123` | Customer Dashboard (`/customer/*`) |

*New customers can also register instantly via `/register`.*

---

## 🧪 Automated Testing

To run the backend integration test suite:
```bash
cd backend
npm test
```

### Test Coverage includes:
- **Workflow A**: Customer registration, JWT issuance, and authentication checks.
- **Workflow B & C**: Order placement, auto-calculation of advance requirements (30%), UPI payment reference submission, and admin verification.
- **Workflow D**: Order stitching stage transitions (`CONFIRMED` → `PROCESSING` → `SHIPPED` with AWB tracking number & carrier).
- **Workflow E**: Strict Role-Based Access Control (RBAC) and client record privacy isolation.
- **Pricing & Rounding Rules**: Quantity multiplication, balance deduction, and decimal precision.

---

## 📡 Key API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/auth/me` — Retrieve current authenticated profile

### Orders (`/api/customer/orders` & `/api/orders`)
- `POST /api/customer/orders` — Create bespoke order with measurements snapshot
- `GET  /api/customer/orders` — List authenticated customer's orders
- `GET  /api/orders/:id` — View full order details, tracking timeline, & payment history
- `POST /api/customer/orders/:id/cancel` — Cancel initial stage order

### Payments & UPI (`/api/customer/orders/:id/payments` & `/api/admin/payments`)
- `POST /api/customer/orders/:id/payments` — Submit UPI transaction UTR reference
- `GET  /api/admin/payments` — Admin payment verifier list (filter by status)
- `POST /api/admin/payments/:id/verify` — Approve UPI payment & deduct order balance
- `POST /api/admin/payments/:id/reject` — Reject invalid reference with review reason

### Tracking & Admin Status (`/api/admin/orders/:id/status` & `/api/tracking/:orderId`)
- `GET   /api/tracking/:orderId` — Public/authenticated shipment tracking status
- `PATCH /api/admin/orders/:id/status` — Update order status, carrier, and AWB

---

## 📄 License
MIT License — Crafted with precision for bespoke tailoring ateliers.
