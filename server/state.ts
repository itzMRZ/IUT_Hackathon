import type { Device, Alert, Room, OfficeSnapshot } from '../shared/types.js'
import { FAN_WATTAGE, LIGHT_WATTAGE, ROOM_LABELS } from '../shared/types.js'

const ROOMS: Room[] = ['drawing', 'workroom1', 'workroom2']

function wattageFor(type: 'fan' | 'light', status: 'on' | 'off') {
  if (status === 'off') return 0
  return type === 'fan' ? FAN_WATTAGE : LIGHT_WATTAGE
}

function makeDevice(
  room: Room,
  type: 'fan' | 'light',
  num: number,
  status: 'on' | 'off',
  onSince: string | null,
  lastChanged: string,
): Device {
  return {
    id: `${room}-${type}-${num}`,
    type,
    room,
    label: `${type === 'fan' ? 'Fan' : 'Light'} ${num}`,
    status,
    wattage: wattageFor(type, status),
    last_changed: lastChanged,
    on_since: onSince,
  }
}

function seedDevices(): Device[] {
  const now = Date.now()
  const ago = (m: number) => new Date(now - m * 60_000).toISOString()
  const specs: Array<{ room: Room; type: 'fan' | 'light'; num: number; on: boolean; mins: number }> = [
    { room: 'drawing', type: 'fan', num: 1, on: true, mins: 85 },
    { room: 'drawing', type: 'fan', num: 2, on: false, mins: 120 },
    { room: 'drawing', type: 'light', num: 1, on: true, mins: 45 },
    { room: 'drawing', type: 'light', num: 2, on: true, mins: 30 },
    { room: 'drawing', type: 'light', num: 3, on: false, mins: 90 },
    { room: 'workroom1', type: 'fan', num: 1, on: false, mins: 200 },
    { room: 'workroom1', type: 'fan', num: 2, on: false, mins: 200 },
    { room: 'workroom1', type: 'light', num: 1, on: false, mins: 180 },
    { room: 'workroom1', type: 'light', num: 2, on: false, mins: 180 },
    { room: 'workroom1', type: 'light', num: 3, on: false, mins: 180 },
    { room: 'workroom2', type: 'fan', num: 1, on: true, mins: 135 },
    { room: 'workroom2', type: 'fan', num: 2, on: true, mins: 130 },
    { room: 'workroom2', type: 'light', num: 1, on: true, mins: 125 },
    { room: 'workroom2', type: 'light', num: 2, on: true, mins: 125 },
    { room: 'workroom2', type: 'light', num: 3, on: true, mins: 125 },
  ]
  return specs.map((s) => {
    const ts = ago(s.mins)
    return makeDevice(s.room, s.type, s.num, s.on ? 'on' : 'off', s.on ? ts : null, ts)
  })
}

function isOfficeHours() {
  const h = new Date().getHours()
  return h >= 9 && h < 17
}

function patchDevice(d: Device, status: 'on' | 'off'): Device {
  const now = new Date().toISOString()
  return {
    ...d,
    status,
    wattage: wattageFor(d.type, status),
    last_changed: now,
    on_since: status === 'on' ? now : null,
  }
}

type Listener = (snapshot: OfficeSnapshot) => void

