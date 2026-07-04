import layout from '../../lib/layout.json'
import type { Room } from '../../lib/types'

const vb = layout.viewBox

function CarpetPattern() {
  return (
    <pattern id="carpet" patternUnits="userSpaceOnUse" width="24" height="24">
      <rect width="24" height="24" fill="#c4a574" />
      <rect width="12" height="12" fill="#b89968" opacity="0.4" />
      <rect x="12" y="12" width="12" height="12" fill="#b89968" opacity="0.4" />
    </pattern>
  )
}

function TilePattern() {
  return (
    <pattern id="tile-gray" patternUnits="userSpaceOnUse" width="40" height="40">
      <rect width="40" height="40" fill="#b8bcc4" />
      <rect width="38" height="38" x="1" y="1" fill="#c8ccd4" stroke="#a0a4ac" strokeWidth="0.5" />
    </pattern>
  )
}

function WoodPattern() {
  return (
    <pattern id="wood-plank" patternUnits="userSpaceOnUse" width="80" height="20">
      <rect width="80" height="20" fill="#d4b896" />
      <line x1="0" y1="10" x2="80" y2="10" stroke="#c4a886" strokeWidth="1" />
      <line x1="20" y1="0" x2="20" y2="20" stroke="#c4a886" strokeWidth="0.5" opacity="0.5" />
      <line x1="50" y1="0" x2="50" y2="20" stroke="#c4a886" strokeWidth="0.5" opacity="0.5" />
    </pattern>
  )
}

function HallTilePattern() {
  return (
    <pattern id="hall-tile" patternUnits="userSpaceOnUse" width="60" height="60">
      <rect width="60" height="60" fill="#d9cdb8" />
      <rect width="58" height="58" x="1" y="1" fill="#e5d9c4" stroke="#c9bd9f" strokeWidth="1" />
    </pattern>
  )
}

function Wall({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="none"
      stroke="#94a3b8"
      strokeWidth={10}
      rx={2}
    />
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
      fill="#a8d4f0"
      stroke="#7eb8d8"
      strokeWidth={2}
      rx={2}
    />
  )
}

function DoorArc({ x, y, radius, roomX, roomY, swing }: {
  x: number; y: number; radius: number; roomX: number; roomY: number
  swing: string
}) {
  const cx = roomX + x
  const cy = roomY + y
  let d = ''
  if (swing === 'left') d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 1 ${cx - radius} ${cy - radius}`
  else if (swing === 'right') d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy - radius}`
  else d = `M ${cx} ${cy} A ${radius} ${radius} 0 0 0 ${cx} ${cy + radius}`

  return (
  <>
    <path d={d} fill="none" stroke="#4a5568" strokeWidth={2} strokeDasharray="4 2" />
    <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#3d4a5c" strokeWidth={3} />
  </>
  )
}

function Desk({ x, y, w, h, roomX, roomY }: {
  x: number; y: number; w: number; h: number; roomX: number; roomY: number
}) {
  const dx = roomX + x
  const dy = roomY + y
  return (
    <g>
      <rect x={dx} y={dy} width={w} height={h} fill="#8b6914" rx={3} />
      <rect x={dx + 4} y={dy + 4} width={w - 8} height={h - 20} fill="#6b5010" rx={2} />
      <rect x={dx + w / 2 - 25} y={dy + 8} width={50} height={35} fill="#1a1a2e" rx={2} />
      <rect x={dx + w / 2 - 20} y={dy + h + 2} width={40} height={35} fill="#2a2a3e" rx={4} />
      <ellipse cx={dx + w / 2} cy={dy + h + 42} rx={22} ry={8} fill="#1a1a2e" opacity={0.3} />
    </g>
  )
}

function Sofa({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#c4956a" rx={8} />
      <rect x={x} y={y} width={60} height={h} fill="#b8855a" rx={8} />
      <rect x={x + w - 80} y={y + 20} width={80} height={h - 40} fill="#b8855a" rx={6} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 30} fill="#d4a57a" rx={6} />
    </g>
  )
}

function Armchair({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#c4956a" rx={10} />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 20} fill="#d4a57a" rx={6} />
    </g>
  )
}

function CoffeeTable({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} fill="#6b4423" rx={4} stroke="#5a3818" strokeWidth={2} />
  )
}

function WaterCooler({ x, y, w, h, roomX, roomY }: {
  x: number; y: number; w: number; h: number; roomX: number; roomY: number
}) {
  const dx = roomX + x
  const dy = roomY + y
  return (
    <g>
      <rect x={dx} y={dy} width={w} height={h} fill="#e8e8e8" rx={4} stroke="#ccc" strokeWidth={1} />
      <rect x={dx + 8} y={dy + 10} width={w - 16} height={h * 0.5} fill="#4a9eff" rx={3} opacity={0.7} />
      <rect x={dx + 15} y={dy + h - 25} width={w - 30} height={15} fill="#333" rx={2} />
    </g>
  )
}

function RoomFloor({ room, fill }: { room: keyof typeof layout.rooms; fill: string }) {
  const r = layout.rooms[room]
  return <rect x={r.x} y={r.y} width={r.width} height={r.height} fill={fill} />
}

function RoomLabel({ room }: { room: Room }) {
  const r = layout.rooms[room]
  return (
    <text
      x={r.x + r.width / 2}
      y={r.y + 28}
      textAnchor="middle"
      fill="#4a5568"
      fontSize={14}
      fontWeight={600}
    >
      {r.label}
    </text>
  )
}

export function FloorPlanStructure() {
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

      <RoomLabel room="drawing" />
      <RoomLabel room="workroom1" />
      <RoomLabel room="workroom2" />

      {layout.doors.find((d) => d.label === 'ENTRY') && (
        <text
          x={hall.x + hall.width / 2}
          y={hall.y + hall.height - 20}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={12}
          fontWeight={500}
        >
          ENTRY
        </text>
      )}
    </>
  )
}

export function FloorPlanFurniture() {
  const drawing = layout.rooms.drawing
  const wr1 = layout.rooms.workroom1
  const wr2 = layout.rooms.workroom2
  const hall = layout.rooms.hallway
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

      <WaterCooler
        x={furn.hallway.waterCooler.x}
        y={furn.hallway.waterCooler.y}
        w={furn.hallway.waterCooler.width}
        h={furn.hallway.waterCooler.height}
        roomX={hall.x}
        roomY={hall.y}
      />
    </>
  )
}

export function StaticPlants() {
  return (
    <>
      {layout.plants.map((plant) => {
        const room = layout.rooms[plant.room as keyof typeof layout.rooms]
        const x = room.x + plant.x
        const y = room.y + plant.y
        const s = plant.size
        return (
          <g key={plant.id} transform={`translate(${x}, ${y})`}>
            <ellipse cx={0} cy={s * 0.4} rx={s * 0.35} ry={s * 0.12} fill="#2d4a28" opacity={0.3} />
            <rect x={-s * 0.08} y={0} width={s * 0.16} height={s * 0.45} fill="#5c4033" rx={2} />
            <ellipse cx={0} cy={-s * 0.1} rx={s * 0.4} ry={s * 0.35} fill="#3d7a37" />
          </g>
        )
      })}
    </>
  )
}

export function FloorPlanScene() {
  return (
    <svg viewBox={`0 0 ${vb.width} ${vb.height}`} className="w-full h-auto">
      <defs>
        <CarpetPattern />
        <TilePattern />
        <WoodPattern />
        <HallTilePattern />
      </defs>
      <FloorPlanStructure />
      <FloorPlanFurniture />
    </svg>
  )
}

export { layout as floorLayout }
