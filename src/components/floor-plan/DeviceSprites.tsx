import layout from '../../lib/layout.json'
import type { Device } from '../../lib/types'

interface Props {
  devices: Device[]
  onToggle: (id: string) => void
}

function CeilingFan({ x, y, bladeLen, on, label, onClick }: {
  x: number; y: number; bladeLen: number; on: boolean; label: string; onClick: () => void
}) {
  const hub = bladeLen * 0.14
  const bladeW = bladeLen * 0.13
  const hitR = bladeLen * 0.65

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
      <circle r={hitR} fill="transparent" />
      {on && (
        <circle r={bladeLen * 0.55} fill="none" stroke="#34d399" strokeWidth={2} opacity={0.5} pointerEvents="none" />
      )}
      <circle r={hub} fill="#57534e" stroke="#44403c" strokeWidth={1.5} pointerEvents="none" />
      <circle r={hub * 0.4} fill="#78716c" pointerEvents="none" />
      <g pointerEvents="none">
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
              y={-bladeLen + hub}
              width={bladeW}
              height={bladeLen - hub - 2}
              rx={bladeW / 3}
              fill={on ? '#92400e' : '#a8a29e'}
              stroke={on ? '#78350f' : '#78716c'}
              strokeWidth={0.75}
            />
          </g>
        ))}
      </g>
      <text
        y={bladeLen + 11}
        textAnchor="middle"
        fill="#334155"
        fontSize={8}
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
  const hitR = r + 14

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
      <circle r={hitR} fill="transparent" />
      {on && <circle r={r + 8} fill="none" stroke="#fbbf24" strokeWidth={1.5} opacity={0.6} pointerEvents="none" />}
      <circle r={r + 3} fill={on ? '#fef3c7' : '#f1f5f9'} stroke={on ? '#f59e0b' : '#cbd5e1'} strokeWidth={1.5} pointerEvents="none" />
      <circle r={r} fill={on ? '#fbbf24' : '#94a3b8'} pointerEvents="none" />
      {on && <circle r={r * 0.3} fill="#fffbeb" pointerEvents="none" />}
      <text
        y={size + 10}
        textAnchor="middle"
        fill="#334155"
        fontSize={8}
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
          const bladeLen = 'bladeLen' in pos ? pos.bladeLen : 48
          return (
            <CeilingFan key={device.id} x={x} y={y} bladeLen={bladeLen} on={on} label={device.label} onClick={handleClick} />
          )
        }
        return (
          <CeilingLight key={device.id} x={x} y={y} size={pos.size} on={on} label={device.label} onClick={handleClick} />
        )
      })}
    </>
  )
}
