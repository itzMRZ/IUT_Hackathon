# Office Monitor Dashboard

Real-time web dashboard for the IUT Hackathon office monitoring system. Displays live device status, power consumption, alerts, and an interactive top-view office floor plan with per-light ambience, fan animation, and plant sway.

**This repo is dashboard only.** The Discord bot lives in a separate repo. Both read from the same Supabase tables.

## Device count note

The problem statement mentions 18 devices in some places, but the floor plan and device summary (6 fans + 9 lights) confirm **15 controllable devices**: 3 rooms × (2 fans + 3 lights). The "18" figure is a document typo (2+3 was incorrectly summed as 6 per room).

## Architecture

```
[Simulator] → [Supabase Postgres + Realtime] → [Dashboard] (this repo)
                                           → [Discord Bot] (other repo)
```

No custom WebSocket server. Supabase Realtime pushes row changes to the dashboard instantly.

## Quick start

### 1. Install

```bash
npm install
```

### 2. Supabase setup

1. Create a free [Supabase](https://supabase.com) project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to insert 15 devices.
4. Enable Realtime on `devices` and `alerts` (included in schema.sql).
5. Copy `.env.example` to `.env` and fill in your keys.

### 3. Run dashboard

```bash
npm run dev
```

Open http://localhost:5173

**Without Supabase:** if `VITE_SUPABASE_URL` is unset, the dashboard runs in **mock mode** with simulated live data.

### 4. Run simulator (with Supabase)

```bash
# .env needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run sim
```

The simulator toggles 1-2 devices every 15-30 seconds and writes alerts for after-hours and room-stuck rules.

### Demo seed scripts

Run in Supabase SQL editor:

- [`supabase/seed-demo-stuck.sql`](supabase/seed-demo-stuck.sql) — force 2hr room-stuck alert
- [`supabase/seed-after-hours.sql`](supabase/seed-after-hours.sql) — force after-hours alert

## Bot team handoff

The Discord bot should read `devices` and `alerts` from the same Supabase project using the anon key. Match `label` format (`Fan 1`, `Light 3`). The bot is read-only; the simulator owns all writes.

## Project structure

```
src/
  components/       DevicePanel, PowerMeter, AlertsPanel, floor-plan/
  hooks/            useOfficeData (single subscription owner)
  lib/              types, supabase client, mock store, layout.json
simulator/          Node process that writes device state + alerts
supabase/           schema.sql, seed files
public/assets/      reference floor plan image
```

## Wattage

| Device | On | Off |
|--------|-----|-----|
| Fan | 60W | 0W |
| Light | 15W | 0W |

Office hours for alerts: 9 AM - 5 PM.

## Build

```bash
npm run build
npm run preview
```
