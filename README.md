# IUT Hackathon — Office Monitor

Real-time office monitoring dashboard with WebSocket simulation server and **Discord webhook** notifications. Tracks 15 devices (3 rooms × 2 fans + 3 lights) with live power, alerts, and an interactive floor plan.

## Architecture

```
[server/state.ts — simulation + alerts]
        ↓
[server/index.ts — WebSocket + REST :3001]
        ↓                    ↓
   [Dashboard]          [Discord Webhook]
   ws://host/ws         posts on every change
```

Every simulation change (manual toggle, preset, auto-sim tick, new alert) sends an embed to your Discord webhook.

## Quick start

```bash
npm install
npm run dev:all
```

Open http://localhost:5173

## Discord webhook setup

1. In your Discord server: **Server Settings → Integrations → Webhooks → New Webhook**
2. Copy the webhook URL
3. Add to `.env`:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

4. Run `npm run server` or `npm run dev:all`

Any device toggle, preset, auto-simulation change, or new alert will post to that channel.

## Run separately

```bash
npm run server   # simulation + webhook + API
npm run dev      # dashboard only (shows UI immediately, connects when server is up)
```

## WebSocket protocol

**Server → client:** `{ "type": "snapshot", "data": { devices, alerts, autoSim } }`

**Client → server:**
- `{ "type": "toggle", "deviceId": "drawing-fan-1" }`
- `{ "type": "preset", "preset": "after_hours" }`
- `{ "type": "setAutoSim", "enabled": false }`

## Project structure

```
src/                React dashboard (floor plan, stats, controls)
server/             WebSocket + REST + simulation + Discord webhook
shared/             Shared TypeScript types
```

## Build

```bash
npm run build
npm run preview
```
