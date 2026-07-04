# IUT Hackathon — Office Monitor

Real-time office monitoring dashboard with WebSocket simulation server and Discord bot integration. Tracks 15 devices (3 rooms × 2 fans + 3 lights) with live power, alerts, and an interactive floor plan.

**Device count note:** The problem statement mentions 18 devices in some places, but the floor plan confirms **15 controllable devices**. The "18" figure is a document typo.

## Architecture

```
[server/state.ts — simulation + alerts]
        ↓
[server/index.ts — WebSocket + REST API :3001]
        ↓                    ↓
   [Dashboard]          [Discord Bot]
   ws://host/ws         !status, !room, !usage
```

- **WebSocket** (`/ws`) — real-time snapshots to the dashboard; accepts toggle, preset, and auto-sim commands.
- **REST API** (`/api/*`) — same state for the Discord bot and external integrations.

## Quick start

### 1. Install

```bash
npm install
```

### 2. Run everything (recommended)

```bash
npm run dev:all
```

This starts:
- Office server on http://localhost:3001 (WebSocket + REST)
- Dashboard on http://localhost:5173 (proxies `/ws` and `/api` to the server)

Open http://localhost:5173

### 3. Run separately

```bash
# Terminal 1 — simulation server
npm run server

# Terminal 2 — dashboard
npm run dev
```

### 4. Discord bot (optional)

1. Create a bot at [Discord Developer Portal](https://discord.com/developers/applications).
2. Enable **Message Content Intent**.
3. Copy `.env.example` to `.env` and set `DISCORD_TOKEN`.
4. With the server running:

```bash
npm run discord
```

**Commands:**
| Command | Description |
|---------|-------------|
| `!status` | All rooms at a glance |
| `!room drawing` | Device status for one room |
| `!usage` | Live wattage breakdown |
| `!help` | Command list |

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/snapshot` | GET | Full state (devices, alerts, autoSim) |
| `/api/status` | GET | Human-readable status text |
| `/api/usage` | GET | Wattage breakdown |
| `/api/room/:name` | GET | Room detail (`drawing`, `workroom1`, `workroom2`) |
| `/api/toggle` | POST | `{ "deviceId": "drawing-fan-1" }` |
| `/api/preset` | POST | `{ "preset": "office_busy" }` |
| `/api/autosim` | POST | `{ "enabled": true }` |

## WebSocket protocol

**Server → client:**
```json
{ "type": "snapshot", "data": { "devices": [], "alerts": [], "autoSim": true } }
```

**Client → server:**
```json
{ "type": "toggle", "deviceId": "drawing-fan-1" }
{ "type": "preset", "preset": "after_hours" }
{ "type": "setAutoSim", "enabled": false }
```

## Project structure

```
src/                React dashboard (floor plan, stats, controls)
server/             WebSocket + REST server with in-memory simulation
shared/             Shared TypeScript types
discord/            Discord bot (reads REST API)
supabase/           Optional legacy schema (not required)
```

## Wattage

| Device | On | Off |
|--------|-----|-----|
| Fan | 60W | 0W |
| Light | 15W | 0W |

Office hours for alerts: 9 AM – 5 PM.

## Build

```bash
npm run build
npm run preview
```

## Environment variables

See [`.env.example`](.env.example):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `VITE_WS_URL` | (proxy) | Override WebSocket URL for dashboard |
| `DISCORD_TOKEN` | — | Discord bot token |
| `API_URL` | `http://localhost:3001` | API base for Discord bot |