export class OfficeState {
  private devices: Device[] = seedDevices()
  private alerts: Alert[] = [
    {
      id: 'alert-seed-1',
      message: 'Work Room 2 has been fully on for over 2 hours',
      severity: 'warning',
      room: 'workroom2',
      rule_type: 'room_stuck',
      created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    },
  ]
  private autoSim = true
  private listeners = new Set<Listener>()

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.snapshot())
    return () => this.listeners.delete(fn)
  }

  snapshot(): OfficeSnapshot {
    return {
      devices: [...this.devices],
      alerts: [...this.alerts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      autoSim: this.autoSim,
    }
  }

  private emit() {
    const snap = this.snapshot()
    this.listeners.forEach((fn) => fn(snap))
  }

  toggleDevice(id: string) {
    this.devices = this.devices.map((d) =>
      d.id === id ? patchDevice(d, d.status === 'on' ? 'off' : 'on') : d,
    )
    this.emit()
  }

  setAutoSim(enabled: boolean) {
    this.autoSim = enabled
    this.emit()
  }

  applyPreset(preset: string) {
    const now = Date.now()
    const ago = (m: number) => new Date(now - m * 60_000).toISOString()

    switch (preset) {
      case 'office_busy':
        this.devices = this.devices.map((d) => {
          const on = Math.random() < 0.65
          const ts = ago(Math.floor(Math.random() * 90) + 10)
          const p = patchDevice(d, on ? 'on' : 'off')
          return { ...p, on_since: on ? ts : null, last_changed: ts }
        })
        break
      case 'after_hours':
        this.devices = this.devices.map((d) => {
          const on = d.id === 'drawing-fan-2' || d.id === 'drawing-light-1'
          const ts = ago(35)
          const p = patchDevice(d, on ? 'on' : 'off')
          return { ...p, on_since: on ? ts : null, last_changed: ts }
        })
        this.alerts = [
          {
            id: `alert-${Date.now()}`,
            message: 'Drawing Room devices on outside office hours',
            severity: 'warning',
            room: 'drawing',
            rule_type: 'after_hours',
            created_at: new Date().toISOString(),
          },
        ]
        break
      case 'all_off':
        this.devices = this.devices.map((d) => patchDevice(d, 'off'))
        this.alerts = []
        break
      case 'room_stuck':
        this.devices = this.devices.map((d) => {
          if (d.room !== 'workroom2') return patchDevice(d, 'off')
          const ts = ago(135)
          return { ...patchDevice(d, 'on'), on_since: ts, last_changed: ts }
        })
        this.alerts = [
          {
            id: `alert-${Date.now()}`,
            message: 'Work Room 2 has been fully on for over 2 hours',
            severity: 'warning',
            room: 'workroom2',
            rule_type: 'room_stuck',
            created_at: new Date().toISOString(),
          },
        ]
        break
      case 'drawing_only':
        this.devices = this.devices.map((d) => {
          const on = d.room === 'drawing' && (d.type === 'light' ? d.label !== 'Light 3' : d.label === 'Fan 1')
          const ts = ago(25)
          const p = patchDevice(d, on ? 'on' : 'off')
          return { ...p, on_since: on ? ts : null, last_changed: ts }
        })
        break
    }
    this.emit()
  }

  runSimTick() {
    if (!this.autoSim) return

    const count = Math.random() < 0.5 ? 1 : 2
    const picks = [...this.devices].sort(() => Math.random() - 0.5).slice(0, count)
    const officeHours = isOfficeHours()

    for (const d of picks) {
      let turnOn: boolean
      if (officeHours) {
        turnOn = d.status === 'off' ? Math.random() < 0.55 : Math.random() < 0.35
      } else {
        turnOn = d.status === 'off' ? Math.random() < 0.08 : Math.random() < 0.65
      }
      const status = turnOn ? 'on' : 'off'
      if (status === d.status) continue
      this.devices = this.devices.map((dev) => (dev.id === d.id ? patchDevice(dev, status) : dev))
    }

    this.checkAlerts()
    this.emit()
  }

  private hasRecentAlert(ruleType: string, room: Room | null) {
    const cutoff = Date.now() - 60 * 60_000
    return this.alerts.some(
      (a) => a.rule_type === ruleType && a.room === room && new Date(a.created_at).getTime() > cutoff,
    )
  }

  private checkAlerts() {
    const officeHours = isOfficeHours()

    if (!officeHours) {
      for (const d of this.devices) {
        if (d.status !== 'on') continue
        if (this.hasRecentAlert('after_hours', d.room)) continue
        this.alerts.unshift({
          id: `alert-${Date.now()}-${d.id}`,
          message: `${ROOM_LABELS[d.room]} ${d.label} is on outside office hours (9 AM - 5 PM)`,
          severity: 'warning',
          room: d.room,
          rule_type: 'after_hours',
          created_at: new Date().toISOString(),
        })
      }
    }

    for (const room of ROOMS) {
      const roomDevices = this.devices.filter((d) => d.room === room)
      if (roomDevices.length !== 5) continue
      if (!roomDevices.every((d) => d.status === 'on')) continue
      const twoHoursAgo = Date.now() - 2 * 60 * 60_000
      if (!roomDevices.every((d) => d.on_since && new Date(d.on_since).getTime() <= twoHoursAgo)) continue
      if (this.hasRecentAlert('room_stuck', room)) continue
      this.alerts.unshift({
        id: `alert-${Date.now()}-${room}`,
        message: `${ROOM_LABELS[room]} has been fully on for over 2 hours`,
        severity: 'warning',
        room,
        rule_type: 'room_stuck',
        created_at: new Date().toISOString(),
      })
    }

    this.alerts = this.alerts.slice(0, 30)
  }

  totalWattage() {
    return this.devices.reduce((s, d) => s + d.wattage, 0)
  }

  wattageByRoom() {
    return this.devices.reduce(
      (acc, d) => {
        acc[d.room] += d.wattage
        return acc
      },
      { drawing: 0, workroom1: 0, workroom2: 0 } as Record<Room, number>,
    )
  }

  formatStatus(): string {
    return ROOMS.map((room) => {
      const devs = this.devices.filter((d) => d.room === room)
      const on = devs.filter((d) => d.status === 'on')
      const parts = on.length
        ? on.map((d) => `${d.label.toLowerCase()} on`).join(', ')
        : 'all off'
      return `${ROOM_LABELS[room]}: ${parts}`
    }).join('. ')
  }

  formatRoom(roomKey: string): string {
    const room = roomKey.toLowerCase().replace(/\s+/g, '') as Room
    const aliases: Record<string, Room> = {
      drawing: 'drawing',
      drawingroom: 'drawing',
      workroom1: 'workroom1',
      wr1: 'workroom1',
      workroom2: 'workroom2',
      wr2: 'workroom2',
    }
    const resolved = aliases[room] ?? (ROOMS.includes(room as Room) ? (room as Room) : null)
    if (!resolved) return `Unknown room "${roomKey}". Try drawing, workroom1, or workroom2.`

    const devs = this.devices.filter((d) => d.room === resolved)
    const lines = devs.map((d) => `${d.label}: ${d.status.toUpperCase()} (${d.wattage}W)`)
    return `${ROOM_LABELS[resolved]} - ${lines.join(', ')}`
  }

  formatUsage(): string {
    const total = this.totalWattage()
    const byRoom = this.wattageByRoom()
    const roomParts = ROOMS.map((r) => `${ROOM_LABELS[r]} ${byRoom[r]}W`).join(', ')
    return `Total power right now: ${total}W. ${roomParts}.`
  }
}
