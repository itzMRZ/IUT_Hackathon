import layout from '../../lib/layout.json'
import type { Device, Room } from '../../lib/types'

interface Props {
  devices: Device[]
}

function roomOffset(room: Room) {
  const r = layout.rooms[room]
  return { x: r.x, y: r.y, w: r.width, h: r.height }
}

export function AmbienceLayer({ devices }: Props) {
  const lights = devices.filter((d) => d.type === 'light')
  const rooms: Room[] = ['drawing', 'workroom1', 'workroom2']

  return (
    <svg
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      className="absolute inset-0 h-full w-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {lights.map((light) => {
          const pos = layout.devices[light.id as keyof typeof layout.devices]
          if (!pos || !('poolRadius' in pos)) return null
          return (
            <radialGradient
              key={`grad-${light.id}`}
              id={`pool-${light.id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#fff4d0" stopOpacity={0.85} />
              <stop offset="40%" stopColor="#ffe8a0" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#ffd870" stopOpacity={0} />
            </radialGradient>
          )
        })}
      </defs>

      {rooms.map((roomId) => {
        const room = roomOffset(roomId)
        const roomLights = lights.filter((l) => l.room === roomId)
        const anyOn = roomLights.some((l) => l.status === 'on')
        const dimOpacity = anyOn ? 0 : 0.35

        return (
          <g key={roomId}>
            <rect
              x={room.x + 5}
              y={room.y + 5}
              width={room.w - 10}
              height={room.h - 10}
              fill="#64748b"
              className="room-dim"
              opacity={dimOpacity}
              style={{ mixBlendMode: 'multiply' }}
            />
          </g>
        )
      })}

      {lights.map((light) => {
        const pos = layout.devices[light.id as keyof typeof layout.devices]
        if (!pos || !('poolRadius' in pos)) return null
        const room = roomOffset(light.room)
        const cx = room.x + pos.x
        const cy = room.y + pos.y
        const r = pos.poolRadius ?? 120
        const on = light.status === 'on'

        return (
          <ellipse
            key={light.id}
            cx={cx}
            cy={cy}
            rx={r}
            ry={r * 0.85}
            fill={`url(#pool-${light.id})`}
            className="light-pool"
            opacity={on ? 1 : 0}
            style={{ mixBlendMode: 'screen' }}
          />
        )
      })}
    </svg>
  )
}
