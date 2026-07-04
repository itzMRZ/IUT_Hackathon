import type { Device } from './types'
import { FAN_WATTAGE, LIGHT_WATTAGE } from './types'

export function formatDuration(iso: string | null): string {
  if (!iso) return '0m'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return '0m'
  const mins = Math.floor(ms / 60_000)
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  if (hrs === 0) return `${rem}m`
  return `${hrs}h ${rem}m`
}

export function deviceDurationLabel(device: Device): string {
  if (device.status === 'on') {
    return formatDuration(device.on_since ?? device.last_changed)
  }
  return formatDuration(device.last_changed)
}

export function wattageFor(type: 'fan' | 'light', status: 'on' | 'off'): number {
  if (status === 'off') return 0
  return type === 'fan' ? FAN_WATTAGE : LIGHT_WATTAGE
}

export function patchDevice(device: Device, status: 'on' | 'off'): Device {
  const now = new Date().toISOString()
  return {
    ...device,
    status,
    wattage: wattageFor(device.type, status),
    last_changed: now,
    on_since: status === 'on' ? now : null,
  }
}
