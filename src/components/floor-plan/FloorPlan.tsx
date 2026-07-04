import { MousePointerClick } from 'lucide-react'
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
    <div className="panel-card panel-card--grow">
      <div className="panel-card__header">
        <div className="panel-card__title-group">
          <span className="panel-card__icon">
            <MousePointerClick size={14} strokeWidth={2.25} aria-hidden />
          </span>
          <h2 className="panel-card__title">Office Floor Plan</h2>
        </div>
        <span className="panel-badge panel-badge--live">3 Rooms · 15 Devices</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white">
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
    </div>
  )
}
