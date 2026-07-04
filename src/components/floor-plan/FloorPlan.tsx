import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../../hooks/useOfficeData'
import type { Room } from '../../lib/types'
import { FloorPlanDefs, FloorPlanStructure, FloorPlanFurniture } from './FloorPlanScene'
import { AmbienceLayer } from './AmbienceLayer'
import { DeviceSprites } from './DeviceSprites'
import layout from '../../lib/layout.json'

export function FloorPlan() {
  const { devices, alerts, toggleDevice } = useOfficeData()
  const vb = layout.viewBox

  const alertRooms = new Set(
    alerts.filter((a) => a.room).map((a) => a.room as Room),
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
      <div className="min-h-0 flex-1 overflow-hidden">
        <svg
          viewBox={`0 0 ${vb.width} ${vb.height}`}
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Office floor plan — click fans or lights to toggle"
        >
          <FloorPlanDefs />
          <FloorPlanStructure alertRooms={alertRooms} />
          <FloorPlanFurniture />
          <AmbienceLayer devices={devices} />
          <DeviceSprites devices={devices} onToggle={toggleDevice} />
        </svg>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-100 bg-slate-50/90 px-2 py-1">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-700">
            <Fan size={11} strokeWidth={2.5} aria-hidden />
          </span>
          Tap to toggle
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-yellow-100 text-yellow-600">
            <Lightbulb size={11} strokeWidth={2.5} aria-hidden />
          </span>
          Glow = on
        </span>
      </div>
    </div>
  )
}
