import type { SupabaseClient } from '@supabase/supabase-js'

const FAN_W = 60
const LIGHT_W = 15

type DeviceRow = {
  id: string
  type: 'fan' | 'light'
  room: string
  status: 'on' | 'off'
  wattage: number
  on_since: string | null
}

function isOfficeHours(): boolean {
  const h = new Date().getHours()
  return h >= 9 && h < 17
}

function wattageFor(type: 'fan' | 'light', status: 'on' | 'off'): number {
  if (status === 'off') return 0
  return type === 'fan' ? FAN_W : LIGHT_W
}

export async function runTick(supabase: SupabaseClient) {
  const { data: devices, error } = await supabase.from('devices').select('*')
  if (error || !devices?.length) throw error ?? new Error('No devices')

  const count = Math.random() < 0.5 ? 1 : 2
  const shuffled = [...devices].sort(() => Math.random() - 0.5).slice(0, count)
  const officeHours = isOfficeHours()

  for (const d of shuffled as DeviceRow[]) {
    let turnOn: boolean
    if (officeHours) {
      turnOn = d.status === 'off' ? Math.random() < 0.6 : Math.random() < 0.4
    } else {
      turnOn = d.status === 'off' ? Math.random() < 0.1 : Math.random() < 0.7
    }

    const status = turnOn ? 'on' : 'off'
    if (status === d.status) continue

    const now = new Date().toISOString()
    await supabase
      .from('devices')
      .update({
        status,
        wattage: wattageFor(d.type, status),
        last_changed: now,
        on_since: status === 'on' ? now : null,
      })
      .eq('id', d.id)
  }
}
