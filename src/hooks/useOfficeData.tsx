import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Device, Alert, OfficeSnapshot, ClientMessage, ServerMessage } from '../lib/types'
import { SEED_SNAPSHOT } from '../lib/seed'
import { patchDevice } from '../lib/deviceUtils'

// In production (e.g. Vercel), the frontend is static and the WebSocket +
// REST server must run on a separate host (Railway, Render, Fly.io, etc.)
// since it needs a persistent process and in-memory state — neither of
// which serverless functions provide. Set VITE_API_URL / VITE_WS_URL to
// point at that host. Locally, both fall back to same-origin + Vite's dev
// proxy (see vite.config.ts). See DEPLOYMENT.md for the full guide.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

function getWsUrl(): string {
  const env = import.meta.env.VITE_WS_URL
  if (env) return env
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}/ws`
}

async function fetchSnapshot(): Promise<OfficeSnapshot | null> {
  try {
    const res = await fetch(apiUrl('/api/snapshot'))
    if (!res.ok) return null
    return res.json() as Promise<OfficeSnapshot>
  } catch {
    return null
  }
}

async function postAction(path: string, body: unknown): Promise<OfficeSnapshot | null> {
  try {
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return res.json() as Promise<OfficeSnapshot>
  } catch {
    return null
  }
}

interface OfficeData {
  devices: Device[]
  alerts: Alert[]
  loading: boolean
  connected: boolean
  autoSim: boolean
  toggleDevice: (id: string) => void
  applyPreset: (preset: string) => void
  setAutoSim: (enabled: boolean) => void
}

const OfficeContext = createContext<OfficeData | null>(null)

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(SEED_SNAPSHOT.devices)
  const [alerts, setAlerts] = useState<Alert[]>(SEED_SNAPSHOT.alerts)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [autoSim, setAutoSimState] = useState(SEED_SNAPSHOT.autoSim)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const applySnapshot = useCallback((snap: OfficeSnapshot) => {
    setDevices(snap.devices)
    setAlerts(snap.alerts)
    setAutoSimState(snap.autoSim)
    setLoading(false)
    setConnected(true)
  }, [])

  const sendToServer = useCallback(async (msg: ClientMessage) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
      return
    }

    let snap: OfficeSnapshot | null = null
    if (msg.type === 'toggle') snap = await postAction('/api/toggle', { deviceId: msg.deviceId })
    if (msg.type === 'preset') snap = await postAction('/api/preset', { preset: msg.preset })
    if (msg.type === 'setAutoSim') snap = await postAction('/api/autosim', { enabled: msg.enabled })
    if (snap) applySnapshot(snap)
  }, [applySnapshot])

  const toggleDevice = useCallback(
    (id: string) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id ? patchDevice(d, d.status === 'on' ? 'off' : 'on') : d,
        ),
      )
      void sendToServer({ type: 'toggle', deviceId: id })
    },
    [sendToServer],
  )

  const applyPreset = useCallback(
    (preset: string) => {
      void sendToServer({ type: 'preset', preset })
    },
    [sendToServer],
  )

  const setAutoSim = useCallback(
    (enabled: boolean) => {
      setAutoSimState(enabled)
      void sendToServer({ type: 'setAutoSim', enabled })
    },
    [sendToServer],
  )

  useEffect(() => {
    let mounted = true
    let attempt = 0

    const startPolling = () => {
      if (pollRef.current) return
      pollRef.current = setInterval(async () => {
        const snap = await fetchSnapshot()
        if (snap && mounted) applySnapshot(snap)
      }, 3000)
    }

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    fetchSnapshot().then((snap) => {
      if (snap && mounted) applySnapshot(snap)
    })

    const connect = () => {
      if (!mounted) return
      const ws = new WebSocket(getWsUrl())
      wsRef.current = ws

      ws.onopen = () => {
        attempt = 0
        stopPolling()
        setConnected(true)
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as ServerMessage
          if (msg.type === 'snapshot') applySnapshot(msg.data)
        } catch {
          /* ignore */
        }
      }

      ws.onclose = () => {
        setConnected(false)
        startPolling()
        if (!mounted) return
        const delay = Math.min(1000 * 2 ** attempt, 10_000)
        attempt++
        reconnectRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      mounted = false
      stopPolling()
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [applySnapshot])

  return (
    <OfficeContext.Provider
      value={{
        devices,
        alerts,
        loading,
        connected,
        autoSim,
        toggleDevice,
        applyPreset,
        setAutoSim,
      }}
    >
      {children}
    </OfficeContext.Provider>
  )
}

export function useOfficeData(): OfficeData {
  const ctx = useContext(OfficeContext)
  if (!ctx) throw new Error('useOfficeData must be used within OfficeProvider')
  return ctx
}
