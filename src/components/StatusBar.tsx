import { useEffect, useState } from 'react'
import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { deviceDurationLabel } from '../lib/deviceUtils'
import { ROOM_LABELS, type Device } from '../lib/types'

function StatusChip({ device, tick }: { device: Device; tick: number }) {
  void tick
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb
  const duration = deviceDurationLabel(device)
  const roomShort = ROOM_LABELS[device.room]
    .replace('Work Room ', 'WR ')
    .replace('Drawing Room', 'Draw')

  return (
    <div
      className={`flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 ${
        on ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'
      }`}
      title={`${roomShort} ${device.label}: ${on ? 'ON' : 'OFF'} for ${duration}`}
    >
      <Icon size={11} strokeWidth={2.25} className={on ? 'text-emerald-600' : 'text-slate-400'} aria-hidden />
      <span className="whitespace-nowrap text-[10px] font-medium">
        {roomShort} {device.label}
      </span>
      <span className={`rounded px-1 py-px text-[8px] font-bold ${on ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

export function StatusBar() {
  const { devices } = useOfficeData()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const sorted = [...devices].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'on' ? -1 : 1
    return a.room.localeCompare(b.room)
  })

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-slate-400">Devices</span>
        <div className="scrollbar-thin flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {sorted.map((d) => (
            <StatusChip key={d.id} device={d} tick={tick} />
          ))}
        </div>
      </div>
    </div>
  )
}
