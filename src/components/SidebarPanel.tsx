import { Fan, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

function DeviceChip({ device }: { device: Device }) {
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <div
      title={`${device.label}: ${on ? 'ON' : 'OFF'}`}
      className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-semibold ${
        on
          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
      }`}
    >
      <Icon size={11} className={on ? 'text-emerald-600' : 'text-slate-400'} />
      <span className="truncate max-w-[52px]">{device.label.replace('Light', 'L').replace('Fan', 'F')}</span>
      <span className={`rounded px-1 text-[9px] ${on ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

function RoomCard({ room, devices }: { room: Room; devices: Device[] }) {
  const roomDevices = devices.filter((d) => d.room === room)
  const onCount = roomDevices.filter((d) => d.status === 'on').length

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-2.5 shadow-[var(--shadow-sm)]">
      <div className="mb-2 flex items-center justify-between gap-1">
        <h3 className="text-xs font-bold text-[var(--color-text)] truncate">{ROOM_LABELS[room]}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            onCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {onCount}/{roomDevices.length} on
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {roomDevices.map((d) => (
          <DeviceChip key={d.id} device={d} />
        ))}
      </div>
    </div>
  )
}

export function SidebarPanel() {
  const { alerts, devices } = useOfficeData()

  return (
    <aside className="flex h-full min-h-0 flex-col gap-2">
      <div className="shrink-0">
        <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          By Room
        </p>
        <div className="grid grid-cols-1 gap-2">
          {ROOM_ORDER.map((room) => (
            <RoomCard key={room} room={room} devices={devices} />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[var(--color-border)] bg-white p-2.5 shadow-[var(--shadow-sm)]">
        <p className="mb-1.5 shrink-0 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Alerts
        </p>
        {alerts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
            <CheckCircle2 size={24} className="mb-2 text-emerald-500" />
            <p className="text-xs font-medium text-[var(--color-text)]">All clear</p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <li
                key={alert.id}
                className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-[11px] leading-snug text-[var(--color-text)]">{alert.message}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
