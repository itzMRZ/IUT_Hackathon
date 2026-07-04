import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

/** Top-down ceiling fan: hub fixed, 3 long blades rotate when ON */
function CeilingFan({ x, y, bladeLen, on, label }: {
  x: number; y: number; bladeLen: number; on: boolean; label: string
}) {
  const hub = bladeLen * 0.14
  const bladeW = bladeLen * 0.14

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* motor hub - always static */}
      <circle r={hub} fill="#57534e" stroke="#44403c" strokeWidth={2} />
      <circle r={hub * 0.45} fill="#78716c" />

      {/* 3 blades - rotate together when ON */}
      <g>
        {on && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
        {[0, 120, 240].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <rect
              x={-bladeW / 2}
              y={-bladeLen}
              width={bladeW}
              height={bladeLen - hub - 4}
              rx={bladeW / 3}
              fill={on ? '#78350f' : '#a8a29e'}
              stroke={on ? '#451a03' : '#78716c'}
              strokeWidth={1}
            />
          </g>
        ))}
      </g>

      <text y={bladeLen + 14} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {label}
      </text>
      <g transform={`translate(-16, ${bladeLen + 20})`}>
        <rect width={32} height={12} rx={6} fill={on ? '#059669' : '#94a3b8'} />
        <text x={16} y={9} textAnchor="middle" fill="white" fontSize={7} fontWeight={700} fontFamily="DM Sans, sans-serif">
          {on ? 'ON' : 'OFF'}
        </text>
      </g>
    </g>
  )
}

function CeilingLight({ x, y, size, on, label }: {
  x: number; y: number; size: number; on: boolean; label: string
}) {
  const r = size / 2
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={r + 4} fill={on ? '#fef3c7' : '#f1f5f9'} stroke={on ? '#fbbf24' : '#cbd5e1'} strokeWidth={2} />
      <circle r={r} fill={on ? '#fbbf24' : '#94a3b8'} />
      {on && <circle r={r * 0.35} fill="#fffbeb" />}

      <text y={size + 12} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {label}
      </text>
      <g transform={`translate(-16, ${size + 18})`}>
        <rect width={32} height={12} rx={6} fill={on ? '#059669' : '#94a3b8'} />
        <text x={16} y={9} textAnchor="middle" fill="white" fontSize={7} fontWeight={700} fontFamily="DM Sans, sans-serif">
          {on ? 'ON' : 'OFF'}
        </text>
      </g>
    </g>
  )
}

export function DeviceSprites({ devices }: Props) {
  return (
    <svg
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      className="absolute inset-0 h-full w-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      {devices.map((device) => {
        const pos = layout.devices[device.id as keyof typeof layout.devices]
        if (!pos) return null
        const room = layout.rooms[device.room]
        const x = room.x + pos.x
        const y = room.y + pos.y
        const on = device.status === 'on'

        if (device.type === 'fan') {
          const bladeLen = 'bladeLen' in pos ? pos.bladeLen : 48
          return (
            <CeilingFan key={device.id} x={x} y={y} bladeLen={bladeLen} on={on} label={device.label} />
          )
        }
        return (
          <CeilingLight
            key={device.id}
            x={x}
            y={y}
            size={pos.size}
            on={on}
            label={device.label}
          />
        )
      })}
    </svg>
  )
}
