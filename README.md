# Nitra Payment

A lightweight front-end payment UI example (Vue 3 + Quasar + TypeScript). This project demonstrates handling multiple locations with different tax rates, reader (card terminal) management, and real-time calculation and editing of processing fees (fixed + percentage) shared between the merchant and the patient.

---

## DEMO

---

## Key Features

- Currency: USD
- Location switching (each Location has its own taxRate)
- Display and filter available readers (online / offline)
- Supported payment methods: Cash and Card
  - Cash: no processing fee
  - Card: processing fee = fixed fee + percentage \* payment amount
- Support splitting processing fees between merchant and patient (the fixed and percentage parts are editable), with immediate UI updates
- Support simulated online readers and manual card entry flows for development and testing convenience

## Tech Stack

- Vue 3 + Composition API
- Quasar (UI)
- Pinia (state management)
- Vite (build / dev server)
- TypeScript

---

## Quick Start

Recommended Node version: Node 18+

1. Clone the repository and install dependencies

```bash
git clone <repo-url>
cd nitra-payment
npm install
```

2. Start the development server (hot reload)

```bash
npm run dev
# open http://localhost:5173
```

3. Build production assets and run a local preview

```bash
npm run build
npm run preview
```

---

## Useful scripts (package.json)

- `npm run dev`: start Vite dev server
- `npm run build`: run `vue-tsc -b` then `vite build`
- `npm run preview`: locally preview the built static assets
- `npm run test`: run Vitest unit tests

---

## Project structure (high level)

See the `src/` directory in the repository root:

- `presentation/`: Vue components and pages (transaction UI / modals, etc.)
- `services/`: composables, stores, strategy factories
- `infrastructures/api/`: mock API and DTOs
- `models/`, `utils/`, `styles/`: data models, helper utilities, and styles

---

## Mock Data

The following are sample mock data objects to help with development and testing. Full mock data can be found in `src/infrastructures/api/index.ts` or in the test files.

Organization example:

```json
{
  "id": 4,
  "name": "Nitra Clinic",
  "totalProcessingFeeFixed": 10,
  "totalProcessingFeePercentage": "0.03500",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z",
  "deletedAt": null
}
```

Locations example:

```json
[
  {
    "id": 48,
    "name": "New York Clinic",
    "taxRate": "0.04500"
  },
  {
    "id": 75,
    "name": "Los Angeles Clinic",
    "taxRate": "0.04500"
  }
]
```

Payment Location Readers example:

```json
[
  {
    "id": 23,
    "label": "Device Reader 01",
    "readerId": "tmr_00000001582624",
    "status": "online",
    "locationId": 48
  },
  {
    "id": 27,
    "label": "Device Reader 02",
    "readerId": "tmr_00000001582658",
    "status": "offline",
    "locationId": 48
  }
]
```
