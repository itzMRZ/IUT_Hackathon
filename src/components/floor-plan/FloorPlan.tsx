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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="min-h-0 flex-1 overflow-hidden p-1">
        <svg
          viewBox={`0 0 ${vb.width} ${vb.height}`}
          className="h-full w-full"
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

      <div className="flex shrink-0 items-center justify-center gap-4 border-t border-slate-100 bg-slate-50 px-3 py-1.5">
        <span className="text-[10px] font-medium text-slate-500">
          <Fan size={11} className="mr-1 inline text-amber-800" aria-hidden />
          Click devices to toggle
        </span>
        <span className="text-[10px] font-medium text-slate-500">
          <Lightbulb size={11} className="mr-1 inline text-amber-500" aria-hidden />
          Yellow glow = on
        </span>
      </div>
    </div>
  )
}
