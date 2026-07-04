import { useState } from 'react'
import { Building2, MousePointerClick, ToggleLeft, Wand2, ArrowRight, Check } from 'lucide-react'

const TOUR_KEY = 'office-monitor-tour-seen-v1'

const STEPS = [
  {
    icon: Building2,
    title: 'Welcome to Office Monitor',
    desc: 'A real-time dashboard tracking 15 devices — fans and lights — across 3 office rooms, powered by a live WebSocket simulation.',
  },
  {
    icon: MousePointerClick,
    title: 'Interactive Floor Plan',
    desc: 'Click any fan or light on the map to toggle it instantly. Fans spin, lights glow — everything updates live.',
  },
  {
    icon: ToggleLeft,
    title: 'Manual Controls',
    desc: 'Use the switches in the sidebar to turn any device on or off, grouped by room, without touching the floor plan.',
  },
  {
    icon: Wand2,
    title: 'Preset Modes & Alerts',
    desc: 'Trigger demo scenarios like After Hours or Room Stuck with one click. Auto-simulation runs in the background and posts every change to Discord.',
  },
] as const

function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === '1'
  } catch {
    return true
  }
}

function markTourSeen() {
  try {
    localStorage.setItem(TOUR_KEY, '1')
  } catch {
    /* localStorage unavailable — ignore */
  }
}

export function OnboardingTour() {
  const [visible, setVisible] = useState(() => !hasSeenTour())
  const [step, setStep] = useState(0)

  if (!visible) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  const Icon = current.icon

  const close = () => {
    markTourSeen()
    setVisible(false)
  }

  const next = () => {
    if (isLast) {
      close()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      <div className="tour-card">
        <div className="tour-icon">
          <Icon size={22} strokeWidth={2.25} aria-hidden />
        </div>
        <h2 className="tour-title">{current.title}</h2>
        <p className="tour-desc">{current.desc}</p>

        <div className="tour-footer">
          <div className="tour-dots" aria-hidden>
            {STEPS.map((s, i) => (
              <span key={s.title} className={`tour-dot ${i === step ? 'tour-dot--active' : ''}`} />
            ))}
          </div>
          <div className="tour-actions">
            <button type="button" className="tour-skip" onClick={close}>
              Skip
            </button>
            <button type="button" className="tour-next" onClick={next}>
              {isLast ? (
                <>
                  Get Started <Check size={14} strokeWidth={2.5} aria-hidden />
                </>
              ) : (
                <>
                  Next <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
