# OFTS API Documentation

## Project Summary

This repository supports the Organic Food Traceability System (OFTS), a blockchain-enabled platform that combines QR codes, smart contracts, and optional IoT data to verify organic certification and product provenance across the supply chain. The system records batch creation, certification reviews, approvals, and supply-chain events, then exposes verified traceability details to consumers via QR scans.

Key roles in the prototype include Producer, Certifier, Distributor, Retailer, and Consumer.

See `REPORT_SUMMARY.md` for a concise overview of the graduation report.

## 4) How frontend and backend connect

### Login request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "producer@ofts.com",
  "password": "123456",
  "role": "Producer"
}
