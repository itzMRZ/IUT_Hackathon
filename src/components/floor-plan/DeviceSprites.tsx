import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

function FanSprite({ x, y, size, spinning }: { x: number; y: number; size: number; spinning: boolean }) {
  const r = size / 2
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={r} fill="#4a3728" stroke="#3d2e20" strokeWidth={2} />
      <g className={spinning ? 'fan-spinning' : ''}>
        {[0, 120, 240].map((angle) => (
          <ellipse
            key={angle}
            cx={0}
            cy={0}
            rx={r * 0.85}
            ry={r * 0.22}
            fill="#6b4c35"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle r={r * 0.15} fill="#3d2e20" />
    </g>
  )
}

function LightSprite({ x, y, size, on }: { x: number; y: number; size: number; on: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="device-glow">
      {on && (
        <circle
          r={size * 0.9}
          fill="none"
          stroke="#ffe066"
          strokeWidth={2}
          opacity={0.5}
          style={{ filter: 'blur(4px)' }}
        />
      )}
      <circle
        r={size / 2}
        fill={on ? '#ffe566' : '#6b7280'}
        stroke={on ? '#ffd43b' : '#4b5563'}
        strokeWidth={2}
        style={{
          filter: on ? 'drop-shadow(0 0 8px rgba(255, 228, 100, 0.8))' : 'none',
        }}
      />
      <circle r={size / 5} fill={on ? '#fff8dc' : '#9ca3af'} />
    </g>
  )
}

export function DeviceSprites({ devices }: Props) {
  return (
    <svg
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {devices.map((device) => {
        const pos = layout.devices[device.id as keyof typeof layout.devices]
        if (!pos) return null
        const room = layout.rooms[device.room]
        const x = room.x + pos.x
        const y = room.y + pos.y
        const on = device.status === 'on'

        if (device.type === 'fan') {
          return <FanSprite key={device.id} x={x} y={y} size={pos.size} spinning={on} />
        }
        return <LightSprite key={device.id} x={x} y={y} size={pos.size} on={on} />
      })}
    </svg>
  )
}
