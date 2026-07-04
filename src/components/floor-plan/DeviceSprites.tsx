import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

const FAN_SPIN_SEC = '2.6s'

interface Props {
  devices: Device[]
  onToggle: (id: string) => void
}

function CeilingFan({ x, y, bladeLen, on, label, onClick }: {
  x: number; y: number; bladeLen: number; on: boolean; label: string; onClick: () => void
}) {
  const hub = bladeLen * 0.12
  const bladeW = bladeLen * 0.11
  const hitR = bladeLen * 0.5

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="device-sprite"
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${on ? 'on' : 'off'}. Click to toggle.`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <circle className="device-hit" r={hitR} fill="transparent" />
      {/* ceiling mount */}
      <rect x={-hub * 0.8} y={-hub * 0.3} width={hub * 1.6} height={hub * 0.5} rx={2} fill="#64748b" pointerEvents="none" />
      <circle r={hub} fill="#44403c" stroke="#292524" strokeWidth={1} pointerEvents="none" />
      <circle r={hub * 0.35} fill="#78716c" pointerEvents="none" />
      <g pointerEvents="none">
        {on && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur={FAN_SPIN_SEC}
            repeatCount="indefinite"
          />
        )}
        {[0, 120, 240].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <rect
              x={-bladeW / 2}
              y={-bladeLen + hub + 2}
              width={bladeW}
              height={bladeLen - hub - 4}
              rx={bladeW / 2}
              fill={on ? '#a16207' : '#a8a29e'}
              stroke={on ? '#713f12' : '#78716c'}
              strokeWidth={0.5}
            />
          </g>
        ))}
      </g>
      {on && (
        <circle r={bladeLen * 0.42} fill="none" stroke="#34d399" strokeWidth={1.5} opacity={0.35} pointerEvents="none" />
      )}
      <text
        y={bladeLen + 9}
        textAnchor="middle"
        fill="#475569"
        fontSize={9}
        fontWeight={600}
        fontFamily="DM Sans, sans-serif"
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  )
}

function CeilingLight({ x, y, size, on, label, onClick }: {
  x: number; y: number; size: number; on: boolean; label: string; onClick: () => void
}) {
  const r = size / 2
  const hitR = r + 10

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="device-sprite"
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${on ? 'on' : 'off'}. Click to toggle.`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <circle className="device-hit" r={hitR} fill="transparent" />
      {/* fixture base */}
      <rect x={-r * 0.5} y={-r - 4} width={r} height={4} rx={1} fill="#94a3b8" pointerEvents="none" />
      {on && [0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1={0}
          y1={0}
          x2={Math.cos((deg * Math.PI) / 180) * (r + 6)}
          y2={Math.sin((deg * Math.PI) / 180) * (r + 6)}
          stroke="#fbbf24"
          strokeWidth={1}
          opacity={0.5}
          pointerEvents="none"
        />
      ))}
      <circle r={r + 2} fill={on ? '#fef9c3' : '#f1f5f9'} stroke={on ? '#eab308' : '#cbd5e1'} strokeWidth={1.5} pointerEvents="none" />
      <circle r={r} fill={on ? '#facc15' : '#94a3b8'} pointerEvents="none" />
      {on && <circle r={r * 0.25} fill="#fffef0" pointerEvents="none" />}
      <text
        y={size + 8}
        textAnchor="middle"
        fill="#475569"
        fontSize={9}
        fontWeight={600}
        fontFamily="DM Sans, sans-serif"
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  )
}

export function DeviceSprites({ devices, onToggle }: Props) {
  return (
    <>
      {devices.map((device) => {
        const pos = layout.devices[device.id as keyof typeof layout.devices]
        if (!pos) return null
        const room = layout.rooms[device.room]
        const x = room.x + pos.x
        const y = room.y + pos.y
        const on = device.status === 'on'
        const handleClick = () => onToggle(device.id)

        if (device.type === 'fan') {
          const bladeLen = 'bladeLen' in pos ? pos.bladeLen * 0.92 : 44
          return (
            <CeilingFan key={device.id} x={x} y={y} bladeLen={bladeLen} on={on} label={device.label} onClick={handleClick} />
          )
        }
        return (
          <CeilingLight key={device.id} x={x} y={y} size={pos.size * 0.95} on={on} label={device.label} onClick={handleClick} />
        )
      })}
    </>
  )
}
