import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AlertsPanel() {
  const { alerts } = useOfficeData()

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Active Alerts</h2>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={32} className="text-[var(--color-accent)] mb-3 opacity-80" />
          <p className="text-sm font-medium text-[var(--color-text)]">All clear</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            No anomalies detected right now
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex gap-3 p-3 rounded-lg border ${
                alert.severity === 'warning'
                  ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              <AlertTriangle
                size={16}
                className={`shrink-0 mt-0.5 ${
                  alert.severity === 'warning'
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm text-[var(--color-text)] leading-snug">{alert.message}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {formatTime(alert.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
