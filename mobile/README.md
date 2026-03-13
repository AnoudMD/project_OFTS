# OFTS Mobile — React Native Expo App

Organic Food Traceability System — mobile frontend built with Expo SDK 51 + TypeScript.

---

## Quick Start

```bash
# 1. Install dependencies
cd mobile
npm install

# 2. Start Expo dev server
npx expo start

# Then press:
#   i  → open iOS Simulator
#   a  → open Android Emulator
#   w  → open in browser (Expo Web)
#   Scan QR in Expo Go app on your phone
```

---

## Project Structure

```
mobile/
├── App.tsx                     ← Entry point
├── app.json                    ← Expo config
├── babel.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── assets/                 ← App icons, images
    ├── components/             ← Reusable UI components
    │   ├── AppButton.tsx
    │   ├── AppCard.tsx
    │   ├── AppInput.tsx
    │   ├── BatchCard.tsx
    │   ├── EmptyState.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── ScreenHeader.tsx
    │   ├── StatusBadge.tsx
    │   └── TraceabilityTimeline.tsx
    ├── constants/              ← Colors, spacing, API URL, demo accounts
    ├── context/
    │   └── AuthContext.tsx     ← Global auth state + JWT persistence
    ├── data/
    │   └── mockData.ts         ← Offline fallback data
    ├── navigation/
    │   ├── RootNavigator.tsx   ← Auth-gated root stack
    │   ├── ProducerNavigator.tsx
    │   ├── CertifierNavigator.tsx
    │   ├── DistributorNavigator.tsx
    │   └── RetailerNavigator.tsx
    ├── screens/
    │   ├── WelcomeScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── QRScannerScreen.tsx
    │   ├── TraceabilityResultScreen.tsx
    │   ├── TraceabilityHistoryScreen.tsx
    │   ├── ScanHistoryScreen.tsx
    │   ├── ProducerDashboard.tsx
    │   ├── CreateBatchScreen.tsx
    │   ├── BatchListScreen.tsx
    │   ├── BatchDetailScreen.tsx
    │   ├── CertifierDashboard.tsx
    │   ├── ReviewBatchScreen.tsx
    │   ├── DistributorDashboard.tsx
    │   ├── RetailerDashboard.tsx
    │   └── AddSupplyChainEventScreen.tsx
    ├── services/
    │   └── api.ts              ← Axios/fetch calls → http://localhost:5000/api
    ├── types/                  ← TypeScript interfaces
    └── utils/                  ← Helpers: formatDate, getStatusStyle, etc.
```

---

## API Configuration

Edit `src/constants/index.ts`:

```ts
// Android Emulator  → http://10.0.2.2:5000/api
// iOS Simulator     → http://localhost:5000/api
// Real device       → http://<your-machine-ip>:5000/api
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

The app falls back to rich offline mock data when the backend is unreachable.

---

## Demo Accounts

| Role         | Email                    | Password    |
|--------------|--------------------------|-------------|
| Producer     | producer@ofts.com        | password123 |
| Certifier    | certifier@ofts.com       | password123 |
| Distributor  | distributor@ofts.com     | password123 |
| Retailer     | retailer@ofts.com        | password123 |

---

## Consumer Flow (no login required)

1. Open app → **WelcomeScreen**
2. Enter batch code (e.g. `OT-2025-001234`) or tap **Scan QR Code**
3. View full traceability result — product info, certification status, supply chain timeline

---

## Backend Setup

See `/backend/README.md` for Express + MongoDB setup.

Start backend first:
```bash
cd ../backend
npm install
cp .env.example .env   # Set MONGO_URI and JWT_SECRET
npm run dev            # http://localhost:5000
```
