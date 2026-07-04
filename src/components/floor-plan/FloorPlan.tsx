import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../../hooks/useOfficeData'
import type { Room } from '../../lib/types'
import {
  FloorPlanStructure,
  FloorPlanFurniture,
} from './FloorPlanScene'
import { AmbienceLayer } from './AmbienceLayer'
import { DeviceSprites } from './DeviceSprites'
import { SwayDecor } from './SwayDecor'
import layout from '../../lib/layout.json'

function PatternDefs() {
  return (
    <defs>
      <pattern id="carpet" patternUnits="userSpaceOnUse" width="24" height="24">
        <rect width="24" height="24" fill="#d4bc96" />
        <rect width="12" height="12" fill="#c9ad88" opacity="0.35" />
        <rect x="12" y="12" width="12" height="12" fill="#c9ad88" opacity="0.35" />
      </pattern>
      <pattern id="tile-gray" patternUnits="userSpaceOnUse" width="40" height="40">
        <rect width="40" height="40" fill="#c5cad3" />
        <rect width="38" height="38" x="1" y="1" fill="#d5dae3" stroke="#aeb4bf" strokeWidth="0.5" />
      </pattern>
      <pattern id="wood-plank" patternUnits="userSpaceOnUse" width="80" height="20">
        <rect width="80" height="20" fill="#dcc9a8" />
        <line x1="0" y1="10" x2="80" y2="10" stroke="#cbb896" strokeWidth="1" />
      </pattern>
      <pattern id="hall-tile" patternUnits="userSpaceOnUse" width="60" height="60">
        <rect width="60" height="60" fill="#ddd0b8" />
        <rect width="58" height="58" x="1" y="1" fill="#ebe2d0" stroke="#cfc2a8" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

function FloorLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 flex gap-3 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100">
          <Fan size={12} className="text-emerald-600" />
        </span>
        Fan ON = spinning
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100">
          <Lightbulb size={12} className="text-amber-500" />
        </span>
        Light ON = glow
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">OFF</span>
        badge = idle
      </div>
    </div>
  )
}

export function FloorPlan() {
  const { devices, alerts } = useOfficeData()
  const vb = layout.viewBox

  const alertRooms = new Set(
    alerts.filter((a) => a.room).map((a) => a.room as Room),
  )

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">
      <div className="shrink-0 border-b border-[var(--color-border)] px-4 py-2">
        <p className="text-xs font-semibold text-[var(--color-text)]">Office Floor Plan</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">
          Green ON badges and amber glow mean active devices
        </p>
      </div>

      <div className="relative min-h-0 flex-1 p-2">
        <div className="relative h-full w-full">
          <svg
            viewBox={`0 0 ${vb.width} ${vb.height}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <PatternDefs />
            <FloorPlanStructure />
          </svg>

          <AmbienceLayer devices={devices} />

          <svg
            viewBox={`0 0 ${vb.width} ${vb.height}`}
            className="absolute inset-0 h-full w-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <FloorPlanFurniture />
          </svg>

          <SwayDecor devices={devices} />
          <DeviceSprites devices={devices} />

          <svg
            viewBox={`0 0 ${vb.width} ${vb.height}`}
            className="absolute inset-0 h-full w-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
          >
            {(['drawing', 'workroom1', 'workroom2'] as Room[]).map((room) => {
              if (!alertRooms.has(room)) return null
              const r = layout.rooms[room]
              return (
                <rect
                  key={room}
                  x={r.x + 2}
                  y={r.y + 2}
                  width={r.width - 4}
                  height={r.height - 4}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth={4}
                  strokeOpacity={0.75}
                  rx={6}
                  strokeDasharray="8 4"
                />
              )
            })}
          </svg>
        </div>
        <FloorLegend />
      </div>
    </div>
  )
}
