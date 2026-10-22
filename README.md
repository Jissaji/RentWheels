# 🚗 RentWheels – Car Rental Management System

> A full-stack **Car Rental Management System (CRMS)** built as an MCA Micro Project using React 19, Node.js, Express.js, and MySQL/SQLite. The platform supports customers, staff, and administrators with distinct role-based portals.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)

---

## 📌 Project Overview

RentWheels is a multi-role car rental platform that covers the complete rental lifecycle — from browsing and booking a vehicle online to staff pickup/return handovers and admin inventory management.

The backend automatically falls back to an embedded **SQLite** database when MySQL is not running locally, so the application works out-of-the-box without any database server setup.

---

## ✨ Features

### 👤 Customer Portal
- Browse and search 22 Indian-market vehicles with filters (brand, category, price, fuel type, transmission, seats)
- Date-range availability search with real overlap detection
- Online booking with dynamic price calculation (daily rate × days + 18 % GST)
- Simulated payment (UPI, Credit/Debit Card, Net Banking, Pay at Pickup)
- Booking history with tabs — Upcoming, Active, Completed, Cancelled
- Invoice summary modal per booking
- In-app notification bell with unread badge

### 🛡️ Admin Console (`/admin`)
- Dashboard with fleet stats
- Car inventory management — add, edit, deactivate (soft-delete)
- Booking management — approve, reject, modify, cancel
- Customer and payment management
- Maintenance records
- Car booking history per vehicle

### 🔧 Staff Operations Portal (`/staff`)
- Record vehicle pickup handover (odometer, fuel, condition checklist)
- Record vehicle return & damage inspection
- Flag vehicles for maintenance
- Handover audit log

### 🔐 Security
- JWT-based authentication with role guards (Customer / Staff / Admin)
- Passwords hashed with Bcrypt
- `.env` excluded from Git; `.env.example` provided

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide React |
| Backend | Node.js 24, Express.js |
| Database | MySQL 8 (primary) / SQLite (auto-fallback) |
| Auth | JWT (jsonwebtoken) + Bcrypt.js |
| API | REST (JSON) |

---

## 📁 Project Structure

```
car-rental-management/
├── backend/
│   ├── config/          # DB connection (MySQL + SQLite fallback)
│   ├── controllers/     # Route handler logic
│   ├── database/        # seedData.js – auto-seeds 22 cars on first run
│   ├── middleware/       # JWT auth, role guards
│   ├── models/          # SQL query models
│   ├── routes/          # Express route definitions
│   ├── server.js        # Entry point
│   ├── .env.example     # Environment variable template (no secrets)
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI (Navbar, CarCard, BookingModal …)
│   │   ├── context/     # AuthContext, ToastContext
│   │   ├── layouts/     # PublicLayout, CustomerLayout, AdminLayout, StaffLayout
│   │   ├── pages/       # Route-level page components
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   └── staff/
│   │   ├── services/    # Axios API service wrappers
│   │   └── utils/       # Formatters (INR, date)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql       # MySQL DDL
│   └── seed.sql         # Sample data (22 cars, demo users)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later (tested on v24)
- **npm** v9 or later
- **MySQL 8** *(optional — SQLite fallback works automatically)*
- Git

---

### Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in your values
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux

# 3. (Optional) If using MySQL, create the database and import the schema:
#    mysql -u root -p < ../database/schema.sql
#    mysql -u root -p car_rental_db < ../database/seed.sql

# 4. Start the backend server
node server.js
```

> **Note:** If MySQL is not running, the server automatically uses a local SQLite file (`car_rental.sqlite`) and seeds 22 demo vehicles on first launch.

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The frontend runs at **http://localhost:5173** and proxies API calls to **http://localhost:5000**.

To build for production:
```bash
npm run build
```

---

### Database Configuration

| Mode | When used | Setup needed |
|---|---|---|
| **MySQL** | `DB_FALLBACK=false` or MySQL running | Create DB, run `schema.sql` then `seed.sql` |
| **SQLite (auto-fallback)** | MySQL not reachable | None — file is created automatically |

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and set your values:

```env
PORT=5000
NODE_ENV=development

# MySQL connection (leave DB_FALLBACK=true to use SQLite instead)
DB_CLIENT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=car_rental_db
DB_FALLBACK=true

# JWT — replace with a strong random secret
JWT_SECRET=replace_with_a_strong_random_secret_key
JWT_EXPIRES_IN=7d
```

> ⚠️ **Never commit your real `.env` file.** It is listed in `.gitignore`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@rentwheels.com` | `admin123` |
| **Staff Member** | `staff@rentwheels.com` | `password123` |
| **Customer** | `rajesh.sharma@example.com` | `password123` |

Quick-login buttons for all three roles are available on the `/login` page.

---

## 🌐 API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register a new customer |
| POST | `/auth/login` | — | Login and receive JWT |
| GET | `/auth/profile` | Customer | Get own profile |
| GET | `/cars` | — | List / search / filter cars |
| GET | `/cars/:id` | — | Get car details |
| POST | `/cars` | Admin | Add a car |
| PUT | `/cars/:id` | Admin | Update car details |
| DELETE | `/cars/:id` | Admin | Deactivate a car |
| GET | `/cars/:id/bookings` | Admin/Staff | Car booking history |
| GET | `/bookings/my-bookings` | Customer | Own booking history |
| POST | `/bookings` | Customer | Create a booking |
| PUT | `/bookings/:id/status` | Admin | Update booking status |
| PUT | `/bookings/:id` | Admin | Modify booking details |
| DELETE | `/bookings/:id` | Admin/Customer | Cancel a booking |
| POST | `/rental-records/pickup` | Staff/Admin | Record vehicle pickup |
| POST | `/rental-records/return` | Staff/Admin | Record vehicle return |
| GET | `/rental-records` | Staff/Admin | Handover audit log |
| GET | `/notifications` | Customer | Get notifications |
| PUT | `/notifications/:id/read` | Customer | Mark notification read |
| PUT | `/notifications/read-all` | Customer | Mark all notifications read |
| GET | `/payments` | Admin | Payment records |
| GET | `/customers` | Admin | Customer list |
| GET | `/maintenance` | Admin | Maintenance records |

---

## ▶️ Running the Application

Open **two terminals**:

**Terminal 1 – Backend**
```bash
cd car-rental-management/backend
node server.js
# Server running at http://localhost:5000
```

**Terminal 2 – Frontend**
```bash
cd car-rental-management/frontend
npm run dev
# App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser and log in with any of the demo credentials above.

---

## 📄 License

This project was developed as an **MCA Micro Project** for academic demonstration purposes.
