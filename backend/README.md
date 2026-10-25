
# SETUP LAB — Backend

The backend API for SETUP LAB, a web application for discovering electronics and ready-made workspace setups.

Built with Node.js using the native HTTP module. Product catalog data, categories, and setup kits are stored in JSON files.

## Requirements

- Node.js
- npm

## Getting Started

Install dependencies from the `backend` directory:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The API runs on `http://localhost:7070` by default.

To use a different port:

```bash
PORT=3000 npm start
```

On Windows PowerShell:

```powershell
$env:PORT=3000
npm start
```

## API Endpoints

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Get all product categories |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get products with filtering and pagination |
| GET | `/api/products/:id` | Get a product by ID |
| GET | `/api/top-sales` | Get featured products |

Supported query parameters for `GET /api/products`:

| Parameter | Description |
|---|---|
| `categoryId` | Filter by category ID |
| `q` | Search product text |
| `useCase` | Filter by intended use |
| `minPrice` | Minimum price |
| `maxPrice` | Maximum price |
| `sort` | Sort by `price-asc`, `price-desc`, or `title-asc` |
| `offset` | Number of products to skip |
| `limit` | Number of products to return; defaults to 6 |

Example:

```text
GET /api/products?categoryId=1&sort=price-asc&limit=6
```

The products endpoint returns an object containing `products` and `total`.

### Setup Kits

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/kits` | Get setup kits and their products |
| GET | `/api/kits/:id` | Get a setup kit by ID |

Optional query parameters for `GET /api/kits`:

- `purpose` — filter by intended use.
- `maxPrice` — maximum combined price of the kit's products.

Kit responses include the resolved product list and `totalPrice`.

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Validate and create an order |

Example request body:

```json
{
  "owner": {
    "phone": "+10000000000",
    "address": "Example address"
  },
  "items": [
    {
      "id": 1,
      "count": 2
    }
  ]
}
```

The server validates customer details, product availability, and quantities. Prices are calculated from the catalog rather than trusted from the request.

Successful requests return `201 Created` with an order ID and total.

Orders are stored in `src/data/orders.json`. This is a demonstration implementation; it does not include a payment provider or a production database.

## Data Files

The `src/data` directory contains:

- `categories.json` — product categories.
- `products.json` — product catalog.
- `kits.json` — predefined setup kits.
- `orders.json` — created orders, generated when the first order is saved.

## Testing

Run the automated API tests:

```bash
npm test
```

The tests cover categories, product search and filtering, featured products, setup kits, order validation, and unknown routes.

## Development Utilities

Run the server with simulated delays and intermittent errors:

```bash
npm run flaky
```

This is useful for testing frontend loading and error states.

Format source files with Prettier:

```bash
npm run lint
```