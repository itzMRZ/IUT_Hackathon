# Deployment Guide (Vercel)

## Read this first — why it's two deployments, not one

This project has two runtime pieces:

1. **Dashboard** (`src/`) — a static Vite/React SPA. Deploys perfectly to Vercel.
2. **Office server** (`server/`) — a Node process that holds the simulation
   **in memory** and keeps a **persistent WebSocket connection** open to every
   connected client.

Vercel's hosting model for Node code is serverless functions: each request
can hit a fresh, isolated instance, and any given instance is frozen or
killed between requests. That's incompatible with this server on two counts:

- **In-memory state** (`server/state.ts`) would reset or fork unpredictably
  across invocations — devices would flicker between different values per
  request.
- **Persistent WebSockets** (`ws` library, `wss.on('connection', ...)`)
  can't stay open across a serverless function's lifecycle the way this
  server expects.

So the correct architecture is:

```
┌─────────────────────┐        ┌──────────────────────────┐
│   Vercel              │  wss   │   Railway / Render / Fly    │
│   Dashboard (static)  │◄──────►│   server/index.ts (Node)     │
│   dist/ build          │  https │   WebSocket + REST + webhook │
└─────────────────────┘        └──────────────────────────┘
```

The dashboard already supports this out of the box via `VITE_API_URL` and
`VITE_WS_URL` (see `src/hooks/useOfficeData.tsx`) — you just need to set
them at build time. No further code changes are required.

> **Vercel MCP note:** this repo checked for a Vercel MCP integration to
> drive the deployment automatically, but the Vercel MCP server was
> unavailable (failed tool discovery) in this environment. Follow the
> manual steps below — they take about 10 minutes total.

<br>

## Step 1 — Deploy the server (Railway, easiest option)

Any host that runs a persistent Node process works (Render, Fly.io, a VPS).
Railway is the fastest for a hackathon demo.

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from
   GitHub repo** → select this repo.
2. Railway auto-detects Node. Set these in **Settings → Variables**:
   ```
   PORT=3001
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...   # optional
   ```
3. Set the **Start Command** (Settings → Deploy) to:
   ```
   npm run server
   ```
4. Deploy. Railway gives you a public URL like:
   ```
   https://office-monitor-production.up.railway.app
   ```
5. Verify it's alive:
   ```bash
   curl https://office-monitor-production.up.railway.app/api/health
   # { "ok": true }
   ```

**Render alternative:** New → Web Service → connect repo → Build Command
`npm install`, Start Command `npm run server`, add the same env vars.

<br>

## Step 2 — Deploy the dashboard to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → import this GitHub repo.
2. Vercel should auto-detect **Vite** (this repo also ships `vercel.json`
   pinning `framework: vite`, `buildCommand: npm run build`,
   `outputDirectory: dist`).
3. Add environment variables (**Project Settings → Environment Variables**),
   using the Railway URL from Step 1:
   ```
   VITE_API_URL=https://office-monitor-production.up.railway.app
   VITE_WS_URL=wss://office-monitor-production.up.railway.app/ws
   ```
   Note the protocol swap: `https` → `wss` for the WebSocket URL.
4. Deploy. Vercel builds with `npm run build` and serves `dist/`.
5. Open the deployed URL — the dashboard should show **Live** in the top
   bar within a second or two, meaning it connected to the Railway
   WebSocket successfully.

### Via Vercel CLI instead of the dashboard

```bash
npm i -g vercel
vercel link
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
vercel --prod
```

<br>

## Step 3 — Discord (optional, works the same in production)

- **Webhook:** set `DISCORD_WEBHOOK_URL` on the **Railway** service (not
  Vercel — the webhook is sent by `server/`, not the dashboard).
- **Bot:** the bot (`discord/bot.ts`) is a separate long-running process
  too. Deploy it the same way as the server (Railway/Render), pointing
  `API_URL` and `WS_URL` at your Railway server's public URL. See
  [`docs/DISCORD_BOT_HANDOFF.md`](docs/DISCORD_BOT_HANDOFF.md).

<br>

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Dashboard shows nothing but seed data, badge says offline | `VITE_API_URL`/`VITE_WS_URL` not set or wrong | Double-check the env vars in Vercel match your Railway URL exactly, redeploy after changing them (Vercel env vars are baked in at build time) |
| Browser console: mixed content / blocked WebSocket | Used `ws://` instead of `wss://` for an `https` dashboard | `VITE_WS_URL` must start with `wss://` when the dashboard is served over HTTPS |
| CORS error in console | Server not reachable or wrong URL | The server already sends `Access-Control-Allow-Origin: *` — verify the Railway URL responds to `curl <url>/api/health` first |
| Devices reset randomly / look inconsistent | Server was deployed as a Vercel serverless function instead of a persistent host | Redeploy the server to Railway/Render/Fly — see "why it's two deployments" above |
| Vercel build fails on TypeScript errors | `npm run build` runs `tsc -b` before `vite build` | Run `npm run build` locally first and fix any errors before pushing |

<br>

## Optional: single-command local rehearsal of the split setup

Simulate the production topology locally before deploying:

```bash
# Terminal 1 — the "Railway" server
npm run server

# Terminal 2 — the "Vercel" dashboard, pointed at it explicitly
VITE_API_URL=http://localhost:3001 VITE_WS_URL=ws://localhost:3001/ws npm run dev
```

If that works, the real deployment will too — it's the same code path.
