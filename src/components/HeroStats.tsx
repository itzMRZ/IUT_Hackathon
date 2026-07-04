import { Zap, Power, Fan, AlertTriangle, Radio } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { totalWattage, wattageByRoom } from '../lib/wattage'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

export function HeroStats() {
  const { devices, alerts, connected } = useOfficeData()
  const total = totalWattage(devices)
  const onCount = devices.filter((d) => d.status === 'on').length
  const byRoom = wattageByRoom(devices)

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-800">Office Monitor</h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
              connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Radio size={9} className={connected ? 'animate-pulse' : ''} aria-hidden />
            {connected ? 'Live' : 'Local'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Stat icon={Zap} label="Power" value={`${total}W`} />
          <Stat icon={Power} label="On" value={`${onCount}/${devices.length}`} />
          <Stat icon={AlertTriangle} label="Alerts" value={String(alerts.length)} warn={alerts.length > 0} />
          {ROOM_ORDER.map((room) => (
            <Stat
              key={room}
              icon={Fan}
              label={ROOM_LABELS[room].replace('Work Room', 'WR').replace('Drawing Room', 'Draw')}
              value={`${byRoom[room]}W`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: typeof Zap
  label: string
  value: string
  warn?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium ${
        warn ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-100 bg-slate-50 text-slate-700'
      }`}
    >
      <Icon size={11} className={warn ? 'text-amber-500' : 'text-slate-400'} aria-hidden />
      <span className="text-[9px] uppercase opacity-60">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </span>
  )
}
