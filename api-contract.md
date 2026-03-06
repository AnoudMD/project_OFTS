# OFTS API Contract

## Login
POST /api/auth/login

Request:
{
  "email": "producer@ofts.com",
  "password": "123",
  "role": "producer"
}

Response:
{
  "token": "token-demo",
  "user": {
    "id": 1,
    "email": "producer@ofts.com",
    "role": "producer"
  }
}

---

## Create Batch
POST /api/batches
Header: x-role: producer

Request:
{
  "productName": "Organic Grapes",
  "farmName": "Al Farm",
  "productionDate": "2026-03-01",
  "expiryDate": "2026-03-10",
  "certificateId": "ORG-2026-0001",
  "verificationUrl": "http://localhost:4000/verify/ORG-2026-0001"
}

---

## Upload Certificate
POST /api/batches/:batchId/certificate
Header: x-role: producer
FormData:
- certificateFile
- certificateId
- verificationUrl

---

## Add Event
POST /api/batches/:batchId/events
Header: x-role: distributor أو retailer

Request:
{
  "type": "Shipment",
  "location": "Riyadh",
  "dateTime": "2026-03-03T10:00:00",
  "notes": "Shipped to store"
}

---

## Scan
GET /api/scan/:batchId