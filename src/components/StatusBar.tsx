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
  const roomShort = ROOM_LABELS[device.room].replace('Work Room', 'WR').replace('Drawing Room', 'Drawing')

  return (
    <div
      className={`flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
        on
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      }`}
    >
      <Icon size={13} className={on ? 'text-emerald-600' : 'text-slate-400'} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold leading-none">
          {roomShort} {device.label}
        </p>
        <p className="mt-0.5 text-[10px] opacity-75">
          {on ? 'ON' : 'OFF'} for {duration}
        </p>
      </div>
      <span
        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
          on ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
        }`}
      >
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
    <footer className="shrink-0 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Status
        </span>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
          {sorted.map((d) => (
            <StatusChip key={d.id} device={d} tick={tick} />
          ))}
        </div>
      </div>
    </footer>
  )
}
