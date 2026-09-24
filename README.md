# Order Status Tracker

A full-stack webhook receiver and order status tracking dashboard designed for e-commerce and logistics teams to monitor order lifecycles, inspect event audit trails, and handle asynchronous provider webhooks.

Built with Node.js, Express, TypeScript, SQLite (`node:sqlite`), React 19, Vite, Redux Toolkit, and Axios.

---

## Features

- Asynchronous webhook receiver endpoint (`POST /webhooks/orders`)
- Strict order lifecycle state machine validation
- Idempotent event processing (automatic duplicate deduplication)
- Out-of-order event handling with audit trail preservation
- RESTful query APIs (`GET /orders`, `GET /orders/:id`)
- Order listing dashboard with status filtering
- Detailed order view with chronological event history timeline
- Dedicated loading, empty, and error states with retry capabilities
- Embedded zero-dependency SQLite database with automatic table creation
- Comprehensive automated test suite with in-memory database isolation
- Modern, responsive UI with light and dark mode support

---

## Tech Stack

- **Backend**: Node.js (v22+), Express, TypeScript, `node:sqlite`
- **Frontend**: React 19, Vite, Redux Toolkit, React Router, Axios
- **Database**: SQLite (built-in via Node standard library `node:sqlite`)
- **Testing**: Jest, `ts-jest`, Supertest
- **Linting & Tooling**: ESLint, TypeScript Compiler (`tsc`)

---

## Order Statuses & Lifecycle

**Valid status flow**: `created -> paid -> shipped -> delivered`. An order can move to `cancelled` from any state before `shipped`.

```
created -> paid -> shipped -> delivered
   │        │
   └──► cancelled ◄──┘
```

### Valid Statuses

- **`created`**: Order has been placed by the customer.
- **`paid`**: Payment confirmed by the payment gateway.
- **`shipped`**: Package dispatched by fulfillment.
- **`delivered`**: Package successfully received (terminal state).
- **`cancelled`**: Order cancelled (terminal state).

### Lifecycle Rules

- **Valid status flow**: `created -> paid -> shipped -> delivered`. An order can move to `cancelled` from any state before `shipped`.
- Orders can transition to **`cancelled`** from **`created`** or **`paid`**.
- Orders **cannot** be cancelled once they have reached **`shipped`** or **`delivered`** (terminal states).
- The first event received for any order must have status **`created`**.
- Transitions that skip steps (e.g. `created -> shipped`) or move backwards (e.g. `shipped -> paid`) are rejected with HTTP `422`.

---

## Database

The application uses an embedded SQLite database (`orders.db`) powered by Node's built-in `node:sqlite` module. No external database installation or server setup is required.

### Main Tables

- **`orders`**: Stores current order state (`id`, `status`, `createdAt`, `updatedAt`).
- **`order_events`**: Stores full audit history (`id`, `eventId`, `orderId`, `status`, `timestamp`, `createdAt`).

`order_events` is related to `orders` through the `orderId` foreign key. A `UNIQUE(eventId)` constraint guarantees idempotency.

---

## Environment Variables

Default configuration works automatically out of the box. Optional environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port where the Express API server listens |
| `NODE_ENV` | `development` | Setting to `test` runs the database in-memory (`:memory:`) |

---

## Installation

Ensure you have **Node.js v22.5.0 or newer** installed (`node -v`).

### 1. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## Database Setup

No manual migrations are required. The database file (`orders.db`) and its tables are automatically created on first server startup:

- Dev/Prod: File-based SQLite database (`backend/orders.db`) with Write-Ahead Logging (`WAL`) enabled.
- Test: In-memory SQLite database (`:memory:`) for instantaneous, isolated test runs.

---

## Development

Start the backend and frontend in two separate terminal windows:

### Terminal 1: Start Backend API
```bash
cd backend
npm run dev
```
Starts Express API on [http://localhost:3001](http://localhost:3001).

### Terminal 2: Start Frontend Dashboard
```bash
cd frontend
npm run dev
```
Starts Vite dev server on [http://localhost:5173](http://localhost:5173).

---

## Testing

Run all 12 backend unit tests:

```bash
cd backend
npm test
```

### Run Specific Tests
```bash
cd backend
npx jest -t "idempotency"
```

### Watch Mode
```bash
cd backend
npm run test:watch
```

---

## Sample Webhook Events

To test the system, send sample events to the webhook receiver:

### 1. Create Order (`created`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/webhooks/orders" -Method Post -ContentType "application/json" -Body '{"eventId":"evt_101","orderId":"ord_2002","status":"created","timestamp":"2026-09-24T08:00:00.000Z"}'
```

### 2. Advance to Paid (`paid`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/webhooks/orders" -Method Post -ContentType "application/json" -Body '{"eventId":"evt_102","orderId":"ord_2002","status":"paid","timestamp":"2026-09-24T08:05:00.000Z"}'
```

### 3. Advance to Shipped (`shipped`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/webhooks/orders" -Method Post -ContentType "application/json" -Body '{"eventId":"evt_103","orderId":"ord_2002","status":"shipped","timestamp":"2026-09-24T08:10:00.000Z"}'
```

### 4. Advance to Delivered (`delivered`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/webhooks/orders" -Method Post -ContentType "application/json" -Body '{"eventId":"evt_104","orderId":"ord_2002","status":"delivered","timestamp":"2026-09-24T08:15:00.000Z"}'
```

---

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/webhooks/orders` | Ingest order webhook event | `200` (accepted/duplicate/out-of-order), `400` (bad payload), `422` (invalid transition) |
| `GET` | `/orders` | List orders (optional `?status=paid`) | `200` (returns order array) |
| `GET` | `/orders/:id` | Get order details with event history | `200` (returns order + events), `404` (not found) |

### Webhook Payload Shape

```json
{
  "eventId": "evt_123",
  "orderId": "ord_9",
  "status": "paid",
  "timestamp": "2026-09-20T10:15:00Z"
}
```

---

## Edge Cases & Reliability

- **Idempotency**: Retried events with matching `eventId` return HTTP `200` immediately without creating duplicate database entries.
- **Out-of-Order Delivery**: If an event with an older timestamp arrives after a newer transition (e.g. late `paid` after `shipped`), it is recorded in `order_events` to preserve history but does not revert current status.
- **Atomic Operations**: State transitions and audit logging are wrapped in database transactions (`BEGIN` ... `COMMIT`).
- **Resilient UI States**: The frontend provides dedicated loading spinners, empty state notices with filter reset buttons, and error recovery banners.

---

## Production

### 1. Build and Run Backend
```bash
cd backend
npm run build
npm start
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```
Static production files are emitted to `frontend/dist/`.

---

## Development Workflow

Typical development workflow:

```bash
cd backend && npm install && npm test && cd ../frontend && npm install && cd ..
```

To start local servers:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

For production:
```bash
cd backend && npm run build && npm start
cd frontend && npm run build
```
