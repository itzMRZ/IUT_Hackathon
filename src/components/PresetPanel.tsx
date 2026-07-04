import { Play, Pause, Zap, Moon, Clock, PowerOff, Wand2 } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'

const PRESETS = [
  { id: 'office_busy', label: 'Office Busy', desc: 'Randomize devices', icon: Zap },
  { id: 'after_hours', label: 'After Hours', desc: 'Trigger night alert', icon: Moon },
  { id: 'room_stuck', label: 'Room Stuck', desc: '2hr all-on alert', icon: Clock },
  { id: 'all_off', label: 'All Off', desc: 'Power down office', icon: PowerOff },
] as const

export function PresetPanel() {
  const { autoSim, setAutoSim, applyPreset } = useOfficeData()

  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div className="panel-card__title-group">
          <span className="panel-card__icon">
            <Wand2 size={14} strokeWidth={2.25} aria-hidden />
          </span>
          <h2 className="panel-card__title">Preset Modes</h2>
        </div>
      </div>

      <div className="panel-card__body">
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className="preset-btn">
              <span className="preset-btn__icon">
                <p.icon size={14} strokeWidth={2.25} aria-hidden />
              </span>
              <span>
                <span className="preset-btn__label block">{p.label}</span>
                <span className="preset-btn__desc">{p.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAutoSim(!autoSim)}
          aria-pressed={autoSim}
          className={`autosim-btn ${autoSim ? 'autosim-btn--on' : 'autosim-btn--off'}`}
        >
          {autoSim ? <Pause size={13} strokeWidth={2.5} aria-hidden /> : <Play size={13} strokeWidth={2.5} aria-hidden />}
          Auto Simulation {autoSim ? 'Running' : 'Paused'}
        </button>
      </div>
    </div>
  )
}
