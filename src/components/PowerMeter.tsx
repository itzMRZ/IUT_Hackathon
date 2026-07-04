import { Zap } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage, wattageByRoom } from '../lib/wattage'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

export function PowerMeter() {
  const { devices } = useOfficeData()
  const total = totalWattage(devices)
  const byRoom = wattageByRoom(devices)
  const maxRoom = Math.max(...Object.values(byRoom), 1)

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-[var(--color-warning)]" />
        <h2 className="text-base font-semibold text-[var(--color-text)]">Power Consumption</h2>
      </div>

      <div className="mb-5 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
          Total Office
        </p>
        <p className="text-3xl font-bold text-[var(--color-text)] tabular-nums">
          {total}
          <span className="text-lg font-medium text-[var(--color-text-muted)] ml-1">W</span>
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
          Per Room
        </p>
        {ROOM_ORDER.map((room) => (
          <div key={room}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--color-text)]">{ROOM_LABELS[room]}</span>
              <span className="text-[var(--color-text-muted)] tabular-nums">{byRoom[room]}W</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-dim)] to-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${(byRoom[room] / maxRoom) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
