import type { SupabaseClient } from '@supabase/supabase-js'

const ROOMS = ['drawing', 'workroom1', 'workroom2'] as const

function isOfficeHours(): boolean {
  const h = new Date().getHours()
  return h >= 9 && h < 17
}

async function hasRecentAlert(
  supabase: SupabaseClient,
  ruleType: string,
  room: string | null,
  deviceId?: string,
): Promise<boolean> {
  let q = supabase
    .from('alerts')
    .select('id')
    .eq('rule_type', ruleType)
    .gte('created_at', new Date(Date.now() - 60 * 60_000).toISOString())

  if (room) q = q.eq('room', room)

  const { data } = await q.limit(1)
  if (data?.length) return true

  if (deviceId && ruleType === 'after_hours') {
    const { data: devAlerts } = await supabase
      .from('alerts')
      .select('message')
      .eq('rule_type', 'after_hours')
      .gte('created_at', new Date(Date.now() - 60 * 60_000).toISOString())
    if (devAlerts?.some((a) => a.message.includes(deviceId))) return true
  }

  return false
}

const ROOM_LABELS: Record<string, string> = {
  drawing: 'Drawing Room',
  workroom1: 'Work Room 1',
  workroom2: 'Work Room 2',
}

export async function checkAlerts(supabase: SupabaseClient) {
  const { data: devices } = await supabase.from('devices').select('*')
  if (!devices) return

  const officeHours = isOfficeHours()

  if (!officeHours) {
    for (const d of devices) {
      if (d.status !== 'on') continue
      const recent = await hasRecentAlert(supabase, 'after_hours', d.room)
      if (recent) continue

      await supabase.from('alerts').insert({
        message: `${ROOM_LABELS[d.room]} ${d.label} is on outside office hours (9 AM - 5 PM)`,
        severity: 'warning',
        room: d.room,
        rule_type: 'after_hours',
      })
    }
  }

  for (const room of ROOMS) {
    const roomDevices = devices.filter((d) => d.room === room)
    if (roomDevices.length !== 5) continue

    const allOn = roomDevices.every((d) => d.status === 'on')
    if (!allOn) continue

    const twoHoursAgo = Date.now() - 2 * 60 * 60_000
    const allStuck = roomDevices.every(
      (d) => d.on_since && new Date(d.on_since).getTime() <= twoHoursAgo,
    )
    if (!allStuck) continue

    const recent = await hasRecentAlert(supabase, 'room_stuck', room)
    if (recent) continue

    await supabase.from('alerts').insert({
      message: `${ROOM_LABELS[room]} has been fully on for over 2 hours`,
      severity: 'warning',
      room,
      rule_type: 'room_stuck',
    })
  }
}
