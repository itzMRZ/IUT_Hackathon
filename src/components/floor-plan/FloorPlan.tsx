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
        <rect width="24" height="24" fill="#c4a574" />
        <rect width="12" height="12" fill="#b89968" opacity="0.4" />
        <rect x="12" y="12" width="12" height="12" fill="#b89968" opacity="0.4" />
      </pattern>
      <pattern id="tile-gray" patternUnits="userSpaceOnUse" width="40" height="40">
        <rect width="40" height="40" fill="#b8bcc4" />
        <rect width="38" height="38" x="1" y="1" fill="#c8ccd4" stroke="#a0a4ac" strokeWidth="0.5" />
      </pattern>
      <pattern id="wood-plank" patternUnits="userSpaceOnUse" width="80" height="20">
        <rect width="80" height="20" fill="#d4b896" />
        <line x1="0" y1="10" x2="80" y2="10" stroke="#c4a886" strokeWidth="1" />
      </pattern>
      <pattern id="hall-tile" patternUnits="userSpaceOnUse" width="60" height="60">
        <rect width="60" height="60" fill="#d9cdb8" />
        <rect width="58" height="58" x="1" y="1" fill="#e5d9c4" stroke="#c9bd9f" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

export function FloorPlan() {
  const { devices, alerts } = useOfficeData()
  const vb = layout.viewBox

  const alertRooms = new Set(
    alerts.filter((a) => a.room).map((a) => a.room as Room),
  )

  return (
    <div className="relative w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] overflow-hidden">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${vb.width} / ${vb.height}` }}
      >
        <svg viewBox={`0 0 ${vb.width} ${vb.height}`} className="absolute inset-0 w-full h-full">
          <PatternDefs />
          <FloorPlanStructure />
        </svg>

        <AmbienceLayer devices={devices} />

        <svg viewBox={`0 0 ${vb.width} ${vb.height}`} className="absolute inset-0 w-full h-full pointer-events-none">
          <FloorPlanFurniture />
        </svg>

        <SwayDecor devices={devices} />
        <DeviceSprites devices={devices} />

        <svg viewBox={`0 0 ${vb.width} ${vb.height}`} className="absolute inset-0 w-full h-full pointer-events-none">
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
                stroke="var(--color-warning)"
                strokeWidth={3}
                strokeOpacity={0.6}
                rx={4}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
