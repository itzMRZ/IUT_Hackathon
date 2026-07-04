import 'dotenv/config'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { WebSocketServer, type WebSocket } from 'ws'
import { OfficeState } from './state.js'
import { notifyDiscordWebhook } from './discordWebhook.js'
import type { ClientMessage, OfficeSnapshot, ServerMessage } from '../shared/types.js'

const PORT = Number(process.env.PORT ?? 3001)
const state = new OfficeState()

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
}

function broadcast(msg: ServerMessage) {
  wss.clients.forEach((client) => send(client, msg))
}

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(data))
}

async function handleApi(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (url.pathname === '/api/health') {
    return json(res, 200, { ok: true })
  }

  if (url.pathname === '/api/snapshot') {
    return json(res, 200, state.snapshot())
  }

  if (url.pathname === '/api/usage') {
    return json(res, 200, {
      total: state.totalWattage(),
      byRoom: state.wattageByRoom(),
      text: state.formatUsage(),
    })
  }

  if (url.pathname === '/api/status') {
    return json(res, 200, { text: state.formatStatus() })
  }

  const roomMatch = url.pathname.match(/^\/api\/room\/([^/]+)$/)
  if (roomMatch && req.method === 'GET') {
    return json(res, 200, { text: state.formatRoom(decodeURIComponent(roomMatch[1])) })
  }

  if (url.pathname === '/api/toggle' && req.method === 'POST') {
    const body = (await parseBody(req)) as { deviceId?: string }
    if (!body.deviceId) return json(res, 400, { error: 'deviceId required' })
    state.toggleDevice(body.deviceId)
    return json(res, 200, state.snapshot())
  }

  if (url.pathname === '/api/preset' && req.method === 'POST') {
    const body = (await parseBody(req)) as { preset?: string }
    if (!body.preset) return json(res, 400, { error: 'preset required' })
    state.applyPreset(body.preset)
    return json(res, 200, state.snapshot())
  }

  if (url.pathname === '/api/autosim' && req.method === 'POST') {
    const body = (await parseBody(req)) as { enabled?: boolean }
    state.setAutoSim(Boolean(body.enabled))
    return json(res, 200, state.snapshot())
  }

  json(res, 404, { error: 'Not found' })
}

const httpServer = createServer((req, res) => {
  handleApi(req, res).catch((err) => {
    console.error(err)
    json(res, 500, { error: 'Internal error' })
  })
})

const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

let prevSnapshot: OfficeSnapshot | null = null
let skipWebhook = true

state.subscribe((snap) => {
  broadcast({ type: 'snapshot', data: snap })

  if (skipWebhook) {
    skipWebhook = false
    prevSnapshot = snap
    return
  }

  if (prevSnapshot) {
    void notifyDiscordWebhook(prevSnapshot, snap)
  }
  prevSnapshot = snap
})

wss.on('connection', (ws) => {
  send(ws, { type: 'snapshot', data: state.snapshot() })

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as ClientMessage
      if (msg.type === 'toggle') state.toggleDevice(msg.deviceId)
      if (msg.type === 'preset') state.applyPreset(msg.preset)
      if (msg.type === 'setAutoSim') state.setAutoSim(msg.enabled)
    } catch {
      /* ignore bad messages */
    }
  })
})

setInterval(() => state.runSimTick(), 18_000)

httpServer.listen(PORT, () => {
  console.log(`Office server running on http://localhost:${PORT}`)
  console.log(`WebSocket: ws://localhost:${PORT}/ws`)
  console.log(`REST API:  http://localhost:${PORT}/api/snapshot`)
  if (process.env.DISCORD_WEBHOOK_URL) {
    console.log('Discord webhook: enabled')
  } else {
    console.log('Discord webhook: disabled (set DISCORD_WEBHOOK_URL in .env)')
  }
})
