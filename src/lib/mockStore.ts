import type { Device, Alert, Room } from './types'
import { FAN_WATTAGE, LIGHT_WATTAGE } from './types'

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
  const states: Record<Room, Array<{ type: 'fan' | 'light'; num: number; on: boolean }>> = {
    drawing: [
      { type: 'fan', num: 1, on: true },
      { type: 'fan', num: 2, on: false },
      { type: 'light', num: 1, on: true },
      { type: 'light', num: 2, on: true },
      { type: 'light', num: 3, on: false },
    ],
    workroom1: [
      { type: 'fan', num: 1, on: false },
      { type: 'fan', num: 2, on: false },
      { type: 'light', num: 1, on: false },
      { type: 'light', num: 2, on: false },
      { type: 'light', num: 3, on: false },
    ],
    workroom2: [
      { type: 'fan', num: 1, on: true },
      { type: 'fan', num: 2, on: true },
      { type: 'light', num: 1, on: true },
      { type: 'light', num: 2, on: true },
      { type: 'light', num: 3, on: true },
    ],
  }

  for (const room of ROOMS) {
    for (const s of states[room]) {
      const onSince = s.on ? new Date(now - 20 * 60_000).toISOString() : null
      devices.push(makeDevice(room, s.type, s.num, s.on ? 'on' : 'off', onSince))
    }
  }
  return devices
}

type Listener = () => void

let devices = initialDevices()
let alerts: Alert[] = []
const listeners = new Set<Listener>()
let tickInterval: ReturnType<typeof setInterval> | null = null

function isOfficeHours(): boolean {
  const h = new Date().getHours()
  return h >= 9 && h < 17
}

function notify() {
  listeners.forEach((l) => l())
}

function randomToggle() {
  const idx = Math.floor(Math.random() * devices.length)
  const d = devices[idx]
  const officeHours = isOfficeHours()
  let turnOn: boolean

  if (officeHours) {
    turnOn = d.status === 'off' ? Math.random() < 0.6 : Math.random() < 0.4
  } else {
    turnOn = d.status === 'off' ? Math.random() < 0.1 : Math.random() < 0.7
  }

  const status = turnOn ? 'on' : 'off'
  const wattage = status === 'on' ? (d.type === 'fan' ? FAN_WATTAGE : LIGHT_WATTAGE) : 0
  devices = devices.map((dev) =>
    dev.id === d.id
      ? {
          ...dev,
          status,
          wattage,
          last_changed: new Date().toISOString(),
          on_since: status === 'on' ? new Date().toISOString() : null,
        }
      : dev,
  )
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
        if (Math.random() < 0.7) randomToggle()
      }, 18_000)
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

  setAlerts(next: Alert[]) {
    alerts = next
    notify()
  },
}
