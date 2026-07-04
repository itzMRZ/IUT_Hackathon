import type { OfficeSnapshot } from '../shared/types.js'
import { ROOM_LABELS } from '../shared/types.js'

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

function diffMessages(prev: OfficeSnapshot, next: OfficeSnapshot): string[] {
  const lines: string[] = []

  for (const device of next.devices) {
    const before = prev.devices.find((d) => d.id === device.id)
    if (before && before.status !== device.status) {
      lines.push(
        `**${ROOM_LABELS[device.room]} ${device.label}** → ${device.status.toUpperCase()} (${device.wattage}W)`,
      )
    }
  }

  if (prev.autoSim !== next.autoSim) {
    lines.push(`Auto simulation **${next.autoSim ? 'enabled' : 'disabled'}**`)
  }

  const prevAlertIds = new Set(prev.alerts.map((a) => a.id))
  for (const alert of next.alerts) {
    if (!prevAlertIds.has(alert.id)) {
      lines.push(`⚠️ ${alert.message}`)
    }
  }

  return lines
}

export async function notifyDiscordWebhook(prev: OfficeSnapshot, next: OfficeSnapshot) {
  if (!WEBHOOK_URL) return

  const lines = diffMessages(prev, next)
  if (lines.length === 0) return

  const totalW = next.devices.reduce((s, d) => s + d.wattage, 0)
  const onCount = next.devices.filter((d) => d.status === 'on').length

  const body = {
    embeds: [
      {
        title: '🏢 Office Monitor Update',
        description: lines.join('\n'),
        color: next.alerts.length > prev.alerts.length ? 0xf59e0b : 0x7c3aed,
        fields: [
          { name: 'Total Power', value: `${totalW}W`, inline: true },
          { name: 'Devices On', value: `${onCount}/${next.devices.length}`, inline: true },
          { name: 'Alerts', value: String(next.alerts.length), inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`Discord webhook failed: ${res.status} ${await res.text()}`)
    }
  } catch (err) {
    console.error('Discord webhook error:', err)
  }
}
