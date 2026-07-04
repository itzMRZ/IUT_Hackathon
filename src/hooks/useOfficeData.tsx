import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore } from '../lib/mockStore'
import { patchDevice } from '../lib/deviceUtils'
import type { Device, Alert } from '../lib/types'

interface OfficeData {
  devices: Device[]
  alerts: Alert[]
  loading: boolean
  connected: boolean
  source: 'supabase' | 'mock'
  autoSim: boolean
  toggleDevice: (id: string) => Promise<void>
  applyPreset: (preset: string) => Promise<void>
  setAutoSim: (enabled: boolean) => void
}

const OfficeContext = createContext<OfficeData | null>(null)

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [autoSim, setAutoSimState] = useState(true)

  const loadSnapshot = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return

    const [devRes, alertRes] = await Promise.all([
      supabase.from('devices').select('*').order('room').order('type').order('label'),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20),
    ])

    if (devRes.data) setDevices(devRes.data as Device[])
    if (alertRes.data) setAlerts(alertRes.data as Alert[])
    setLoading(false)
    setConnected(true)
  }, [])

  const toggleDevice = useCallback(async (id: string) => {
    if (!isSupabaseConfigured || !supabase) {
      mockStore.toggleDevice(id)
      return
    }
    const device = devices.find((d) => d.id === id)
    if (!device) return
    const next = patchDevice(device, device.status === 'on' ? 'off' : 'on')
    await supabase.from('devices').update({
      status: next.status,
      wattage: next.wattage,
      last_changed: next.last_changed,
      on_since: next.on_since,
    }).eq('id', id)
  }, [devices])

  const applyPreset = useCallback(async (preset: string) => {
    if (!isSupabaseConfigured || !supabase) {
      mockStore.applyPreset(preset)
      return
    }
    // Supabase presets: delegate to mock logic then bulk upsert would need service role;
    // for demo UI use mock-style local apply via sequential updates
    mockStore.applyPreset(preset)
    await loadSnapshot()
  }, [loadSnapshot])

  const setAutoSim = useCallback((enabled: boolean) => {
    setAutoSimState(enabled)
    mockStore.setAutoSim(enabled)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const sync = () => {
        setDevices(mockStore.getDevices())
        setAlerts(mockStore.getAlerts())
        setAutoSimState(mockStore.isAutoSim())
        setLoading(false)
        setConnected(true)
      }
      sync()
      const interval = setInterval(sync, 1000)
      const unsub = mockStore.subscribe(sync)
      return () => {
        unsub()
        clearInterval(interval)
      }
    }

    loadSnapshot()

    const devChannel = supabase
      .channel('devices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        const row = payload.new as Device
        setDevices((prev) => {
          const idx = prev.findIndex((d) => d.id === row.id)
          if (idx === -1) return [...prev, row]
          const next = [...prev]
          next[idx] = row
          return next
        })
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))

    const alertChannel = supabase
      .channel('alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const row = payload.new as Alert
        setAlerts((prev) => [row, ...prev].slice(0, 20))
      })
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(devChannel)
        supabase.removeChannel(alertChannel)
      }
    }
  }, [loadSnapshot])

  return (
    <OfficeContext.Provider
      value={{
        devices,
        alerts,
        loading,
        connected,
        source: isSupabaseConfigured ? 'supabase' : 'mock',
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
