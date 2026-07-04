import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

function CeilingFan({ x, y, bladeLen, on, label }: {
  x: number; y: number; bladeLen: number; on: boolean; label: string
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* ceiling rod */}
      <line x1={0} y1={-bladeLen * 0.55} x2={0} y2={-bladeLen * 0.15} stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-bladeLen * 0.55} r={4} fill="#94a3b8" />

      {/* motor housing */}
      <ellipse cx={0} cy={0} rx={bladeLen * 0.22} ry={bladeLen * 0.14} fill={on ? '#78716c' : '#a8a29e'} stroke="#57534e" strokeWidth={1.5} />

      {/* 3 blades - static when off, spin when on */}
      <g className={on ? 'fan-blades-spin' : ''} style={{ transformOrigin: '0px 0px' }}>
        {[0, 120, 240].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <rect
              x={-bladeLen * 0.08}
              y={-bladeLen * 0.92}
              width={bladeLen * 0.16}
              height={bladeLen * 0.78}
              rx={bladeLen * 0.04}
              fill={on ? '#92400e' : '#a8a29e'}
              stroke={on ? '#78350f' : '#78716c'}
              strokeWidth={1}
            />
          </g>
        ))}
      </g>

      {/* hub cap */}
      <circle r={bladeLen * 0.12} fill={on ? '#44403c' : '#78716c'} stroke="#292524" strokeWidth={1} />

      {/* label + status */}
      <text y={bladeLen * 0.55} textAnchor="middle" fill="#334155" fontSize={10} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {label}
      </text>
      <g transform={`translate(${-18}, ${bladeLen * 0.62})`}>
        <rect width={36} height={14} rx={7} fill={on ? '#059669' : '#94a3b8'} />
        <text x={18} y={10} textAnchor="middle" fill="white" fontSize={8} fontWeight={700} fontFamily="DM Sans, sans-serif">
          {on ? 'ON' : 'OFF'}
        </text>
      </g>
    </g>
  )
}

function CeilingLight({ x, y, radius, poolRadius, on, label }: {
  x: number; y: number; radius: number; poolRadius: number; on: boolean; label: string
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* fixture mount */}
      <line x1={0} y1={-radius * 1.2} x2={0} y2={-radius * 0.5} stroke="#94a3b8" strokeWidth={2} />
      {/* shade */}
      <path
        d={`M ${-radius * 0.9} ${-radius * 0.4} Q 0 ${-radius * 0.9} ${radius * 0.9} ${-radius * 0.4} L ${radius * 0.7} ${radius * 0.1} L ${-radius * 0.7} ${radius * 0.1} Z`}
        fill={on ? '#fde68a' : '#e2e8f0'}
        stroke={on ? '#f59e0b' : '#cbd5e1'}
        strokeWidth={1.5}
      />
      {/* bulb */}
      <circle cy={radius * 0.05} r={radius * 0.45} fill={on ? '#fbbf24' : '#cbd5e1'} stroke={on ? '#f59e0b' : '#94a3b8'} strokeWidth={2} />

      {/* range indicator ring (subtle, shows lit area footprint) */}
      <ellipse
        cx={0}
        cy={radius * 0.8}
        rx={poolRadius * 0.35}
        ry={poolRadius * 0.28}
        fill="none"
        stroke={on ? '#fbbf24' : '#cbd5e1'}
        strokeWidth={1}
        strokeDasharray={on ? '0' : '4 3'}
        opacity={on ? 0.35 : 0.2}
      />

      <text y={radius * 1.8} textAnchor="middle" fill="#334155" fontSize={10} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {label}
      </text>
      <g transform={`translate(${-18}, ${radius * 2.05})`}>
        <rect width={36} height={14} rx={7} fill={on ? '#059669' : '#94a3b8'} />
        <text x={18} y={10} textAnchor="middle" fill="white" fontSize={8} fontWeight={700} fontFamily="DM Sans, sans-serif">
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
          return (
            <CeilingFan
              key={device.id}
              x={x}
              y={y}
              bladeLen={pos.size * 0.65 + 18}
              on={on}
              label={device.label}
            />
          )
        }
        const poolRadius = 'poolRadius' in pos ? pos.poolRadius : 120
        return (
          <CeilingLight
            key={device.id}
            x={x}
            y={y}
            radius={pos.size * 0.45 + 6}
            poolRadius={poolRadius}
            on={on}
            label={device.label}
          />
        )
      })}
    </svg>
  )
}
