# QuoteForge — Product Configuration & Pricing System (Mini CPQ Platform)

A full-stack mini CPQ (Configure, Price, Quote) platform for industrial sales teams. Built with React, Vite, Node.js, Express, and MongoDB. Features a dynamic product configurator, a rule-based pricing engine, PDF quote generation, JWT authentication, and role-based access control (Admin / Sales).

---

## 📁 Project Structure

```
QuoteForge/
├── server/                         # Node.js + Express Backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── pricingController.js
│   │   ├── quoteController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── PricingRule.js
│   │   └── Quote.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── pricing.js
│   │   ├── quotes.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── roleCheck.js         # RBAC factory
│   ├── services/
│   │   ├── pricingEngine.js     # Rule evaluator
│   │   └── pdfService.js        # PDFKit generator
│   ├── scripts/
│   │   └── seed.js              # Sample data seeder
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── client/                         # React + Vite Frontend
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state + JWT
    │   ├── services/
    │   │   └── api.js             # Axios instance with interceptors
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   └── MainLayout.jsx
    │   ├── components/
    │   │   ├── StatCard.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── Modal.jsx
    │   │   ├── SkeletonCard.jsx
    │   │   ├── EmptyState.jsx
    │   │   └── Spinner.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Configurator.jsx
    │   │   ├── Quotes.jsx
    │   │   ├── QuoteDetail.jsx
    │   │   └── admin/
    │   │       ├── Products.jsx
    │   │       ├── PricingRules.jsx
    │   │       └── Users.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** — [mongodb.com/try/download](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)
- **npm** (comes with Node.js)

---

### Step 1 — Clone / Open the project

```bash
cd d:\QuoteForge
```

---

### Step 2 — Configure Environment

The server `.env` is already created at `server/.env`. Edit if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quoteforge
JWT_SECRET=quoteforge_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **MongoDB Atlas** (cloud): Replace `MONGODB_URI` with your Atlas connection string.

---

### Step 3 — Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ..\client
npm install
```

---

### Step 4 — Seed the Database

From the `server` folder, run the seed script to create users, products, and pricing rules:

```bash
cd server
npm run seed
```

This creates:
- 👤 Admin: `admin@quoteforge.com` / `Admin@123`
- 👤 Sales: `sales@quoteforge.com` / `Sales@123`
- 👤 Sales: `priya@quoteforge.com` / `Sales@123`
- 📦 Products: Industrial Transformer, Industrial AC Motor
- 📋 8 Pricing Rules
- 📄 3 Sample Quotes

---

### Step 5 — Start the Backend

```bash
cd server
npm run dev
```

Server starts at: **http://localhost:5000**

---

### Step 6 — Start the Frontend

```bash
cd client
npm run dev
```

Frontend starts at: **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@quoteforge.com     | Admin@123  |
| Sales | sales@quoteforge.com     | Sales@123  |
| Sales | priya@quoteforge.com     | Sales@123  |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| POST   | `/api/auth/register`  | Register user   |
| POST   | `/api/auth/login`     | Login + JWT     |
| GET    | `/api/auth/me`        | Current user    |

### Products
| Method | Endpoint              | Auth Required |
|--------|-----------------------|---------------|
| GET    | `/api/products`       | Any           |
| GET    | `/api/products/:id`   | Any           |
| POST   | `/api/products`       | Admin         |
| PUT    | `/api/products/:id`   | Admin         |
| DELETE | `/api/products/:id`   | Admin         |

### Pricing
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/pricing/calculate`  | Run rule engine on config|

### Quotes
| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| POST   | `/api/quotes`              | Create quote         |
| GET    | `/api/quotes`              | List quotes (filtered)|
| GET    | `/api/quotes/stats`        | Analytics (admin)    |
| GET    | `/api/quotes/:id`          | Quote detail         |
| GET    | `/api/quotes/:id/pdf`      | Download PDF         |
| PUT    | `/api/quotes/:id/status`   | Update status        |

### Admin
| Method | Endpoint                | Description      |
|--------|-------------------------|------------------|
| GET    | `/api/admin/overview`   | Dashboard stats  |
| GET    | `/api/admin/users`      | List all users   |
| PUT    | `/api/admin/users/:id`  | Update user      |
| GET    | `/api/admin/rules`      | List rules       |
| POST   | `/api/admin/rules`      | Create rule      |
| PUT    | `/api/admin/rules/:id`  | Update rule      |
| DELETE | `/api/admin/rules/:id`  | Delete rule      |

---

## 💡 Pricing Rule Engine

Rules stored in MongoDB with this structure:
```json
{
  "name": "High Voltage Premium",
  "condition": { "field": "voltage", "operator": ">", "value": "200" },
  "addedPrice": 1500,
  "priority": 10,
  "isActive": true
}
```

**Supported operators:** `>`, `<`, `>=`, `<=`, `==`, `!=`, `includes`

Rules are evaluated server-side via `POST /api/pricing/calculate` and the frontend debounces calls on every configuration change for real-time pricing.

---

## 🏗️ Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router|
| HTTP Client | Axios                                     |
| Forms       | React Hook Form                           |
| Charts      | Recharts                                  |
| Icons       | Lucide React                              |
| Backend     | Node.js, Express.js                       |
| Database    | MongoDB, Mongoose                         |
| Auth        | JWT (jsonwebtoken), bcryptjs              |
| PDF         | PDFKit                                    |

---

## 🔒 Role-Based Access Control

| Feature                  | Admin | Sales |
|--------------------------|:-----:|:-----:|
| View Dashboard           | ✅    | ✅    |
| Product Configurator     | ✅    | ✅    |
| View Own Quotes          | ✅    | ✅    |
| View All Quotes          | ✅    | ❌    |
| Submit for Approval      | ✅    | ✅    |
| Approve / Reject Quotes  | ✅    | ❌    |
| Manage Products          | ✅    | ❌    |
| Manage Pricing Rules     | ✅    | ❌    |
| Manage Users             | ✅    | ❌    |




Admin	
admin@quoteforge.com	
Admin@123

Sales	
sales@quoteforge.com
Sales@123
