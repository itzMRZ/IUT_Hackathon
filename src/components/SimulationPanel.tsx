import { Fan, Lightbulb, Play, Pause, Sparkles, AlertTriangle } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

const PRESETS = [
  { id: 'office_busy', label: 'Office Hours Busy' },
  { id: 'after_hours', label: 'After Hours Alert' },
  { id: 'room_stuck', label: 'Room Stuck 2hr' },
  { id: 'drawing_only', label: 'Drawing Only' },
  { id: 'all_off', label: 'All Off' },
] as const

function ToggleRow({ device }: { device: Device }) {
  const { toggleDevice } = useOfficeData()
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <button
      type="button"
      onClick={() => toggleDevice(device.id)}
      className={`flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-left transition-colors ${
        on
          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
        <Icon size={12} className={on ? 'text-emerald-600' : 'text-slate-400'} />
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
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
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
  const { alerts, autoSim, setAutoSim, applyPreset, connected } = useOfficeData()

  return (
    <aside className="flex h-full max-h-[38vh] min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-md)] lg:max-h-none">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          <h2 className="text-sm font-bold text-slate-800">Simulation</h2>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Presets and manual device controls</p>
      </div>

      <div className="shrink-0">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Presets</p>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAutoSim(!autoSim)}
        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
          autoSim
            ? 'border-sky-200 bg-sky-50 text-sky-800'
            : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}
      >
        {autoSim ? <Pause size={14} /> : <Play size={14} />}
        Auto simulation {autoSim ? 'ON' : 'OFF'}
      </button>

      {alerts.length > 0 && (
        <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50/70 p-2">
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-amber-800">
            <AlertTriangle size={11} />
            Alerts ({alerts.length})
          </p>
          <ul className="max-h-20 space-y-1 overflow-y-auto text-[10px] text-amber-900">
            {alerts.slice(0, 4).map((a) => (
              <li key={a.id} className="leading-snug">
                {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Manual Controls
        </p>
        <div className="space-y-3">
          {ROOM_ORDER.map((room) => (
            <RoomToggles key={room} room={room} />
          ))}
        </div>
      </div>

      <p className="shrink-0 text-center text-[9px] text-slate-400">
        {connected ? 'Live' : 'Reconnecting…'}
      </p>
    </aside>
  )
}
