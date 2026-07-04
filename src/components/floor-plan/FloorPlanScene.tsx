import layout from '../../lib/layout.json'
import type { Room } from '../../lib/types'

const vb = layout.viewBox

export function FloorPlanDefs() {
  return (
    <defs>
      <pattern id="carpet" patternUnits="userSpaceOnUse" width="24" height="24">
        <rect width="24" height="24" fill="#d4bc96" />
        <rect width="12" height="12" fill="#c9ad88" opacity="0.35" />
        <rect x="12" y="12" width="12" height="12" fill="#c9ad88" opacity="0.35" />
      </pattern>
      <pattern id="tile-gray" patternUnits="userSpaceOnUse" width="40" height="40">
        <rect width="40" height="40" fill="#c5cad3" />
        <rect width="38" height="38" x="1" y="1" fill="#d5dae3" stroke="#aeb4bf" strokeWidth="0.5" />
      </pattern>
      <pattern id="wood-plank" patternUnits="userSpaceOnUse" width="80" height="20">
        <rect width="80" height="20" fill="#dcc9a8" />
        <line x1="0" y1="10" x2="80" y2="10" stroke="#cbb896" strokeWidth="1" />
      </pattern>
      <pattern id="hall-tile" patternUnits="userSpaceOnUse" width="60" height="60">
        <rect width="60" height="60" fill="#ddd0b8" />
        <rect width="58" height="58" x="1" y="1" fill="#ebe2d0" stroke="#cfc2a8" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

function Wall({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#94a3b8" strokeWidth={8} rx={2} />
  )
}

function Window({ x, y, width, height, roomX, roomY }: {
  x: number; y: number; width: number; height: number; roomX: number; roomY: number
}) {
  return (
    <rect
      x={roomX + x}
      y={roomY + y}
      width={width}
      height={height}
      fill="#b8dff5"
      stroke="#7eb8d8"
      strokeWidth={1.5}
      rx={2}
    />
  )
}

function DoorArc({ x, y, radius, roomX, roomY, swing }: {
  x: number; y: number; radius: number; roomX: number; roomY: number; swing: string
}) {
  const cx = roomX + x
  const cy = roomY + y
  let d = ''
  if (swing === 'left') d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 1 ${cx - radius} ${cy - radius}`
  else if (swing === 'right') d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy - radius}`
  else d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 0 ${cx} ${cy + radius}`

  return (
    <>
      <path d={d} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 2" />
      <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#475569" strokeWidth={2} />
    </>
  )
}

function Desk({ x, y, w, h, roomX, roomY }: {
  x: number; y: number; w: number; h: number; roomX: number; roomY: number
}) {
  const dx = roomX + x
  const dy = roomY + y
  return (
    <g opacity={0.9}>
      <rect x={dx} y={dy} width={w} height={h} fill="#9a7b4f" rx={3} />
      <rect x={dx + 4} y={dy + 4} width={w - 8} height={h - 18} fill="#7d6340" rx={2} />
      <rect x={dx + w / 2 - 22} y={dy + 8} width={44} height={30} fill="#1e293b" rx={2} />
    </g>
  )
}

function Sofa({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g opacity={0.9}>
      <rect x={x} y={y} width={w} height={h} fill="#c4956a" rx={8} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 24} fill="#d4a57a" rx={6} />
    </g>
  )
}

function Armchair({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g opacity={0.9}>
      <rect x={x} y={y} width={w} height={h} fill="#c4956a" rx={10} />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="#d4a57a" rx={6} />
    </g>
  )
}

function CoffeeTable({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} fill="#6b4423" rx={4} stroke="#5a3818" strokeWidth={1.5} opacity={0.9} />
  )
}

function RoomFloor({ room, fill }: { room: keyof typeof layout.rooms; fill: string }) {
  const r = layout.rooms[room]
  return <rect x={r.x} y={r.y} width={r.width} height={r.height} fill={fill} />
}

function RoomLabel({ room, alert }: { room: Room; alert?: boolean }) {
  const r = layout.rooms[room]
  return (
    <g>
      <text
        x={r.x + r.width / 2}
        y={r.y + 26}
        textAnchor="middle"
        fill="#475569"
        fontSize={13}
        fontWeight={600}
        fontFamily="DM Sans, sans-serif"
      >
        {r.label}
      </text>
      {alert && (
        <text x={r.x + r.width - 18} y={r.y + 22} fontSize={14} textAnchor="middle">
          ⚠️
        </text>
      )}
    </g>
  )
}

export function FloorPlanStructure({ alertRooms }: { alertRooms?: Set<Room> }) {
  const drawing = layout.rooms.drawing
  const wr1 = layout.rooms.workroom1
  const wr2 = layout.rooms.workroom2
  const hall = layout.rooms.hallway

  return (
    <>
      <rect width={vb.width} height={vb.height} fill="#eef2f6" />

      <RoomFloor room="drawing" fill="url(#carpet)" />
      <RoomFloor room="workroom1" fill="url(#tile-gray)" />
      <RoomFloor room="workroom2" fill="url(#wood-plank)" />
      <RoomFloor room="hallway" fill="url(#hall-tile)" />

      <Wall x={drawing.x} y={drawing.y} w={drawing.width} h={drawing.height} />
      <Wall x={wr1.x} y={wr1.y} w={wr1.width} h={wr1.height} />
      <Wall x={wr2.x} y={wr2.y} w={wr2.width} h={wr2.height} />
      <Wall x={hall.x} y={hall.y} w={hall.width} h={hall.height} />

      {layout.windows.map((win, i) => {
        const room = layout.rooms[win.room as Room]
        return (
          <Window
            key={i}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            roomX={room.x}
            roomY={room.y}
          />
        )
      })}

      {layout.doors.map((door, i) => {
        const room = layout.rooms[door.room as Room]
        return (
          <DoorArc
            key={i}
            x={door.x}
            y={door.y}
            radius={door.radius}
            roomX={room.x}
            roomY={room.y}
            swing={door.swing}
          />
        )
      })}

      <RoomLabel room="drawing" alert={alertRooms?.has('drawing')} />
      <RoomLabel room="workroom1" alert={alertRooms?.has('workroom1')} />
      <RoomLabel room="workroom2" alert={alertRooms?.has('workroom2')} />

      <text
        x={hall.x + hall.width / 2}
        y={hall.y + hall.height - 18}
        textAnchor="middle"
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
        fontFamily="DM Sans, sans-serif"
      >
        Hallway
      </text>
    </>
  )
}

export function FloorPlanFurniture() {
  const drawing = layout.rooms.drawing
  const wr1 = layout.rooms.workroom1
  const wr2 = layout.rooms.workroom2
  const furn = layout.furniture

  return (
    <>
      <Sofa
        x={drawing.x + furn.drawing.sofa.x}
        y={drawing.y + furn.drawing.sofa.y}
        w={furn.drawing.sofa.width}
        h={furn.drawing.sofa.height}
      />
      <Armchair
        x={drawing.x + furn.drawing.armchair.x}
        y={drawing.y + furn.drawing.armchair.y}
        w={furn.drawing.armchair.width}
        h={furn.drawing.armchair.height}
      />
      <CoffeeTable
        x={drawing.x + furn.drawing.coffeeTable.x}
        y={drawing.y + furn.drawing.coffeeTable.y}
        w={furn.drawing.coffeeTable.width}
        h={furn.drawing.coffeeTable.height}
      />

      {furn.workroom1.desks.map((desk, i) => (
        <Desk key={`wr1-${i}`} x={desk.x} y={desk.y} w={desk.width} h={desk.height} roomX={wr1.x} roomY={wr1.y} />
      ))}
      {furn.workroom2.desks.map((desk, i) => (
        <Desk key={`wr2-${i}`} x={desk.x} y={desk.y} w={desk.width} h={desk.height} roomX={wr2.x} roomY={wr2.y} />
      ))}
    </>
  )
}
