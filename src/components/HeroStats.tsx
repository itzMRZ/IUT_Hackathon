import { Zap, Power, Fan, Lightbulb, AlertTriangle, Radio } from 'lucide-react'
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
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h1 className="text-[13px] font-bold text-slate-800">Office Monitor</h1>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <Radio size={10} strokeWidth={2.5} className={connected ? 'animate-pulse' : ''} aria-hidden />
          {connected ? 'Live' : 'Local'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-7">
        <StatCard icon={Zap} iconColor="text-violet-500" bg="bg-violet-50" label="Power" value={`${total}W`} />
        <StatCard icon={Power} iconColor="text-emerald-500" bg="bg-emerald-50" label="On" value={String(onCount)} sub={`/${devices.length}`} />
        <StatCard icon={Lightbulb} iconColor="text-slate-400" bg="bg-slate-50" label="Off" value={String(offCount)} />
        <StatCard
          icon={AlertTriangle}
          iconColor={alerts.length ? 'text-amber-500' : 'text-emerald-500'}
          bg={alerts.length ? 'bg-amber-50' : 'bg-emerald-50'}
          label="Alerts"
          value={String(alerts.length)}
        />
        {ROOM_ORDER.map((room) => (
          <StatCard
            key={room}
            icon={Fan}
            iconColor="text-sky-500"
            bg="bg-sky-50"
            label={ROOM_LABELS[room].replace('Work Room ', 'WR ').replace('Drawing Room', 'Drawing')}
            value={`${byRoom[room]}W`}
            sub={`${devices.filter((d) => d.room === room && d.status === 'on').length} on`}
          />
        ))}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  iconColor,
  bg,
  label,
  value,
  sub,
}: {
  icon: typeof Zap
  iconColor: string
  bg: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-slate-100 ${bg} px-2 py-1.5`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/80 ${iconColor}`}>
        <Icon size={14} strokeWidth={2.25} aria-hidden />
      </div>
      <div className="min-w-0 leading-none">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-[13px] font-bold tabular-nums text-slate-800">
          {value}
          {sub && <span className="text-[10px] font-medium text-slate-500">{sub}</span>}
        </p>
      </div>
    </div>
  )
}
