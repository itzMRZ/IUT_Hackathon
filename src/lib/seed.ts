import type { OfficeSnapshot } from './types'

/** Matches server seed — keeps UI visible when the backend is offline. */
export const SEED_SNAPSHOT: OfficeSnapshot = {
  autoSim: true,
  alerts: [
    {
      id: 'alert-seed-1',
      message: 'Work Room 2 has been fully on for over 2 hours',
      severity: 'warning',
      room: 'workroom2',
      rule_type: 'room_stuck',
      created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    },
  ],
  devices: [
    { id: 'drawing-fan-1', type: 'fan', room: 'drawing', label: 'Fan 1', status: 'on', wattage: 60, last_changed: new Date(Date.now() - 85 * 60_000).toISOString(), on_since: new Date(Date.now() - 85 * 60_000).toISOString() },
    { id: 'drawing-fan-2', type: 'fan', room: 'drawing', label: 'Fan 2', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 120 * 60_000).toISOString(), on_since: null },
    { id: 'drawing-light-1', type: 'light', room: 'drawing', label: 'Light 1', status: 'on', wattage: 15, last_changed: new Date(Date.now() - 45 * 60_000).toISOString(), on_since: new Date(Date.now() - 45 * 60_000).toISOString() },
    { id: 'drawing-light-2', type: 'light', room: 'drawing', label: 'Light 2', status: 'on', wattage: 15, last_changed: new Date(Date.now() - 30 * 60_000).toISOString(), on_since: new Date(Date.now() - 30 * 60_000).toISOString() },
    { id: 'drawing-light-3', type: 'light', room: 'drawing', label: 'Light 3', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 90 * 60_000).toISOString(), on_since: null },
    { id: 'workroom1-fan-1', type: 'fan', room: 'workroom1', label: 'Fan 1', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 200 * 60_000).toISOString(), on_since: null },
    { id: 'workroom1-fan-2', type: 'fan', room: 'workroom1', label: 'Fan 2', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 200 * 60_000).toISOString(), on_since: null },
    { id: 'workroom1-light-1', type: 'light', room: 'workroom1', label: 'Light 1', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 180 * 60_000).toISOString(), on_since: null },
    { id: 'workroom1-light-2', type: 'light', room: 'workroom1', label: 'Light 2', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 180 * 60_000).toISOString(), on_since: null },
    { id: 'workroom1-light-3', type: 'light', room: 'workroom1', label: 'Light 3', status: 'off', wattage: 0, last_changed: new Date(Date.now() - 180 * 60_000).toISOString(), on_since: null },
    { id: 'workroom2-fan-1', type: 'fan', room: 'workroom2', label: 'Fan 1', status: 'on', wattage: 60, last_changed: new Date(Date.now() - 135 * 60_000).toISOString(), on_since: new Date(Date.now() - 135 * 60_000).toISOString() },
    { id: 'workroom2-fan-2', type: 'fan', room: 'workroom2', label: 'Fan 2', status: 'on', wattage: 60, last_changed: new Date(Date.now() - 130 * 60_000).toISOString(), on_since: new Date(Date.now() - 130 * 60_000).toISOString() },
    { id: 'workroom2-light-1', type: 'light', room: 'workroom2', label: 'Light 1', status: 'on', wattage: 15, last_changed: new Date(Date.now() - 125 * 60_000).toISOString(), on_since: new Date(Date.now() - 125 * 60_000).toISOString() },
    { id: 'workroom2-light-2', type: 'light', room: 'workroom2', label: 'Light 2', status: 'on', wattage: 15, last_changed: new Date(Date.now() - 125 * 60_000).toISOString(), on_since: new Date(Date.now() - 125 * 60_000).toISOString() },
    { id: 'workroom2-light-3', type: 'light', room: 'workroom2', label: 'Light 3', status: 'on', wattage: 15, last_changed: new Date(Date.now() - 125 * 60_000).toISOString(), on_since: new Date(Date.now() - 125 * 60_000).toISOString() },
  ],
}
