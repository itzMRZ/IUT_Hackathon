import { Zap, Power, Lightbulb, Fan, AlertTriangle, Radio } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage, wattageByRoom } from '../lib/wattage'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

export function HeroStats() {
  const { devices, alerts, connected } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length
  const offCount = devices.length - onCount
  const byRoom = wattageByRoom(devices)

  return (
    <section className="shrink-0 px-3 pt-2">
      <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">Office Monitor</h1>
            <p className="text-[10px] text-slate-500">Live device status across 3 rooms</p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              connected
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            }`}
          >
            <Radio size={11} className={connected ? 'animate-pulse' : ''} aria-hidden />
            {connected ? 'Live' : 'Reconnecting'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-7">
          <HeroCard icon={Zap} label="Power" value={`${total}W`} accent="violet" />
          <HeroCard icon={Power} label="On" value={String(onCount)} sub={`of ${devices.length}`} accent="green" />
          <HeroCard icon={Lightbulb} label="Off" value={String(offCount)} accent="slate" />
          <HeroCard
            icon={AlertTriangle}
            label="Alerts"
            value={String(alerts.length)}
            sub={alerts.length ? alerts[0].message.slice(0, 28) + (alerts[0].message.length > 28 ? '…' : '') : 'Clear'}
            accent={alerts.length ? 'amber' : 'green'}
          />
          {ROOM_ORDER.map((room) => (
            <HeroCard
              key={room}
              icon={Fan}
              label={ROOM_LABELS[room].replace('Work Room', 'WR').replace('Drawing Room', 'Drawing')}
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
    violet: 'border-violet-100 bg-violet-50/50 text-violet-800',
    green: 'border-emerald-100 bg-emerald-50/50 text-emerald-800',
    slate: 'border-slate-100 bg-slate-50/80 text-slate-700',
    amber: 'border-amber-100 bg-amber-50/50 text-amber-800',
    blue: 'border-sky-100 bg-sky-50/50 text-sky-800',
  }
  const iconStyles = {
    violet: 'text-violet-500',
    green: 'text-emerald-500',
    slate: 'text-slate-400',
    amber: 'text-amber-500',
    blue: 'text-sky-500',
  }

  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${styles[accent]}`}>
      <Icon size={14} className={`shrink-0 ${iconStyles[accent]}`} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-[8px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-sm font-bold tabular-nums leading-tight">{value}</p>
        {sub && <p className="truncate text-[8px] opacity-60">{sub}</p>}
      </div>
    </div>
  )
}
