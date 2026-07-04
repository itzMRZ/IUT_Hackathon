import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

const btn =
  'rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1'

function ToggleRow({ device }: { device: Device }) {
  const { toggleDevice } = useOfficeData()
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <button
      type="button"
      onClick={() => toggleDevice(device.id)}
      aria-pressed={on}
      className={`${btn} flex w-full items-center justify-between px-2.5 py-2 text-left ${
        on
          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${on ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          <Icon size={13} strokeWidth={2.25} aria-hidden />
        </span>
        {device.label}
      </span>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${on ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

function RoomToggles({ room }: { room: Room }) {
  const { devices } = useOfficeData()
  const roomDevices = devices.filter((d) => d.room === room)

  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {ROOM_LABELS[room]}
      </p>
      <div className="space-y-1">
        {roomDevices.map((d) => (
          <ToggleRow key={d.id} device={d} />
        ))}
      </div>
    </div>
  )
}

export function ManualControls() {
  const { connected } = useOfficeData()

  return (
    <div className="panel-card panel-card--grow">
      <div className="panel-card__header">
        <h2 className="panel-card__title">On / Off</h2>
        <span className={`panel-badge ${connected ? 'panel-badge--live' : 'panel-badge--local'}`}>
          {connected ? 'Live' : 'Local'}
        </span>
      </div>
      <div className="panel-scroll panel-card__body">
        <div className="space-y-2.5">
          {ROOM_ORDER.map((room) => (
            <RoomToggles key={room} room={room} />
          ))}
        </div>
      </div>
    </div>
  )
}
