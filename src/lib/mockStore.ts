import type { Device, Alert, Room } from './types'
import { FAN_WATTAGE, LIGHT_WATTAGE } from './types'
import { patchDevice } from './deviceUtils'

const ROOMS: Room[] = ['drawing', 'workroom1', 'workroom2']

function makeDevice(
  room: Room,
  type: 'fan' | 'light',
  num: number,
  status: 'on' | 'off',
  onSince: string | null,
): Device {
  const id = `${room}-${type}-${num}`
  const wattage = status === 'on' ? (type === 'fan' ? FAN_WATTAGE : LIGHT_WATTAGE) : 0
  return {
    id,
    type,
    room,
    label: `${type === 'fan' ? 'Fan' : 'Light'} ${num}`,
    status,
    wattage,
    last_changed: new Date().toISOString(),
    on_since: onSince,
  }
}

function initialDevices(): Device[] {
  const devices: Device[] = []
  const now = Date.now()
  const states: Record<Room, Array<{ type: 'fan' | 'light'; num: number; on: boolean; minsAgo?: number }>> = {
    drawing: [
      { type: 'fan', num: 1, on: true, minsAgo: 85 },
      { type: 'fan', num: 2, on: false, minsAgo: 120 },
      { type: 'light', num: 1, on: true, minsAgo: 45 },
      { type: 'light', num: 2, on: true, minsAgo: 30 },
      { type: 'light', num: 3, on: false, minsAgo: 90 },
    ],
    workroom1: [
      { type: 'fan', num: 1, on: false, minsAgo: 200 },
      { type: 'fan', num: 2, on: false, minsAgo: 200 },
      { type: 'light', num: 1, on: false, minsAgo: 180 },
      { type: 'light', num: 2, on: false, minsAgo: 180 },
      { type: 'light', num: 3, on: false, minsAgo: 180 },
    ],
    workroom2: [
      { type: 'fan', num: 1, on: true, minsAgo: 135 },
      { type: 'fan', num: 2, on: true, minsAgo: 130 },
      { type: 'light', num: 1, on: true, minsAgo: 125 },
      { type: 'light', num: 2, on: true, minsAgo: 125 },
      { type: 'light', num: 3, on: true, minsAgo: 125 },
    ],
  }

  for (const room of ROOMS) {
    for (const s of states[room]) {
      const ago = (s.minsAgo ?? 20) * 60_000
      const ts = new Date(now - ago).toISOString()
      const d = makeDevice(room, s.type, s.num, s.on ? 'on' : 'off', s.on ? ts : null)
      d.last_changed = ts
      devices.push(d)
    }
  }
  return devices
}

type Listener = () => void

let devices = initialDevices()
let alerts: Alert[] = []
const listeners = new Set<Listener>()
let tickInterval: ReturnType<typeof setInterval> | null = null
let autoSimEnabled = true

function isOfficeHours(): boolean {
  const h = new Date().getHours()
  return h >= 9 && h < 17
}

function notify() {
  listeners.forEach((l) => l())
}

function randomToggle() {
  if (!autoSimEnabled) return
  const idx = Math.floor(Math.random() * devices.length)
  const d = devices[idx]
  const officeHours = isOfficeHours()
  let turnOn: boolean

  if (officeHours) {
    turnOn = d.status === 'off' ? Math.random() < 0.55 : Math.random() < 0.35
  } else {
    turnOn = d.status === 'off' ? Math.random() < 0.08 : Math.random() < 0.65
  }

  const status = turnOn ? 'on' : 'off'
  devices = devices.map((dev) => (dev.id === d.id ? patchDevice(dev, status) : dev))
  notify()
}

export const mockStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    if (!tickInterval) {
      if (alerts.length === 0) {
        alerts = [
          {
            id: 'mock-1',
            message: 'Work Room 2 has been fully on for over 2 hours',
            severity: 'warning',
            room: 'workroom2',
            rule_type: 'room_stuck',
            created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
          },
        ]
      }
      tickInterval = setInterval(() => {
        if (Math.random() < 0.5) randomToggle()
      }, 22_000)
    }
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0 && tickInterval) {
        clearInterval(tickInterval)
        tickInterval = null
      }
    }
  },

  getDevices(): Device[] {
    return [...devices]
  },

  getAlerts(): Alert[] {
    return [...alerts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  },

  toggleDevice(id: string) {
    devices = devices.map((d) => {
      if (d.id !== id) return d
      return patchDevice(d, d.status === 'on' ? 'off' : 'on')
    })
    notify()
  },

  setAutoSim(enabled: boolean) {
    autoSimEnabled = enabled
    notify()
  },

  isAutoSim(): boolean {
    return autoSimEnabled
  },

  applyPreset(preset: string) {
    const now = Date.now()
    const ago = (mins: number) => new Date(now - mins * 60_000).toISOString()

    switch (preset) {
      case 'office_busy':
        devices = devices.map((d) => {
          const on = Math.random() < 0.65
          const patched = patchDevice(d, on ? 'on' : 'off')
          const ts = ago(Math.floor(Math.random() * 90) + 10)
          return { ...patched, on_since: on ? ts : null, last_changed: ts }
        })
        break
      case 'after_hours':
        devices = devices.map((d) => {
          const on = d.id === 'drawing-fan-2' || d.id === 'drawing-light-1'
          const patched = patchDevice(d, on ? 'on' : 'off')
          const ts = ago(35)
          return { ...patched, on_since: on ? ts : null, last_changed: ts }
        })
        alerts = [
          {
            id: `mock-${Date.now()}`,
            message: 'Drawing Room devices on outside office hours',
            severity: 'warning',
            room: 'drawing',
            rule_type: 'after_hours',
            created_at: new Date().toISOString(),
          },
        ]
        break
      case 'all_off':
        devices = devices.map((d) => patchDevice(d, 'off'))
        alerts = []
        break
      case 'room_stuck':
        devices = devices.map((d) => {
          if (d.room !== 'workroom2') return patchDevice(d, 'off')
          const ts = ago(135)
          return { ...patchDevice(d, 'on'), on_since: ts, last_changed: ts }
        })
        alerts = [
          {
            id: `mock-${Date.now()}`,
            message: 'Work Room 2 has been fully on for over 2 hours',
            severity: 'warning',
            room: 'workroom2',
            rule_type: 'room_stuck',
            created_at: new Date().toISOString(),
          },
        ]
        break
      case 'drawing_only':
        devices = devices.map((d) => {
          const on = d.room === 'drawing' && (d.type === 'light' ? d.label !== 'Light 3' : d.label === 'Fan 1')
          const patched = patchDevice(d, on ? 'on' : 'off')
          const ts = ago(25)
          return { ...patched, on_since: on ? ts : null, last_changed: ts }
        })
        break
      default:
        break
    }
    notify()
  },
}
