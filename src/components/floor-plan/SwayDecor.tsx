import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

function Plant({ x, y, size, swaying }: { x: number; y: number; size: number; swaying: boolean }) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={swaying ? 'plant-swaying' : ''}
    >
      <ellipse cx={0} cy={size * 0.4} rx={size * 0.35} ry={size * 0.12} fill="#2d4a28" opacity={0.4} />
      <rect x={-size * 0.08} y={0} width={size * 0.16} height={size * 0.45} fill="#5c4033" rx={2} />
      <ellipse cx={0} cy={-size * 0.1} rx={size * 0.4} ry={size * 0.35} fill="#3d7a37" />
      <ellipse cx={-size * 0.2} cy={-size * 0.05} rx={size * 0.25} ry={size * 0.22} fill="#4a9a42" />
      <ellipse cx={size * 0.2} cy={-size * 0.05} rx={size * 0.25} ry={size * 0.22} fill="#4a9a42" />
    </g>
  )
}

export function SwayDecor({ devices }: Props) {
  const fanStatus = Object.fromEntries(
    devices.filter((d) => d.type === 'fan').map((d) => [d.id, d.status === 'on']),
  )

  return (
    <svg
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      className="absolute inset-0 h-full w-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      {layout.plants.map((plant) => {
        const room = layout.rooms[plant.room as keyof typeof layout.rooms]
        const x = room.x + plant.x
        const y = room.y + plant.y
        const swaying = plant.swayFan ? fanStatus[plant.swayFan] === true : false

        return (
          <Plant key={plant.id} x={x} y={y} size={plant.size} swaying={swaying} />
        )
      })}
    </svg>
  )
}
