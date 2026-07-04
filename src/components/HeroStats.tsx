import { Zap, Power, Fan, Lightbulb, AlertTriangle, Building2 } from 'lucide-react'
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
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="brand__mark">
            <Building2 size={18} strokeWidth={2.25} aria-hidden />
          </div>
          <div>
            <p className="brand__title">Office Monitor</p>
            <p className="brand__subtitle">Real-time device tracking · 3 rooms · 15 devices</p>
          </div>
        </div>

        <span className={`live-pill ${connected ? 'live-pill--on' : 'live-pill--off'}`}>
          <span className={`live-dot ${connected ? 'live-dot--pulse' : ''}`} />
          {connected ? 'Live simulation' : 'Reconnecting'}
        </span>
      </div>

      <div className="stat-row">
        <StatCard icon={Zap} tint="#7c3aed" tintBg="#f3e8ff" label="Total Power" value={`${total}`} sub="W" />
        <StatCard icon={Power} tint="#16a34a" tintBg="#dcfce7" label="Devices On" value={String(onCount)} sub={`/ ${devices.length}`} />
        <StatCard icon={Lightbulb} tint="#64748b" tintBg="#f1f5f9" label="Devices Off" value={String(offCount)} />
        <StatCard
          icon={AlertTriangle}
          tint={alerts.length ? '#d97706' : '#16a34a'}
          tintBg={alerts.length ? '#fef3c7' : '#dcfce7'}
          label="Active Alerts"
          value={String(alerts.length)}
        />
        {ROOM_ORDER.map((room) => (
          <StatCard
            key={room}
            icon={Fan}
            tint="#0284c7"
            tintBg="#e0f2fe"
            label={ROOM_LABELS[room]}
            value={`${byRoom[room]}`}
            sub="W"
            footnote={`${devices.filter((d) => d.room === room && d.status === 'on').length} on`}
          />
        ))}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  tint,
  tintBg,
  label,
  value,
  sub,
  footnote,
}: {
  icon: typeof Zap
  tint: string
  tintBg: string
  label: string
  value: string
  sub?: string
  footnote?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: tintBg, color: tint }}>
        <Icon size={16} strokeWidth={2.25} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">
          {value}
          {sub && <span className="stat-card__sub">{sub}</span>}
          {footnote && <span className="stat-card__sub">{footnote}</span>}
        </p>
      </div>
    </div>
  )
}
