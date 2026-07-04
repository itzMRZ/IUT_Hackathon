import { Fan, Lightbulb, Play, Pause, SlidersHorizontal } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

const PRESETS = [
  { id: 'office_busy', label: 'Busy' },
  { id: 'after_hours', label: 'After Hours' },
  { id: 'room_stuck', label: 'Room Stuck' },
  { id: 'drawing_only', label: 'Drawing Only' },
  { id: 'all_off', label: 'All Off' },
] as const

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
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${on ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          <Icon size={13} strokeWidth={2.25} aria-hidden />
        </span>
        {device.label}
      </span>
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${on ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
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

export function SimulationPanel() {
  const { autoSim, setAutoSim, applyPreset, connected } = useOfficeData()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} strokeWidth={2.25} className="text-violet-500" aria-hidden />
          <h2 className="text-[12px] font-bold text-slate-800">Controls</h2>
        </div>
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {connected ? 'Live' : 'Local'}
        </span>
      </div>

      <div className="shrink-0 space-y-1.5 border-b border-slate-100 px-2.5 py-2">
        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Presets</p>
        <div className="grid grid-cols-2 gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`${btn} border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAutoSim(!autoSim)}
          aria-pressed={autoSim}
          className={`${btn} flex w-full items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-semibold ${
            autoSim ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {autoSim ? <Pause size={12} strokeWidth={2.5} aria-hidden /> : <Play size={12} strokeWidth={2.5} aria-hidden />}
          Auto sim {autoSim ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-2.5 py-2">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">Manual</p>
        <div className="space-y-2.5">
          {ROOM_ORDER.map((room) => (
            <RoomToggles key={room} room={room} />
          ))}
        </div>
      </div>
    </div>
  )
}
