import { createServer } from 'http'
import next from 'next'
import { WebSocketServer } from 'ws'
import { attachGameServer } from './src/server/gameServer.mjs'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

await app.prepare()

const server = createServer((req, res) => {
  handle(req, res)
})

const wss = new WebSocketServer({ noServer: true })
attachGameServer(wss)

server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, 'http://localhost').pathname
  if (pathname !== '/ws') return
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req)
  })
})

server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`)
})
