import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER } from '../lib/types'

export function MobileRoomStrip() {
  const { devices } = useOfficeData()

  return (
    <div className="grid shrink-0 grid-cols-3 gap-2 px-4 pb-2 lg:hidden">
      {ROOM_ORDER.map((room) => {
        const roomDevices = devices.filter((d) => d.room === room)
        const onCount = roomDevices.filter((d) => d.status === 'on').length
        return (
          <div
            key={room}
            className="rounded-xl border border-[var(--color-border)] bg-white px-2 py-1.5 text-center shadow-[var(--shadow-sm)]"
          >
            <p className="truncate text-[10px] font-bold text-[var(--color-text)]">{ROOM_LABELS[room]}</p>
            <p className={`text-sm font-bold tabular-nums ${onCount ? 'text-emerald-600' : 'text-slate-400'}`}>
              {onCount}/{roomDevices.length} on
            </p>
          </div>
        )
      })}
    </div>
  )
}
