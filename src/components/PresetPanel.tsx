import { Play, Pause, Sparkles } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'

const PRESETS = [
  { id: 'office_busy', label: 'Office Busy', desc: 'Random devices on' },
  { id: 'after_hours', label: 'After Hours', desc: 'Late-night alert' },
  { id: 'room_stuck', label: 'Room Stuck', desc: '2hr all-on alert' },
  { id: 'all_off', label: 'All Off', desc: 'Shut everything down' },
] as const

const btn =
  'rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1'

export function PresetPanel() {
  const { autoSim, setAutoSim, applyPreset } = useOfficeData()

  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} strokeWidth={2.25} className="text-violet-500" aria-hidden />
          <h2 className="panel-card__title">Preset Modes</h2>
        </div>
      </div>

      <div className="panel-card__body space-y-2">
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`${btn} preset-btn`}
            >
              <span className="preset-btn__label">{p.label}</span>
              <span className="preset-btn__desc">{p.desc}</span>
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
          Auto simulation {autoSim ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}
