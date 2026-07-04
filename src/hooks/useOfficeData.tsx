import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore } from '../lib/mockStore'
import type { Device, Alert } from '../lib/types'

interface OfficeData {
  devices: Device[]
  alerts: Alert[]
  loading: boolean
  connected: boolean
  source: 'supabase' | 'mock'
}

const OfficeContext = createContext<OfficeData | null>(null)

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const sync = () => {
        setDevices(mockStore.getDevices())
        setAlerts(mockStore.getAlerts())
        setLoading(false)
        setConnected(true)
      }
      sync()
      return mockStore.subscribe(sync)
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
