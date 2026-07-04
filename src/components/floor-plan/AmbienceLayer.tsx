import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

function roomOffset(room: keyof typeof layout.rooms) {
  const r = layout.rooms[room]
  return { x: r.x, y: r.y, w: r.width, h: r.height }
}

export function AmbienceLayer({ devices }: Props) {
  const lights = devices.filter((d) => d.type === 'light')
  const rooms = ['drawing', 'workroom1', 'workroom2'] as const

  return (
    <>
      <defs>
        {lights.map((light) => (
          <radialGradient key={`grad-${light.id}`} id={`pool-${light.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity={0.85} />
            <stop offset="40%" stopColor="#fde68a" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
          </radialGradient>
        ))}
        <filter id="light-soften">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {rooms.map((roomId) => {
        const room = roomOffset(roomId)
        const roomLights = lights.filter((l) => l.room === roomId)
        const onCount = roomLights.filter((l) => l.status === 'on').length
        const total = roomLights.length
        const darkness = total === 0 ? 0.2 : (1 - onCount / total) * 0.28

        return (
          <rect
            key={`dim-${roomId}`}
            x={room.x + 6}
            y={room.y + 6}
            width={room.w - 12}
            height={room.h - 12}
            fill="#1e293b"
            className="room-dim"
            opacity={darkness}
            rx={4}
          />
        )
      })}

      {lights.map((light) => {
        const pos = layout.devices[light.id as keyof typeof layout.devices]
        if (!pos || !('poolRadius' in pos)) return null
        const room = roomOffset(light.room)
        const cx = room.x + pos.x
        const cy = room.y + pos.y + 6
        const r = pos.poolRadius
        const on = light.status === 'on'

        return (
          <ellipse
            key={light.id}
            cx={cx}
            cy={cy}
            rx={r}
            ry={r * 0.8}
            fill={`url(#pool-${light.id})`}
            className="light-pool"
            opacity={on ? 1 : 0}
            filter="url(#light-soften)"
          />
        )
      })}
    </>
  )
}
