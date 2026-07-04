import { Fan, Lightbulb, Play, Pause, Sparkles } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

const PRESETS = [
  { id: 'office_busy', label: 'Busy' },
  { id: 'after_hours', label: 'After Hours' },
  { id: 'room_stuck', label: 'Room Stuck' },
  { id: 'drawing_only', label: 'Drawing Only' },
  { id: 'all_off', label: 'All Off' },
] as const

const btnFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1'

function ToggleRow({ device }: { device: Device }) {
  const { toggleDevice } = useOfficeData()
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <button
      type="button"
      onClick={() => toggleDevice(device.id)}
      aria-pressed={on}
      aria-label={`${device.label} in ${ROOM_LABELS[device.room]}, currently ${on ? 'on' : 'off'}`}
      className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition-colors ${btnFocus} ${
        on
          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
        <Icon size={13} className={on ? 'text-emerald-600' : 'text-slate-400'} aria-hidden />
        {device.label}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
          on ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
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
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
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
  const { autoSim, setAutoSim, applyPreset } = useOfficeData()

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">
      <div className="shrink-0 border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-violet-500" aria-hidden />
          <h2 className="text-sm font-bold text-slate-800">Controls</h2>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Presets and manual toggles</p>
      </div>

      <div className="shrink-0 space-y-2 border-b border-slate-100 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 ${btnFocus}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAutoSim(!autoSim)}
          aria-pressed={autoSim}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${btnFocus} ${
            autoSim
              ? 'border-sky-200 bg-sky-50 text-sky-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {autoSim ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          Auto simulation {autoSim ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Manual Toggles
        </p>
        <div className="space-y-3 pb-1">
          {ROOM_ORDER.map((room) => (
            <RoomToggles key={room} room={room} />
          ))}
        </div>
      </div>
    </aside>
  )
}
