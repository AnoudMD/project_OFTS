# OFTS Backend — Organic Food Traceability System

Node.js + Express + MongoDB REST API for the OFTS graduation project.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| MongoDB | 6.x (local) or MongoDB Atlas (free tier) |

---

## Project structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── batch.controller.js
│   │   ├── certification.controller.js
│   │   ├── event.controller.js
│   │   ├── scan.controller.js
│   │   └── upload.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT protect + optionalAuth
│   │   ├── errorHandler.js
│   │   ├── role.middleware.js      # authorize(...roles)
│   │   └── upload.middleware.js    # Multer config
│   ├── models/
│   │   ├── Batch.js
│   │   ├── Certification.js
│   │   ├── ScanHistory.js
│   │   ├── SupplyChainEvent.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── batch.routes.js
│   │   ├── certification.routes.js
│   │   ├── event.routes.js
│   │   ├── scan.routes.js
│   │   └── upload.routes.js
│   ├── utils/
│   │   └── seed.js                # Demo data seeder
│   └── server.js                  # App entry point
├── uploads/                       # Uploaded cert documents (git-ignored)
├── .env.example
├── package.json
└── README.md
```

---

## Quick start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
# Local MongoDB (default)
MONGO_URI=mongodb://localhost:27017/ofts_db

# OR MongoDB Atlas
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/ofts_db

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
```

### 3. Seed the database (optional but recommended)

This creates 5 demo users and 5 sample batches with full supply chain events.

```bash
npm run seed
```

Demo accounts created by the seeder:

| Role | Email | Password |
|------|-------|----------|
| Producer | producer@ofts.com | password123 |
| Certifier | certifier@ofts.com | password123 |
| Distributor | distributor@ofts.com | password123 |
| Retailer | retailer@ofts.com | password123 |
| Consumer | consumer@ofts.com | password123 |

### 4. Start the backend server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The API will be available at: **http://localhost:5000**

Health check: **http://localhost:5000/api/health**

---

## API reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Create new account |
| POST | /api/auth/login | None | Login, returns JWT |
| GET | /api/auth/me | Bearer | Get current user |

**Login request body:**
```json
{ "email": "producer@ofts.com", "password": "password123" }
```

**Login response:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "name": "Maria Santos", "email": "...", "role": "producer" }
}
```

---

### Batches

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/batches | Bearer | All | List batches (producers see own only) |
| POST | /api/batches | Bearer | producer | Create batch |
| GET | /api/batches/:id | Bearer | All | Get batch by ObjectId |
| GET | /api/batches/code/:batchCode | None | Public | Get batch by code (e.g. OT-2025-001234) |
| PATCH | /api/batches/:id | Bearer | producer, certifier | Update batch |
| POST | /api/batches/:id/certify | Bearer | certifier | Approve/Reject certification |

**Create batch body:**
```json
{
  "productName": "Organic Arabica Coffee",
  "farmName": "Green Valley Farm",
  "category": "Coffee",
  "origin": "Benguet, Philippines",
  "productionDate": "2025-01-10",
  "expiryDate": "2026-01-10",
  "quantity": "500 kg",
  "notes": "Shade-grown at 1500m"
}
```

**Certify batch body:**
```json
{ "decision": "Approved", "notes": "Meets all USDA organic standards." }
```

Valid decisions: `Pending` | `Under Review` | `Approved` | `Certified` | `Rejected`

---

### Supply Chain Events

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/events | Bearer | producer, certifier, distributor, retailer | Add event |
| GET | /api/events/:batchId | Bearer | All | Get all events for a batch |
| PATCH | /api/events/:id | Bearer | Event creator | Update event |
| DELETE | /api/events/:id | Bearer | Event creator | Delete event |

**Add event body:**
```json
{
  "batchId": "OT-2025-001234",
  "eventType": "Shipment",
  "location": "EcoRoute Logistics Hub, Manila",
  "timestamp": "2025-01-20T07:00:00Z",
  "notes": "Cold-chain transport confirmed"
}
```

Valid event types: `Harvest` | `Processing` | `Quality Check` | `Packaging` | `Shipment` | `Distribution`

---

### Certifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/certifications | Bearer (certifier) | Create/update certification |
| GET | /api/certifications/:batchId | Bearer | Get certification for a batch |
| PATCH | /api/certifications/:id | Bearer (certifier) | Update certification status |

---

### Scan History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/scans | Optional | Record a QR/manual scan |
| GET | /api/scans/me | Bearer | Get my scan history |
| GET | /api/scans/user/:userId | Bearer | Get scan history for a user |

---

### File Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/uploads/certification | Bearer (producer) | Upload PDF/PNG/JPG cert doc |
| POST | /api/uploads/generic | Bearer | General file upload |

Upload via `multipart/form-data` with field name `file`.
Attach to a batch by adding `batchId` field in the form data.

---

## Connecting the frontend

The frontend `src/services/api.ts` is already configured to use:

```
http://localhost:5000/api
```

If your backend runs on a different port or host, update the `BASE_URL` constant in that file.

When the backend is not running, all screens automatically fall back to the built-in mock data, so the preview remains fully demoable.

---

## Roles and permissions summary

| Role | Can do |
|------|--------|
| consumer | Scan QR, view traceability, view own scan history |
| producer | Create batches, upload cert documents, view own batches, add events |
| certifier | Review and approve/reject certifications, add Quality Check events |
| distributor | Add Shipment/Distribution events, view all batches |
| retailer | Add Distribution events, view all batches |

---

## Environment variables reference

| Variable | Default | Description |
|----------|---------|-------------|
| MONGO_URI | — | MongoDB connection string (required) |
| JWT_SECRET | — | Secret key for signing JWTs (required) |
| JWT_EXPIRES_IN | 7d | Token lifetime |
| PORT | 5000 | Server port |
| CLIENT_ORIGIN | * | Allowed CORS origin |
| UPLOAD_DIR | uploads | Relative path for uploaded files |
