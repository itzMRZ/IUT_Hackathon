import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'

const API_BASE = process.env.API_URL ?? 'http://localhost:3001'
const PREFIX = process.env.DISCORD_PREFIX ?? '!'

async function apiGet(path: string): Promise<{ text?: string; error?: string }> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { error: body.error ?? `API error ${res.status}` }
  }
  return res.json() as Promise<{ text?: string }>
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user?.tag}`)
  console.log(`Commands: ${PREFIX}status, ${PREFIX}room <name>, ${PREFIX}usage`)
  console.log(`API: ${API_BASE}`)
})

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return

  const args = message.content.slice(PREFIX.length).trim()
  const [cmd, ...rest] = args.split(/\s+/)
  const roomArg = rest.join(' ').trim()

  try {
    if (cmd === 'status') {
      const data = await apiGet('/api/status')
      await message.reply(data.text ?? data.error ?? 'No status available.')
      return
    }

    if (cmd === 'room') {
      if (!roomArg) {
        await message.reply(`Usage: \`${PREFIX}room drawing\` or \`${PREFIX}room workroom1\``)
        return
      }
      const data = await apiGet(`/api/room/${encodeURIComponent(roomArg)}`)
      await message.reply(data.text ?? data.error ?? 'Room not found.')
      return
    }

    if (cmd === 'usage') {
      const data = await apiGet('/api/usage')
      await message.reply(data.text ?? data.error ?? 'No usage data.')
      return
    }

    if (cmd === 'help') {
      await message.reply(
        [
          `**Office Monitor Bot**`,
          `\`${PREFIX}status\` — all rooms at a glance`,
          `\`${PREFIX}room <name>\` — drawing, workroom1, workroom2`,
          `\`${PREFIX}usage\` — live wattage breakdown`,
        ].join('\n'),
      )
    }
  } catch (err) {
    console.error(err)
    await message.reply('Could not reach the office server. Is it running?')
  }
})

const token = process.env.DISCORD_TOKEN
if (!token) {
  console.error('DISCORD_TOKEN is required. Copy .env.example to .env and add your bot token.')
  process.exit(1)
}

client.login(token)
