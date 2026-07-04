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

function getWsUrl(): string {
  const env = import.meta.env.VITE_WS_URL
  if (env) return env
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}/ws`
}

interface OfficeData {
  devices: Device[]
  alerts: Alert[]
  loading: boolean
  connected: boolean
  source: 'websocket'
  autoSim: boolean
  toggleDevice: (id: string) => void
  applyPreset: (preset: string) => void
  setAutoSim: (enabled: boolean) => void
}

const OfficeContext = createContext<OfficeData | null>(null)

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [autoSim, setAutoSimState] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
  }, [])

  const applySnapshot = useCallback((snap: OfficeSnapshot) => {
    setDevices(snap.devices)
    setAlerts(snap.alerts)
    setAutoSimState(snap.autoSim)
    setLoading(false)
    setConnected(true)
  }, [])

  const toggleDevice = useCallback(
    (id: string) => send({ type: 'toggle', deviceId: id }),
    [send],
  )

  const applyPreset = useCallback(
    (preset: string) => send({ type: 'preset', preset }),
    [send],
  )

  const setAutoSim = useCallback(
    (enabled: boolean) => send({ type: 'setAutoSim', enabled }),
    [send],
  )

  useEffect(() => {
    let mounted = true
    let attempt = 0

    const connect = () => {
      if (!mounted) return
      const ws = new WebSocket(getWsUrl())
      wsRef.current = ws

      ws.onopen = () => {
        attempt = 0
        setConnected(true)
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as ServerMessage
          if (msg.type === 'snapshot') applySnapshot(msg.data)
        } catch {
          /* ignore malformed messages */
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (!mounted) return
        const delay = Math.min(1000 * 2 ** attempt, 15_000)
        attempt++
        reconnectRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      mounted = false
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
        source: 'websocket',
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
