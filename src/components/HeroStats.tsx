import { Zap, Power, Lightbulb, Fan, AlertTriangle, Radio } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage, wattageByRoom } from '../lib/wattage'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

export function HeroStats() {
  const { devices, alerts, connected, loading } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length
  const offCount = devices.length - onCount
  const byRoom = wattageByRoom(devices)

  return (
    <section className="shrink-0 px-2 pt-2">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-3 shadow-md">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Office Monitor</h1>
            <p className="text-[11px] text-slate-500">Live lights, fans, and power across 3 rooms</p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
              connected && !loading
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            }`}
          >
            <Radio size={12} className={connected && !loading ? 'animate-pulse' : ''} />
            {connected && !loading ? 'Live' : loading ? 'Connecting' : 'Reconnecting'}
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Active alerts</p>
            <p className="mt-0.5 text-[11px] text-amber-900">{alerts[0].message}</p>
            {alerts.length > 1 && (
              <p className="mt-0.5 text-[10px] text-amber-700">+{alerts.length - 1} more</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <HeroCard icon={Zap} label="Total Power" value={`${total}W`} accent="violet" />
          <HeroCard icon={Power} label="Devices On" value={String(onCount)} sub={`of ${devices.length}`} accent="green" />
          <HeroCard icon={Lightbulb} label="Devices Off" value={String(offCount)} accent="slate" />
          <HeroCard
            icon={AlertTriangle}
            label="Alerts"
            value={String(alerts.length)}
            sub={alerts.length ? 'Active' : 'Clear'}
            accent={alerts.length ? 'amber' : 'green'}
          />
          {ROOM_ORDER.map((room) => (
            <HeroCard
              key={room}
              icon={Fan}
              label={ROOM_LABELS[room].replace('Work Room', 'WR')}
              value={`${byRoom[room]}W`}
              sub={`${devices.filter((d) => d.room === room && d.status === 'on').length} on`}
              accent="blue"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Zap
  label: string
  value: string
  sub?: string
  accent: 'violet' | 'green' | 'slate' | 'amber' | 'blue'
}) {
  const styles = {
    violet: 'border-violet-100 bg-violet-50/60 text-violet-800',
    green: 'border-emerald-100 bg-emerald-50/60 text-emerald-800',
    slate: 'border-slate-100 bg-slate-50/80 text-slate-700',
    amber: 'border-amber-100 bg-amber-50/60 text-amber-800',
    blue: 'border-sky-100 bg-sky-50/60 text-sky-800',
  }
  const iconStyles = {
    violet: 'text-violet-500',
    green: 'text-emerald-500',
    slate: 'text-slate-400',
    amber: 'text-amber-500',
    blue: 'text-sky-500',
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${styles[accent]}`}>
      <Icon size={16} className={`shrink-0 ${iconStyles[accent]}`} />
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-base font-bold tabular-nums leading-tight">{value}</p>
        {sub && <p className="text-[9px] opacity-60">{sub}</p>}
      </div>
    </div>
  )
}
