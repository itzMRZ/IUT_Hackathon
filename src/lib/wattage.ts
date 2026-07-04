import type { Device, Room } from './types'

export function totalWattage(devices: Device[]): number {
  return devices.reduce((sum, d) => sum + d.wattage, 0)
}

export function wattageByRoom(devices: Device[]): Record<Room, number> {
  return devices.reduce(
    (acc, d) => {
      acc[d.room] += d.wattage
      return acc
    },
    { drawing: 0, workroom1: 0, workroom2: 0 } as Record<Room, number>,
  )
}
