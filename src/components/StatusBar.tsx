import { useEffect, useState } from 'react'
import { Fan, Lightbulb, ListChecks } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { deviceDurationLabel } from '../lib/deviceUtils'
import { ROOM_LABELS, type Device } from '../lib/types'

function StatusChip({ device, tick }: { device: Device; tick: number }) {
  void tick
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb
  const duration = deviceDurationLabel(device)
  const roomShort = ROOM_LABELS[device.room]
    .replace('Work Room ', 'WR')
    .replace('Drawing Room', 'Draw')

  return (
    <div
      className={`status-chip ${on ? 'status-chip--on' : ''}`}
      title={`${roomShort} ${device.label}: ${on ? 'ON' : 'OFF'} for ${duration}`}
    >
      <span className="status-chip__dot" />
      <Icon size={11} strokeWidth={2.25} aria-hidden />
      <span className="whitespace-nowrap font-medium">
        {roomShort} {device.label}
      </span>
      <span className="whitespace-nowrap opacity-60">{duration}</span>
    </div>
  )
}

export function StatusBar() {
  const { devices } = useOfficeData()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const sorted = [...devices].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'on' ? -1 : 1
    return a.room.localeCompare(b.room)
  })

  return (
    <div className="status-strip">
      <span className="status-strip__label">
        <ListChecks size={12} className="mr-1 inline" aria-hidden />
        Devices
      </span>
      <div className="scrollbar-thin flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
        {sorted.map((d) => (
          <StatusChip key={d.id} device={d} tick={tick} />
        ))}
      </div>
    </div>
  )
}
