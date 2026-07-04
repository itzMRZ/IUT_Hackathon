import { Fan, Lightbulb, Play, Pause, Sparkles } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage } from '../lib/wattage'
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
  const { devices, alerts, autoSim, setAutoSim, applyPreset, connected, source } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length

  return (
    <aside className="flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-md)]">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          <h2 className="text-sm font-bold text-slate-800">Simulation</h2>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Manual toggles and demo presets</p>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-2">
        <div className="text-center">
          <p className="text-[9px] uppercase text-slate-500">Power</p>
          <p className="text-sm font-bold text-violet-700">{total}W</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase text-slate-500">On</p>
          <p className="text-sm font-bold text-emerald-600">{onCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase text-slate-500">Alerts</p>
          <p className="text-sm font-bold text-amber-600">{alerts.length}</p>
        </div>
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
        {connected ? `Connected (${source})` : 'Connecting...'}
      </p>
    </aside>
  )
}
