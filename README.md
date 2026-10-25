# SETUP LAB

SETUP LAB is a concept storefront for computer hardware and workspace equipment. Visitors can explore products, compare specifications, browse curated PC setups, and place a demo order.

## Features

- Product catalog with search, category and use-case filters.
- Sorting, price filtering, and pagination.
- Product pages with specifications and pricing.
- Curated setup kits with included products and calculated totals.
- Shopping cart with quantity controls.
- Checkout form with server-side order validation.
- Automated backend tests for API behavior and order validation.

## Tech stack

**Frontend:** React, TypeScript, Vite, React Router, CSS.

**Backend:** Node.js, native HTTP module, JSON data files, Node.js test runner.

## Run locally

Requirements: Node.js and npm.

### 1. Install frontend dependencies

Run from the repository root:

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Start the API

From the `backend` directory:

```bash
npm start
```

By default, the API runs at `http://localhost:7070`.

### 4. Start the frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite. Keep the API and frontend terminals running while using the app.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List product categories |
| GET | `/api/products` | List products with filtering and pagination |
| GET | `/api/products/:id` | Get a product by ID |
| GET | `/api/top-sales` | List featured products |
| GET | `/api/kits` | List curated setup kits |
| GET | `/api/kits/:id` | Get a setup kit by ID |
| POST | `/api/orders` | Validate and submit an order |

The catalog API supports search, category and use-case filters, price ranges, sorting, and pagination.

## Tests

Run backend tests from the `backend` directory:

```bash
npm test
```

## Production build

Run from the repository root:

```bash
npm run build
```

## Project status

SETUP LAB is an educational project in active development. Product images and content are temporary and will be updated as the storefront is finalized.
