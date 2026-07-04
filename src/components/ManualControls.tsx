import { Fan, Lightbulb, ToggleLeft, Wifi } from 'lucide-react'
import { useOfficeData } from '../hooks/useOfficeData'
import { ROOM_LABELS, ROOM_ORDER, type Device, type Room } from '../lib/types'

function DeviceToggle({ device }: { device: Device }) {
  const { toggleDevice } = useOfficeData()
  const on = device.status === 'on'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <div className={`device-row ${on ? 'device-row--on' : ''}`}>
      <div className="device-row__info">
        <span className="device-row__icon">
          <Icon size={14} strokeWidth={2.25} aria-hidden />
        </span>
        <span className="device-row__label">{device.label}</span>
      </div>
      <button
        type="button"
        className={`switch ${on ? 'switch--on' : ''}`}
        role="switch"
        aria-checked={on}
        aria-label={`${device.label} in ${ROOM_LABELS[device.room]}`}
        onClick={() => toggleDevice(device.id)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  )
}

function RoomGroup({ room }: { room: Room }) {
  const { devices } = useOfficeData()
  const roomDevices = devices.filter((d) => d.room === room)

  return (
    <div className="room-group">
      <p className="room-group__title">
        <span className="room-group__dot" />
        {ROOM_LABELS[room]}
      </p>
      {roomDevices.map((d) => (
        <DeviceToggle key={d.id} device={d} />
      ))}
    </div>
  )
}

export function ManualControls() {
  const { connected } = useOfficeData()

  return (
    <div className="panel-card panel-card--grow">
      <div className="panel-card__header">
        <div className="panel-card__title-group">
          <span className="panel-card__icon">
            <ToggleLeft size={15} strokeWidth={2.25} aria-hidden />
          </span>
          <h2 className="panel-card__title">Device Controls</h2>
        </div>
        <span className={`panel-badge ${connected ? 'panel-badge--live' : 'panel-badge--local'}`}>
          <Wifi size={9} className="mr-1 inline" aria-hidden />
          {connected ? 'Live' : 'Local'}
        </span>
      </div>
      <div className="panel-scroll panel-card__body">
        {ROOM_ORDER.map((room) => (
          <RoomGroup key={room} room={room} />
        ))}
      </div>
    </div>
  )
}
