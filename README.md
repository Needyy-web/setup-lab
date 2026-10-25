# SETUP LAB

**SETUP LAB** is a full-stack concept storefront for computer hardware and workspace equipment. It helps users explore tech for work, study, gaming, and content creation, compare products, browse curated setup kits, and submit a demo order.

## Features

- Product catalog with search, category and use-case filters.
- Price range filtering, sorting, and paginated loading.
- Product detail pages with descriptions, specifications, and image galleries.
- Curated setup kits with included products and calculated totals.
- Shopping cart with persistent contents and quantity controls.
- Checkout form with server-side order validation.
- Responsive layout for desktop and mobile.
- Automated backend tests and CI checks for frontend builds.

## Tech stack

- **Frontend:** React, TypeScript, Vite, React Router, CSS.
- **Backend:** Node.js, native HTTP module, JSON data files, Node.js test runner.
- **Quality checks:** TypeScript build, backend tests, GitHub Actions.

## Screenshots

Screenshots will be added after the final UI review.

## Run locally

Requirements: Node.js 22 or newer and npm.

### 1. Install frontend dependencies

From the repository root:

```bash
npm ci
```

### 2. Install backend dependencies

```bash
cd backend
npm ci
```

### 3. Start the API

From the `backend` directory:

```bash
npm start
```

The API runs at `http://localhost:7070` by default.

### 4. Start the frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite. In development, Vite proxies `/api` requests to the backend on port 7070. Keep both processes running while using the app.

## Checks

Run from the repository root:

```bash
npm run build
npm run lint
```

Run backend tests from the `backend` directory:

```bash
npm test
```

GitHub Actions runs the frontend production build and backend tests on pushes and pull requests.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List product categories |
| GET | `/api/products` | List products with filtering and pagination |
| GET | `/api/products/:id` | Get a product by ID |
| GET | `/api/top-sales` | List featured products |
| GET | `/api/kits` | List curated setup kits |
| GET | `/api/kits/:id` | Get a setup kit by ID |
| POST | `/api/orders` | Validate and submit a demo order |

The catalog API supports search, category and use-case filters, price ranges, sorting, and pagination.

## Configuration

The frontend uses `/api` by default. For a deployment where the API is hosted separately, set the Vite environment variable `VITE_API_URL` to the API base URL, for example `https://api.example.com/api`, before building the frontend.

## Project notes

- This is a portfolio/demo project, not a live store. Orders are for demonstration only.
- Product and setup-kit photos are illustrative category images and may not match the exact product model.
- A real payment provider and production contact channel are not configured.
