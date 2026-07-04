/**
 * Office Monitor — Discord Bot Starter
 * ─────────────────────────────────────
 * This is a working starter bot for whoever owns the Discord integration.
 * It already implements:
 *   - Text commands that read live data from the REST API
 *   - A WebSocket listener that posts alerts to a channel in real time
 *
 * Everything you need to extend it (slash commands, buttons to toggle
 * devices, richer embeds, etc.) is documented in
 * `docs/DISCORD_BOT_HANDOFF.md`. Read that first.
 *
 * Run with:  npm run discord
 * Requires:  DISCORD_TOKEN in .env (see .env.example)
 */
import 'dotenv/config'
import { Client, GatewayIntentBits, EmbedBuilder, type TextChannel } from 'discord.js'
import WebSocket from 'ws'
import type { OfficeSnapshot, ServerMessage, Alert } from '../shared/types.js'
import { ROOM_LABELS } from '../shared/types.js'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'
const WS_URL = process.env.WS_URL ?? API_URL.replace(/^http/, 'ws') + '/ws'
const PREFIX = process.env.DISCORD_PREFIX ?? '!'
const ALERT_CHANNEL_ID = process.env.DISCORD_ALERT_CHANNEL_ID

const BRAND_COLOR = 0x2563eb
const ALERT_COLOR = 0xd97706

// ── REST helpers ──────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T | { error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`)
    const body = await res.json()
    if (!res.ok) return { error: (body as { error?: string }).error ?? `API error ${res.status}` }
    return body as T
  } catch {
    return { error: 'Could not reach the office server. Is `npm run server` running?' }
  }
}

async function apiPost<T>(path: string, payload: unknown): Promise<T | { error: string }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json()
    if (!res.ok) return { error: (body as { error?: string }).error ?? `API error ${res.status}` }
    return body as T
  } catch {
    return { error: 'Could not reach the office server. Is `npm run server` running?' }
  }
}

// ── Discord client ────────────────────────────────────────────────────────

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user?.tag}`)
  console.log(`REST API: ${API_URL}`)
  console.log(`Commands: ${PREFIX}status, ${PREFIX}room <name>, ${PREFIX}usage, ${PREFIX}help`)
  if (ALERT_CHANNEL_ID) {
    console.log(`Live alerts will post to channel ${ALERT_CHANNEL_ID}`)
    connectLiveAlerts()
  } else {
    console.log('Set DISCORD_ALERT_CHANNEL_ID in .env to enable live alert push.')
  }
})

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return

  const args = message.content.slice(PREFIX.length).trim()
  const [cmd, ...rest] = args.split(/\s+/)
  const roomArg = rest.join(' ').trim()

  switch (cmd) {
    case 'status': {
      const data = await apiGet<{ text: string }>('/api/status')
      if ('error' in data) {
        await message.reply(data.error)
      } else {
        await message.reply({ embeds: [new EmbedBuilder().setTitle('🏢 Office Status').setDescription(data.text).setColor(BRAND_COLOR)] })
      }
      break
    }

    case 'room': {
      if (!roomArg) {
        await message.reply(`Usage: \`${PREFIX}room drawing\` (drawing, workroom1, workroom2)`)
        break
      }
      const data = await apiGet<{ text: string }>(`/api/room/${encodeURIComponent(roomArg)}`)
      await message.reply('error' in data ? data.error : data.text)
      break
    }

    case 'usage': {
      const data = await apiGet<{ text: string }>('/api/usage')
      if ('error' in data) {
        await message.reply(data.error)
      } else {
        await message.reply({ embeds: [new EmbedBuilder().setTitle('⚡ Power Usage').setDescription(data.text).setColor(BRAND_COLOR)] })
      }
      break
    }

    case 'toggle': {
      if (!roomArg) {
        await message.reply(`Usage: \`${PREFIX}toggle drawing-fan-1\` (see device IDs in docs)`)
        break
      }
      const data = await apiPost<OfficeSnapshot>('/api/toggle', { deviceId: roomArg })
      if ('error' in data) {
        await message.reply(data.error)
      } else {
        await message.reply(`Toggled \`${roomArg}\`.`)
      }
      break
    }

    case 'help': {
      await message.reply(
        [
          '**Office Monitor Bot**',
          `\`${PREFIX}status\` — all rooms at a glance`,
          `\`${PREFIX}room <name>\` — drawing, workroom1, workroom2`,
          `\`${PREFIX}usage\` — live wattage breakdown`,
          `\`${PREFIX}toggle <deviceId>\` — flip a device (e.g. drawing-fan-1)`,
        ].join('\n'),
      )
      break
    }
  }
})

// ── Live alert push over WebSocket ──────────────────────────────────────
// Keeps a running snapshot so we only announce *new* alerts, not the whole
// list on every reconnect.

let seenAlertIds = new Set<string>()
let firstSnapshot = true

function connectLiveAlerts() {
  const ws = new WebSocket(WS_URL)

  ws.on('open', () => console.log('Connected to office WebSocket for live alerts'))

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as ServerMessage
      if (msg.type !== 'snapshot') return
      await handleSnapshot(msg.data)
    } catch {
      /* ignore malformed messages */
    }
  })

  ws.on('close', () => {
    console.log('WebSocket closed, reconnecting in 5s…')
    setTimeout(connectLiveAlerts, 5000)
  })

  ws.on('error', () => ws.close())
}

async function handleSnapshot(snapshot: OfficeSnapshot) {
  if (firstSnapshot) {
    // Don't spam old alerts on startup — just remember what already exists.
    seenAlertIds = new Set(snapshot.alerts.map((a) => a.id))
    firstSnapshot = false
    return
  }

  const newAlerts = snapshot.alerts.filter((a) => !seenAlertIds.has(a.id))
  seenAlertIds = new Set(snapshot.alerts.map((a) => a.id))

  if (newAlerts.length === 0 || !ALERT_CHANNEL_ID) return

  const channel = await client.channels.fetch(ALERT_CHANNEL_ID).catch(() => null)
  if (!channel?.isTextBased()) return

  for (const alert of newAlerts) {
    await postAlertEmbed(channel as TextChannel, alert)
  }
}

async function postAlertEmbed(channel: TextChannel, alert: Alert) {
  const embed = new EmbedBuilder()
    .setTitle('⚠️ Office Alert')
    .setDescription(alert.message)
    .setColor(ALERT_COLOR)
    .addFields(
      { name: 'Room', value: alert.room ? ROOM_LABELS[alert.room] : 'All rooms', inline: true },
      { name: 'Type', value: alert.rule_type, inline: true },
    )
    .setTimestamp(new Date(alert.created_at))

  await channel.send({ embeds: [embed] })
}

// ── Boot ──────────────────────────────────────────────────────────────────

const token = process.env.DISCORD_TOKEN
if (!token) {
  console.error('DISCORD_TOKEN is required. Copy .env.example to .env and add your bot token.')
  process.exit(1)
}

client.login(token)
