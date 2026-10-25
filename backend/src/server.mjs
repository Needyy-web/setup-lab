import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { randomInt, randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataPath = path.join(__dirname, 'data')
const categoriesPath = path.join(dataPath, 'categories.json')
const productsPath = path.join(dataPath, 'products.json')
const kitsPath = path.join(dataPath, 'kits.json')
const ordersPath = path.join(dataPath, 'orders.json')

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
const kits = JSON.parse(fs.readFileSync(kitsPath, 'utf-8'))

const moreCount = 6

const config = {
  delay: process.env.APP_DELAY === 'true',
  error: process.env.APP_ERROR === 'true'
}

const parseRequestBody = req =>
    new Promise((resolve, reject) => {
      let body = ''
      let tooLarge = false

      req.on('data', chunk => {
        body += chunk.toString()

        if (body.length > 1_000_000) {
          tooLarge = true
          reject(new Error('Request body too large'))
          req.destroy()
        }
      })

      req.on('end', () => {
        if (tooLarge) return

        try {
          resolve(JSON.parse(body))
        } catch {
          reject(new Error('Invalid JSON'))
        }
      })

      req.on('error', reject)
    })

const setCorsHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const sendResponse = (res, statusCode, data = null) => {
  setCorsHeaders(res)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  })

  if (statusCode === 204) {
    return res.end()
  }

  res.end(JSON.stringify(data))
}

