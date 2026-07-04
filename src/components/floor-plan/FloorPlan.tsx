import { Fan, Lightbulb } from 'lucide-react'
import { useOfficeData } from '../../hooks/useOfficeData'
import type { Room } from '../../lib/types'
import { FloorPlanDefs, FloorPlanStructure, FloorPlanFurniture } from './FloorPlanScene'
import { AmbienceLayer } from './AmbienceLayer'
import { DeviceSprites } from './DeviceSprites'
import layout from '../../lib/layout.json'

export function FloorPlan() {
  const { devices, alerts } = useOfficeData()
  const vb = layout.viewBox

  const alertRooms = new Set(
    alerts.filter((a) => a.room).map((a) => a.room as Room),
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">
      <div className="relative min-h-0 flex-1 max-lg:min-h-[300px]">
        <svg
          viewBox={`0 0 ${vb.width} ${vb.height}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Office floor plan with fans and lights in three rooms"
        >
          <FloorPlanDefs />
          <FloorPlanStructure alertRooms={alertRooms} />
          <FloorPlanFurniture />
          <AmbienceLayer devices={devices} />
          <DeviceSprites devices={devices} />
        </svg>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-4 border-t border-slate-100 bg-slate-50/80 px-3 py-1.5">
        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
          <Fan size={11} className="text-amber-800" aria-hidden />
          Fans spin when on
        </span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
          <Lightbulb size={11} className="text-amber-500" aria-hidden />
          Glow shows lit area
        </span>
      </div>
    </div>
  )
}
