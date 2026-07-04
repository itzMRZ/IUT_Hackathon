import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
}

function StatusBadge({ on, x, y }: { on: boolean; x: number; y: number }) {
  const w = 36
  const h = 14
  return (
    <g transform={`translate(${x - w / 2}, ${y})`}>
      <rect
        width={w}
        height={h}
        rx={7}
        fill={on ? '#059669' : '#94a3b8'}
        stroke={on ? '#047857' : '#64748b'}
        strokeWidth={1}
      />
      <text
        x={w / 2}
        y={h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={8}
        fontWeight={700}
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        {on ? 'ON' : 'OFF'}
      </text>
    </g>
  )
}

function FanMarker({
  x,
  y,
  size,
  label,
  spinning,
  on,
}: {
  x: number
  y: number
  size: number
  label: string
  spinning: boolean
  on: boolean
}) {
  const r = size / 2
  return (
    <g transform={`translate(${x}, ${y - 8})`} className="device-marker">
      {/* drop shadow plate */}
      <ellipse cx={0} cy={r + 6} rx={r * 0.9} ry={r * 0.25} fill="rgba(15,23,42,0.12)" />
      {/* ceiling mount */}
      <rect x={-3} y={-r - 8} width={6} height={10} fill="#64748b" rx={1} />
      <line x1={0} y1={-r + 2} x2={0} y2={-r - 8} stroke="#475569" strokeWidth={2} />
      {/* housing */}
      <circle r={r} fill={on ? '#fef3c7' : '#f1f5f9'} stroke={on ? '#f59e0b' : '#cbd5e1'} strokeWidth={2.5} />
      <g className={spinning ? 'fan-spinning' : ''}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d={`M 0 0 L ${r * 0.15} ${-r * 0.12} L 0 ${-r * 0.88} L ${-r * 0.15} ${-r * 0.12} Z`}
            fill={on ? '#92400e' : '#94a3b8'}
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle r={r * 0.18} fill={on ? '#b45309' : '#64748b'} />
      {/* label */}
      <text
        y={r + 18}
        textAnchor="middle"
        fill="#334155"
        fontSize={9}
        fontWeight={700}
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        {label}
      </text>
      <StatusBadge on={on} x={0} y={r + 24} />
    </g>
  )
}

function LightMarker({
  x,
  y,
  size,
  label,
  on,
}: {
  x: number
  y: number
  size: number
  label: string
  on: boolean
}) {
  const r = size / 2
  return (
    <g transform={`translate(${x}, ${y - 4})`} className="device-marker">
      {on && (
        <>
          <circle r={r * 1.8} fill="none" stroke="#fbbf24" strokeWidth={1} opacity={0.4} className="status-pulse-on" />
          <circle r={r * 1.3} fill="rgba(251,191,36,0.25)" />
        </>
      )}
      {/* shade */}
      <ellipse cx={0} cy={-r * 0.3} rx={r * 0.9} ry={r * 0.35} fill={on ? '#fde68a' : '#e2e8f0'} stroke={on ? '#f59e0b' : '#cbd5e1'} strokeWidth={1.5} />
      {/* bulb */}
      <circle r={r * 0.55} cy={r * 0.15} fill={on ? '#fbbf24' : '#cbd5e1'} stroke={on ? '#f59e0b' : '#94a3b8'} strokeWidth={2} />
      {on && (
        <g stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" opacity={0.8}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={Math.cos((a * Math.PI) / 180) * r * 0.9}
              y1={Math.sin((a * Math.PI) / 180) * r * 0.9}
              x2={Math.cos((a * Math.PI) / 180) * r * 1.25}
              y2={Math.sin((a * Math.PI) / 180) * r * 1.25}
            />
          ))}
        </g>
      )}
      <text
        y={r + 20}
        textAnchor="middle"
        fill="#334155"
        fontSize={9}
        fontWeight={700}
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        {label}
      </text>
      <StatusBadge on={on} x={0} y={r + 26} />
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
        const shortLabel = device.label

        if (device.type === 'fan') {
          return (
            <FanMarker
              key={device.id}
              x={x}
              y={y}
              size={pos.size + 12}
              label={shortLabel.trim()}
              spinning={on}
              on={on}
            />
          )
        }
        return (
          <LightMarker
            key={device.id}
            x={x}
            y={y}
            size={pos.size + 10}
            label={shortLabel.trim()}
            on={on}
          />
        )
      })}
    </svg>
  )
}
