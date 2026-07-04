# Discord Bot Handoff

This document is for whoever is building out the Discord bot. Everything the
bot needs already exists on the server side — you don't need to touch the
dashboard or simulation code. Read this, then start from `discord/bot.ts`.

## TL;DR

- The office server exposes a **REST API** and a **WebSocket** you can read from.
- A **starter bot** already works: `npm run discord` (after setting `DISCORD_TOKEN`).
- A **Discord webhook** already posts every simulation change automatically —
  you don't need to build that part unless you want a bot-driven alternative.
- Your job: extend `discord/bot.ts` with whatever commands/UX your team wants
  (slash commands, buttons, autocomplete, etc.)

## 1. Run the server

The bot needs the office server running to have any data to show.

```bash
npm install
npm run server
```

This starts:
- REST API at `http://localhost:3001`
- WebSocket at `ws://localhost:3001/ws`

Leave this running in one terminal. The dashboard (`npm run dev`) is optional
for bot development — the server runs the simulation independently.

## 2. Set up your bot credentials

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. **New Application** → name it → **Bot** tab → **Reset Token** → copy it.
3. Under **Bot**, enable **Message Content Intent** (required to read `!commands`).
4. Under **OAuth2 → URL Generator**, check `bot` scope and `Send Messages`,
   `Read Message History`, `Embed Links` permissions. Use the generated URL
   to invite the bot to your test server.
5. Copy `.env.example` to `.env` and fill in:

```env
DISCORD_TOKEN=your-bot-token
DISCORD_PREFIX=!
DISCORD_ALERT_CHANNEL_ID=   # optional, see step 4 below
API_URL=http://localhost:3001
```

To get a channel ID: enable **Developer Mode** in Discord (User Settings →
Advanced), then right-click any channel → **Copy Channel ID**.

## 3. Run the starter bot

```bash
npm run discord
```

You should see:

```
Discord bot logged in as YourBot#1234
REST API: http://localhost:3001
Commands: !status, !room <name>, !usage, !help
```

Try `!status`, `!room drawing`, `!usage` in your Discord server.

## 4. What the starter bot already does

`discord/bot.ts` is a working example, not a stub. It has two parts:

### A. Text commands (REST-based)

| Command | What it does |
|---|---|
| `!status` | Summary of every room |
| `!room <name>` | Device-by-device status for one room (`drawing`, `workroom1`, `workroom2`) |
| `!usage` | Total + per-room wattage |
| `!toggle <deviceId>` | Flips a device on/off (e.g. `!toggle drawing-fan-1`) |
| `!help` | Lists commands |

### B. Live alert push (WebSocket-based)

If you set `DISCORD_ALERT_CHANNEL_ID`, the bot opens a WebSocket connection
to the server and posts an embed to that channel **the moment** a new alert
fires (after-hours devices on, a room stuck fully-on for 2 hours, etc.) — no
polling needed.

This is a good reference for adding more real-time behavior (e.g. posting
when total wattage crosses a threshold).

## 5. REST API reference

Base URL: `http://localhost:3001` (or your deployed server URL)

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok: true }` |
| GET | `/api/snapshot` | — | Full state: `{ devices, alerts, autoSim }` |
| GET | `/api/status` | — | `{ text: "Drawing Room: fan 1 on, ..." }` |
| GET | `/api/usage` | — | `{ total, byRoom, text }` |
| GET | `/api/room/:name` | — | `{ text: "Drawing Room - Fan 1: ON (60W), ..." }` |
| POST | `/api/toggle` | `{ deviceId: string }` | Updated snapshot |
| POST | `/api/preset` | `{ preset: string }` | Updated snapshot |
| POST | `/api/autosim` | `{ enabled: boolean }` | Updated snapshot |

`:name` for `/api/room/:name` accepts `drawing`, `workroom1`, `workroom2`
(aliases `wr1`/`wr2` also work).

Preset IDs for `/api/preset`: `office_busy`, `after_hours`, `room_stuck`,
`drawing_only`, `all_off`.

### Device object shape

```ts
{
  id: string            // e.g. "drawing-fan-1"
  type: "fan" | "light"
  room: "drawing" | "workroom1" | "workroom2"
  label: string          // e.g. "Fan 1"
  status: "on" | "off"
  wattage: number         // 60 for fans, 15 for lights, 0 if off
  last_changed: string    // ISO timestamp
  on_since: string | null // ISO timestamp, null if off
}
```

### Alert object shape

```ts
{
  id: string
  message: string
  severity: "info" | "warning"
  room: "drawing" | "workroom1" | "workroom2" | null
  rule_type: "after_hours" | "room_stuck"
  created_at: string // ISO timestamp
}
```

All shared types live in [`shared/types.ts`](../shared/types.ts) — import
from there instead of redefining them.

## 6. WebSocket protocol

Connect to `ws://localhost:3001/ws`.

**Server → client** (sent on connect, and again whenever anything changes):

```json
{ "type": "snapshot", "data": { "devices": [...], "alerts": [...], "autoSim": true } }
```

**Client → server** (optional — only needed if the bot should control devices
over the socket instead of REST):

```json
{ "type": "toggle", "deviceId": "drawing-fan-1" }
{ "type": "preset", "preset": "after_hours" }
{ "type": "setAutoSim", "enabled": false }
```

Either REST or WebSocket works for writes — REST is simpler for one-off
command handlers, WebSocket is better if you want to react to every change
without polling (as the starter bot does for alerts).

## 7. Ideas to extend the bot

- **Slash commands** (`/status`, `/room`) instead of `!prefix` — use
  `discord.js`'s `SlashCommandBuilder` and register via a deploy script.
- **Buttons** on the alert embed to toggle the offending device directly
  from Discord (`ButtonBuilder` + `POST /api/toggle`).
- **Scheduled digest** — a `setInterval` that posts `!usage` every hour.
- **Autocomplete** for `/room` and `/toggle` using the device list from
  `/api/snapshot`.
- **Threaded alerts** — create a thread per room the first time it alerts,
  then reply in-thread for subsequent alerts in that room.

## 8. Notes

- The bot and the Discord **webhook** (`server/discordWebhook.ts`) are
  independent — the webhook posts a plain embed automatically on every
  change with zero bot code required. Keep both, disable one, or merge the
  behavior into the bot — your call.
- The simulation auto-runs every 18 seconds when `autoSim` is on (default:
  on). Don't be surprised by activity even with no one touching the
  dashboard — that's expected for the demo.
- No database — state resets when the server restarts. That's intentional
  for a hackathon demo; there's nothing to migrate.
