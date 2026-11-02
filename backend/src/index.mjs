import { createServer } from './server.mjs'

createServer(Number(process.env.PORT) || 7070)
