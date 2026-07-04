# Office Monitor — IUT Hackathon

Real-time office monitoring dashboard. Tracks **15 devices** (2 fans + 3
lights × 3 rooms) with a live WebSocket simulation, an interactive floor
plan, manual controls, preset demo scenarios, and Discord notifications.

> **Device count note:** the problem statement mentions 18 devices in some
> places, but 3 rooms × (2 fans + 3 lights) = 15. The "18" figure is a
> typo (2+3 was miscounted as 6 per room).

<br>

## Architecture

```
┌─────────────────────────┐
│   server/state.ts        │   in-memory simulation, alert rules
│   (15 devices, 3 rooms)  │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   server/index.ts          │   WebSocket (/ws) + REST (/api/*) on :3001
└──────┬──────────┬──────────┘
       │          │
       │          └──────────────► Discord Webhook (every change → embed)
       │
┌──────▼──────────────┐    ┌──────────────────────┐
│   Dashboard (src/)    │    │   Discord Bot (discord/) │
│   WebSocket client    │    │   REST + WS client        │
└───────────────────────┘    └────────────────────────────┘
```

No database. State lives in memory on the server and resets on restart —
intentional for a hackathon demo.

<br>

## Quick start

```bash
npm install
npm run dev:all
```

Opens the server on `http://localhost:3001` and the dashboard on
`http://localhost:5173`. The dashboard proxies `/api` and `/ws` to the
server automatically in dev.

Run them separately if you prefer:

```bash
npm run server   # WebSocket + REST + simulation + Discord webhook
npm run dev      # dashboard only (renders immediately with seed data)
```

<br>

## What's in the dashboard

| Area | What it does |
|---|---|
| **Top stats bar** | Total power, devices on/off, active alerts, per-room wattage |
| **Floor plan** | Click any fan or light to toggle it — fans spin, lights glow |
| **Device controls** | Toggle switches for every device, grouped by room |
| **Preset modes** | One-click demo scenarios: Office Busy, After Hours, Room Stuck, All Off |
| **Auto simulation** | Background tick every 18s that randomly changes devices and raises alerts |
| **Status strip** | Every device with ON/OFF duration, at a glance |
| **Onboarding tour** | 4-step walkthrough shown once on first visit (`localStorage`) |

<br>

## Discord integration

Two independent options — use either or both:

### 1. Webhook (zero code, already working)

Posts an embed to a channel on every device toggle, preset, auto-sim change,
or new alert.

1. Discord: **Server Settings → Integrations → Webhooks → New Webhook**
2. Copy the URL into `.env`: `DISCORD_WEBHOOK_URL=...`
3. Run `npm run server` — that's it.

### 2. Bot (for interactive commands)

A working starter lives in `discord/bot.ts` with `!status`, `!room`,
`!usage`, `!toggle` commands and live alert push over WebSocket.

**Full handoff doc with setup steps, API reference, and extension ideas:**
📄 [`docs/DISCORD_BOT_HANDOFF.md`](docs/DISCORD_BOT_HANDOFF.md)

```bash
npm run discord   # after setting DISCORD_TOKEN in .env
```

<br>

## REST API

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/snapshot` | — | Full state: devices, alerts, autoSim |
| GET | `/api/status` | — | Human-readable room summary |
| GET | `/api/usage` | — | Wattage totals |
| GET | `/api/room/:name` | — | One room's devices (`drawing`, `workroom1`, `workroom2`) |
| POST | `/api/toggle` | `{ deviceId }` | Flip a device |
| POST | `/api/preset` | `{ preset }` | Apply a scenario |
| POST | `/api/autosim` | `{ enabled }` | Toggle background simulation |

Full request/response shapes: [`docs/DISCORD_BOT_HANDOFF.md`](docs/DISCORD_BOT_HANDOFF.md#5-rest-api-reference).

## WebSocket protocol

Connect to `ws://localhost:3001/ws`.

```jsonc
// Server → client (on connect + every change)
{ "type": "snapshot", "data": { "devices": [...], "alerts": [...], "autoSim": true } }

// Client → server
{ "type": "toggle", "deviceId": "drawing-fan-1" }
{ "type": "preset", "preset": "after_hours" }
{ "type": "setAutoSim", "enabled": false }
```

<br>

## Project structure

```
src/                  React dashboard
  components/         HeroStats, floor-plan/, ManualControls, PresetPanel,
                       StatusBar, OnboardingTour
  hooks/               useOfficeData — WebSocket client + optimistic updates
  lib/                 shared types re-export, layout.json, wattage/duration helpers

server/               Node WebSocket + REST server
  state.ts             In-memory devices, alerts, simulation, preset logic
  index.ts             HTTP + WS server, route handling
  discordWebhook.ts     Posts embeds on state changes

discord/              Discord bot starter (see docs/DISCORD_BOT_HANDOFF.md)
shared/                Types shared between dashboard, server, and bot
docs/                 Handoff and reference docs
```

<br>

## Device wattage

| Device | On | Off |
|---|---|---|
| Fan | 60W | 0W |
| Light | 15W | 0W |

Office hours for the after-hours alert rule: **9 AM – 5 PM**.

<br>

## Environment variables

See [`.env.example`](.env.example) for the full list. Nothing is required
to run the dashboard + simulation — Discord variables are opt-in.

<br>

## Build

```bash
npm run build
npm run preview
```
