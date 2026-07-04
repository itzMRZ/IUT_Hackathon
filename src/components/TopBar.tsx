import { Radio } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage } from '../lib/wattage'

export function TopBar() {
  const { devices, alerts, connected, loading, source } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length
  const offCount = devices.length - onCount

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white px-4 py-2.5 shadow-[var(--shadow-sm)]">
      <div>
        <h1 className="text-base font-bold tracking-tight text-slate-800">Office Monitor</h1>
        <p className="text-[11px] text-slate-500">3 rooms, 15 devices, live floor plan</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-4 sm:flex">
          <Metric label="Power" value={`${total}W`} color="text-violet-700" />
          <Metric label="On" value={String(onCount)} color="text-emerald-600" />
          <Metric label="Off" value={String(offCount)} color="text-slate-500" />
          <Metric label="Alerts" value={String(alerts.length)} color={alerts.length ? 'text-amber-600' : 'text-emerald-600'} />
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            connected && !loading ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Radio size={12} />
          {connected && !loading ? `Live${source === 'mock' ? ' demo' : ''}` : '...'}
        </div>
      </div>
    </header>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
