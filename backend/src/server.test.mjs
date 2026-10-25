
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from './server.mjs'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataPath = path.join(__dirname, 'data')
const categories = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'categories.json'), 'utf-8')
)
const products = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'products.json'), 'utf-8')
)
const kits = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'kits.json'), 'utf-8')
)

const ordersPath = path.join(dataPath, 'orders.json')

describe('SETUP LAB API', () => {
  let server
  let baseUrl
  let previousOrders
  let ordersFileExisted

  before(async () => {
    ordersFileExisted = fs.existsSync(ordersPath)

    if (ordersFileExisted) {
      previousOrders = fs.readFileSync(ordersPath, 'utf-8')
    }

    server = createServer(0)

    await new Promise(resolve => server.once('listening', resolve))

    baseUrl = `http://localhost:${server.address().port}`
  })

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve))
    }

    if (ordersFileExisted) {
      fs.writeFileSync(ordersPath, previousOrders, 'utf-8')
    } else if (fs.existsSync(ordersPath)) {
      fs.unlinkSync(ordersPath)
    }
  })

  it('should set CORS headers', async () => {
    const res = await fetch(`${baseUrl}/api/products`)

    assert.equal(res.headers.get('access-control-allow-origin'), '*')
  })

  it('GET /api/categories should return all categories', async () => {
    const res = await fetch(`${baseUrl}/api/categories`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.deepEqual(data, categories)
  })

  it('GET /api/products should return paginated products and total', async () => {
    const res = await fetch(`${baseUrl}/api/products`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.equal(data.total, products.length)
    assert.ok(Array.isArray(data.products))
    assert.ok(data.products.length <= 6)
  })

  it('GET /api/products should filter by category', async () => {
    const categoryId = categories[0].id
    const res = await fetch(
        `${baseUrl}/api/products?categoryId=${categoryId}`
    )
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.ok(data.products.every(product => product.categoryId === categoryId))
  })

  it('GET /api/products should search by title', async () => {
    const product = products[0]
    const search = encodeURIComponent(product.title)

    const res = await fetch(`${baseUrl}/api/products?q=${search}`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.ok(data.products.some(item => item.id === product.id))
  })

  it('GET /api/products should sort by ascending price', async () => {
    const res = await fetch(
        `${baseUrl}/api/products?sort=price-asc&limit=50`
    )
    const data = await res.json()
    const prices = data.products.map(product => product.price)

    assert.equal(res.status, 200)
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
  })

  it('GET /api/products/:id should return product details', async () => {
    const product = products[0]
    const res = await fetch(`${baseUrl}/api/products/${product.id}`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.equal(data.id, product.id)
    assert.equal(data.title, product.title)
  })

  it('GET /api/products/:id should return 404 for unknown product', async () => {
    const res = await fetch(`${baseUrl}/api/products/999999`)

    assert.equal(res.status, 404)
  })

  it('GET /api/top-sales should return featured products', async () => {
    const res = await fetch(`${baseUrl}/api/top-sales`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(data))
    assert.ok(data.every(product => product.featured))
    assert.ok(data.length <= 6)
  })

  it('GET /api/kits should return setup kits with products', async () => {
    const res = await fetch(`${baseUrl}/api/kits`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.equal(data.length, kits.length)

    for (const kit of data) {
      assert.ok(Array.isArray(kit.products))
      assert.equal(typeof kit.totalPrice, 'number')
    }
  })

  it('GET /api/kits/:id should return one setup kit', async () => {
    const kit = kits[0]
    const res = await fetch(`${baseUrl}/api/kits/${kit.id}`)
    const data = await res.json()

    assert.equal(res.status, 200)
    assert.equal(data.id, kit.id)
    assert.ok(Array.isArray(data.products))
  })

  it('POST /api/orders should reject an empty order', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: { phone: '+10000000000', address: 'Test address' },
        items: []
      })
    })

    assert.equal(res.status, 400)
  })

  it('POST /api/orders should reject invalid customer data', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: { phone: '+10000000000' },
        items: [{ id: products[0].id, count: 1 }]
      })
    })

    assert.equal(res.status, 400)
  })

  it('POST /api/orders should create an order using catalog prices', async () => {
    const product = products.find(item => item.inStock)

    assert.ok(product, 'Test requires at least one in-stock product')

    const count = 2
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: {
          phone: '+10000000000',
          address: 'Test address'
        },
        items: [{
          id: product.id,
          price: 1,
          count
        }]
      })
    })

    const data = await res.json()

    assert.equal(res.status, 201)
    assert.equal(data.total, product.price * count)
    assert.ok(data.orderId)
  })

  it('should return 404 for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`)

    assert.equal(res.status, 404)
  })
})