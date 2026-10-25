# SETUP LAB

**SETUP LAB** is an electronics store concept for discovering computer hardware, comparing products, and exploring ready-made setups for different needs.

## Features

- **Product catalog** — browse electronics by category and intended use.
- **Search and filtering** — find products by name, category, price, and use case.
- **Sorting and pagination** — organize catalog results.
- **Product details** — view specifications, prices, and product information.
- **Ready-made setups** — explore curated hardware combinations and their total prices.
- **Shopping cart** — manage selected products and quantities.
- **Order checkout** — submit orders with customer contact and delivery information.
- **API tests** — automated tests for catalog endpoints, setup kits, and order validation.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

**Backend**
- Node.js
- Native HTTP module
- JSON-based data storage
- Node.js test runner

## Getting Started

### Requirements

- Node.js
- npm

### 1. Install frontend dependencies

Run from the project root:

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Start the backend

From the `backend` directory:

```bash
npm start
```

The API runs at `http://localhost:7070` by default.

### 4. Start the frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Follow the local URL printed by Vite in the terminal.

## Backend API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Retrieve product categories |
| GET | `/api/products` | Retrieve products with filtering and pagination |
| GET | `/api/products/:id` | Retrieve a product by ID |
| GET | `/api/top-sales` | Retrieve featured products |
| GET | `/api/kits` | Retrieve ready-made setups |
| GET | `/api/kits/:id` | Retrieve a setup by ID |
| POST | `/api/orders` | Validate and create an order |

The product catalog supports search, category and use-case filters, price ranges, sorting, and pagination.

## Testing

Run backend tests from the `backend` directory:

```bash
npm test
```

## Production Build

Run from the project root:

```bash
npm run build
```

## Project Status

This project is a work in progress. Product imagery and some store details may be updated as development continues.