const readOrders = async () => {
  try {
    const data = await fs.promises.readFile(ordersPath, 'utf-8')
    const orders = JSON.parse(data)

    if (!Array.isArray(orders)) {
      throw new Error('Invalid orders data')
    }

    return orders
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

const saveOrder = async order => {
  const orders = await readOrders()
  orders.push(order)

  await fs.promises.writeFile(
      ordersPath,
      JSON.stringify(orders, null, 2),
      'utf-8'
  )
}

const getProductById = id =>
    products.find(product => product.id === id)

const getKitWithProducts = kit => {
  const kitProducts = kit.productIds
      .map(getProductById)
      .filter(Boolean)

  return {
    ...kit,
    products: kitProducts,
    totalPrice: kitProducts.reduce(
        (total, product) => total + product.price,
        0
    )
  }
}

const getFilteredProducts = query => {
  const categoryId = Number(query.categoryId || 0)
  const offset = Math.max(0, Number(query.offset) || 0)
  const limit = Math.min(
      50,
      Math.max(1, Number(query.limit) || moreCount)
  )

  const q = String(query.q || '').trim().toLowerCase()
  const useCase = String(query.useCase || '').trim()
  const minPrice = query.minPrice === undefined
      ? 0
      : Number(query.minPrice)
  const maxPrice = query.maxPrice === undefined
      ? Infinity
      : Number(query.maxPrice)

  let result = products.filter(product => {
    const matchesCategory =
        categoryId === 0 || product.categoryId === categoryId

    const searchableText = [
      product.title,
      product.brand,
      product.shortDescription,
      product.description,
      ...Object.entries(product.specifications || {}).flat()
    ].join(' ').toLowerCase()

    const matchesQuery = !q || searchableText.includes(q)
    const matchesUseCase =
        !useCase || product.useCases.includes(useCase)
    const matchesMinPrice = product.price >= minPrice
    const matchesMaxPrice = product.price <= maxPrice

    return (
        matchesCategory &&
        matchesQuery &&
        matchesUseCase &&
        matchesMinPrice &&
        matchesMaxPrice
    )
  })

  switch (query.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      break
  }

  return {
    total: result.length,
    products: result.slice(offset, offset + limit)
  }
}

const createServer = (port = 7070) => {
  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      return res.end()
    }

    if (config.delay) {
      await setTimeout(randomInt(100, 60_000))
    }

    if (config.error && Math.random() > 0.8) {
      return sendResponse(res, 500, {
        error: 'Internal server error'
      })
    }

    try {
      const parsedUrl = new URL(
          req.url,
          `http://${req.headers.host || 'localhost'}`
      )

      const pathname = decodeURIComponent(parsedUrl.pathname)
      const query = Object.fromEntries(parsedUrl.searchParams)

      // Categories
      if (
          pathname === '/api/categories' &&
          req.method === 'GET'
      ) {
        return sendResponse(res, 200, categories)
      }

      // Product catalog
      if (
          ['/api/products', '/api/items'].includes(pathname) &&
          req.method === 'GET'
      ) {
        const result = getFilteredProducts(query)

        // Legacy endpoint returns an array for the old catalog.
        if (pathname === '/api/items') {
          return sendResponse(res, 200, result.products)
        }

        return sendResponse(res, 200, result)
      }

      // Featured products
      if (
          pathname === '/api/top-sales' &&
          req.method === 'GET'
      ) {
        const featuredProducts = products
            .filter(product => product.featured)
            .slice(0, moreCount)

        return sendResponse(res, 200, featuredProducts)
      }

      // Single product
      const productMatch = pathname.match(
          /^\/api\/(products|items)\/(\d+)$/
      )

      if (productMatch && req.method === 'GET') {
        const id = Number(productMatch[2])
        const product = getProductById(id)

        return product
            ? sendResponse(res, 200, product)
            : sendResponse(res, 404, { error: 'Product not found' })
      }

      // Setup kits
      if (
          pathname === '/api/kits' &&
          req.method === 'GET'
      ) {
        const purpose = query.purpose
        const maxPrice = query.maxPrice === undefined
            ? Infinity
            : Number(query.maxPrice)

        const result = kits
            .filter(kit => !purpose || kit.purpose === purpose)
            .map(getKitWithProducts)
            .filter(kit => kit.totalPrice <= maxPrice)

        return sendResponse(res, 200, result)
      }

      // Single setup kit
      const kitMatch = pathname.match(/^\/api\/kits\/(\d+)$/)

      if (kitMatch && req.method === 'GET') {
        const id = Number(kitMatch[1])
        const kit = kits.find(item => item.id === id)

        return kit
            ? sendResponse(res, 200, getKitWithProducts(kit))
            : sendResponse(res, 404, { error: 'Setup kit not found' })
      }

      // Create order
      if (
          ['/api/orders', '/api/order'].includes(pathname) &&
          req.method === 'POST'
      ) {
        const body = await parseRequestBody(req)

        const owner = body?.owner
        const orderItems = body?.items

        if (
            !owner ||
            typeof owner.phone !== 'string' ||
            !owner.phone.trim() ||
            typeof owner.address !== 'string' ||
            !owner.address.trim()
        ) {
          return sendResponse(res, 400, {
            error: 'Valid phone and address are required'
          })
        }

        if (
            !Array.isArray(orderItems) ||
            orderItems.length === 0
        ) {
          return sendResponse(res, 400, {
            error: 'Order must contain at least one product'
          })
        }

        const validatedItems = []

        for (const item of orderItems) {
          if (
              !Number.isInteger(item.id) ||
              !Number.isInteger(item.count) ||
              item.count < 1 ||
              item.count > 99
          ) {
            return sendResponse(res, 400, {
              error: 'Invalid product ID or quantity'
            })
          }

          const product = getProductById(item.id)

          if (!product || !product.inStock) {
            return sendResponse(res, 400, {
              error: `Product ${item.id} is unavailable`
            })
          }

          validatedItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            count: item.count,
            image: product.images[0] || ''
          })
        }

        const total = validatedItems.reduce(
            (sum, item) => sum + item.price * item.count,
            0
        )

        const order = {
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          owner: {
            phone: owner.phone.trim(),
            address: owner.address.trim()
          },
          items: validatedItems,
          total
        }

        await saveOrder(order)

        return sendResponse(res, 201, {
          message: 'Order created',
          orderId: order.id,
          total: order.total
        })
      }

      return sendResponse(res, 404, {
        error: 'Not found'
      })
    } catch (error) {
      console.error(error)

      if (!res.headersSent && !res.destroyed) {
        const isInvalidRequest =
            error.message === 'Invalid JSON' ||
            error.message === 'Request body too large'

        return sendResponse(
            res,
            isInvalidRequest ? 400 : 500,
            {
              error: isInvalidRequest
                  ? error.message
                  : 'Internal server error'
            }
        )
      }
    }
  })

  server.listen(port, () => {
    console.log(`SETUP LAB API running on port ${port}`)
  })

  return server
}

export { createServer }