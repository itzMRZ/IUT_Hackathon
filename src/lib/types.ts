export type DeviceType = 'fan' | 'light'
export type Room = 'drawing' | 'workroom1' | 'workroom2'
export type DeviceStatus = 'on' | 'off'
export type AlertSeverity = 'info' | 'warning'
export type AlertRule = 'after_hours' | 'room_stuck'

export interface Device {
  id: string
  type: DeviceType
  room: Room
  label: string
  status: DeviceStatus
  wattage: number
  last_changed: string
  on_since: string | null
}

export interface Alert {
  id: string
  message: string
  severity: AlertSeverity
  room: Room | null
  rule_type: AlertRule
  created_at: string
}

export const ROOM_LABELS: Record<Room, string> = {
  drawing: 'Drawing Room',
  workroom1: 'Work Room 1',
  workroom2: 'Work Room 2',
}

export const ROOM_ORDER: Room[] = ['drawing', 'workroom1', 'workroom2']

export const FAN_WATTAGE = 60
export const LIGHT_WATTAGE = 15
