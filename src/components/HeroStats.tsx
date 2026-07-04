import { Zap, Power, Lightbulb, Fan, AlertTriangle, Clock, Radio } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage, wattageByRoom } from '../lib/wattage'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

function StatCard({
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
  accent?: 'on' | 'off' | 'warn' | 'live' | 'power'
}) {
  const accents = {
    on: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
    off: 'border-slate-200 bg-slate-50/80 text-slate-600',
    warn: 'border-amber-200 bg-amber-50/80 text-amber-700',
    live: 'border-sky-200 bg-sky-50/80 text-sky-700',
    power: 'border-violet-200 bg-violet-50/80 text-violet-700',
  }
  const iconColors = {
    on: 'text-emerald-500',
    off: 'text-slate-400',
    warn: 'text-amber-500',
    live: 'text-sky-500',
    power: 'text-violet-500',
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-sm ${accents[accent ?? 'off']}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm">
        <Icon size={20} className={iconColors[accent ?? 'off']} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-xl font-bold tabular-nums leading-tight">{value}</p>
        {sub && <p className="text-[11px] opacity-60 truncate">{sub}</p>}
      </div>
    </div>
  )
}

export function HeroStats() {
  const { devices, alerts, connected, loading, source } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length
  const offCount = devices.length - onCount
  const byRoom = wattageByRoom(devices)

  return (
    <section className="shrink-0 px-4 pt-3 pb-2">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-hero)]">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">Office Monitor</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Live view of lights, fans, and power across 3 rooms
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              connected && !loading
                ? 'bg-[var(--color-live-bg)] text-[var(--color-live)]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Radio size={12} className={connected && !loading ? 'status-pulse-on' : ''} />
            {connected && !loading ? `Live${source === 'mock' ? ' demo' : ''}` : 'Connecting'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <StatCard icon={Zap} label="Total Power" value={`${total}W`} sub="Office wide" accent="power" />
          <StatCard icon={Power} label="Devices On" value={`${onCount}`} sub={`of ${devices.length} total`} accent="on" />
          <StatCard icon={Lightbulb} label="Devices Off" value={`${offCount}`} sub="Idle right now" accent="off" />
          <StatCard
            icon={AlertTriangle}
            label="Alerts"
            value={`${alerts.length}`}
            sub={alerts.length ? 'Needs attention' : 'All clear'}
            accent={alerts.length ? 'warn' : 'on'}
          />
          <StatCard icon={Clock} label="Office Hours" value="9-5" sub="After-hours alerts enabled" accent="live" />
          <div className="col-span-2 hidden lg:flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2">
            <Fan size={14} className="text-[var(--color-text-muted)] shrink-0" />
            <div className="flex flex-1 gap-2 min-w-0">
              {ROOM_ORDER.map((room) => (
                <div key={room} className="flex-1 min-w-0 text-center">
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">{ROOM_LABELS[room]}</p>
                  <p className="text-sm font-bold tabular-nums text-[var(--color-text)]">{byRoom[room]}W</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
