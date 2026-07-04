import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

function DeviceRow({ device }: { device: Device }) {
  const Icon = device.type === 'fan' ? Fan : Lightbulb
  const on = device.status === 'on'

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-surface)]/50">
      <div className="flex items-center gap-2.5">
        <Icon
          size={16}
          className={on ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}
        />
        <span className="text-sm text-[var(--color-text)]">{device.label}</span>
      </div>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          on
            ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
            : 'bg-[var(--color-border)]/50 text-[var(--color-text-muted)]'
        }`}
      >
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

function RoomGroup({ room, devices }: { room: Room; devices: Device[] }) {
  const roomDevices = devices.filter((d) => d.room === room)
  const onCount = roomDevices.filter((d) => d.status === 'on').length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{ROOM_LABELS[room]}</h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {onCount}/{roomDevices.length} on
        </span>
      </div>
      <div className="space-y-1">
        {roomDevices.map((d) => (
          <DeviceRow key={d.id} device={d} />
        ))}
      </div>
    </div>
  )
}

export function DevicePanel() {
  const { devices } = useOfficeData()

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Device Status</h2>
      <div className="space-y-5">
        {ROOM_ORDER.map((room) => (
          <RoomGroup key={room} room={room} devices={devices} />
        ))}
      </div>
    </section>
  )
}
