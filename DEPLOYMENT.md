# Deployment Guide (VPS)

Everything runs on **one VPS**: Nginx serves the built dashboard and
reverse-proxies API/WebSocket traffic to a single Node process managed by
PM2. No split hosting, no cross-origin config needed — same-origin
`fetch('/api/...')` and `new WebSocket('/ws')` just work.

```
┌────────────────────────────────────────────────────────┐
│  VPS                                                     │
│                                                            │
│   Nginx :80/:443                                            │
│     ├─ /            → dist/ (static dashboard build)          │
│     ├─ /api/*        → proxy → 127.0.0.1:3001 (REST)            │
│     └─ /ws           → proxy → 127.0.0.1:3001 (WebSocket, upgrade)│
│                                                                    │
│   PM2                                                              │
│     ├─ office-server       → server/index.ts (WS + REST + webhook)  │
│     └─ office-discord-bot  → discord/bot.ts (optional)                │
└────────────────────────────────────────────────────────┘
```

<br>

## Prerequisites

On the VPS (Ubuntu/Debian assumed — adjust package manager for other distros):

```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt-get install -y nginx

# PM2 (process manager, keeps the server running + auto-restarts on crash/reboot)
sudo npm install -g pm2

# Certbot (free HTTPS, optional but recommended)
sudo apt-get install -y certbot python3-certbot-nginx
```

<br>

## 1. Clone and configure

```bash
sudo mkdir -p /var/www/office-monitor
sudo chown $USER:$USER /var/www/office-monitor
git clone https://github.com/itzMRZ/IUT_Hackathon.git /var/www/office-monitor
cd /var/www/office-monitor

cp .env.example .env
nano .env   # fill in DISCORD_WEBHOOK_URL / DISCORD_TOKEN if using Discord
```

For a single-VPS deployment you can leave `VITE_API_URL` / `VITE_WS_URL`
**unset** — the dashboard uses relative paths (`/api`, `/ws`) which Nginx
proxies to the Node server on the same host.

## 2. Install and build

```bash
npm ci
npm run build      # produces dist/ — this is what Nginx serves
```

## 3. Start the server with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save                 # persist the process list
pm2 startup              # prints a command to run so PM2 survives reboots — run it
```

Check it's alive:

```bash
pm2 status
curl http://127.0.0.1:3001/api/health   # { "ok": true }
```

If you don't want the Discord bot running (webhook-only is fine for most
demos), stop just that process:

```bash
pm2 stop office-discord-bot
pm2 delete office-discord-bot   # or remove it permanently
```

## 4. Configure Nginx

A ready-to-use config is at [`nginx/office-monitor.conf`](nginx/office-monitor.conf).

```bash
sudo cp nginx/office-monitor.conf /etc/nginx/sites-available/office-monitor
sudo nano /etc/nginx/sites-available/office-monitor
# → replace `server_name your-domain.com;` with your domain or the VPS's IP
# → replace the `root` path if you cloned somewhere other than /var/www/office-monitor

sudo ln -s /etc/nginx/sites-available/office-monitor /etc/nginx/sites-enabled/
sudo nginx -t              # test the config
sudo systemctl reload nginx
```

Visit `http://your-domain-or-ip` — the dashboard should load and show
**Live** within a couple seconds.

## 5. HTTPS (recommended, needs a domain)

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot edits the Nginx config to add a `listen 443 ssl` block and sets up
auto-renewal. If you're deploying to a bare IP with no domain, skip this —
the dashboard works fine over plain HTTP for a demo, just note that browsers
will show "Not Secure."

## 6. Firewall

```bash
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw allow OpenSSH
sudo ufw enable
```

Port `3001` does **not** need to be opened externally — Nginx talks to it
over `127.0.0.1` only.

<br>

## Redeploying after code changes

```bash
cd /var/www/office-monitor
./deploy.sh
```

This pulls the latest commit, reinstalls dependencies, rebuilds the
dashboard, and reloads the PM2 processes with zero manual steps. Make it
executable once: `chmod +x deploy.sh`.

<br>

## Discord bot on the same VPS

Already covered by `ecosystem.config.cjs` (the `office-discord-bot` process)
— just make sure `DISCORD_TOKEN` is set in `.env` before running
`pm2 restart office-discord-bot`. Full command reference and API docs for
whoever owns the bot: [`docs/DISCORD_BOT_HANDOFF.md`](docs/DISCORD_BOT_HANDOFF.md).

<br>

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Dashboard loads but badge says "Reconnecting" | Node server isn't running, or Nginx `/ws` proxy misconfigured | `pm2 status` to confirm `office-server` is `online`; check `sudo nginx -t` and the `/ws` location block has the `Upgrade`/`Connection` headers |
| `502 Bad Gateway` on `/api/*` | Node server crashed or wrong port | `pm2 logs office-server`; confirm `PORT=3001` in `.env` matches the Nginx `proxy_pass` port |
| Changes not showing after `git pull` | Forgot to rebuild | Run `./deploy.sh` or manually `npm run build && pm2 reload ecosystem.config.cjs` |
| PM2 processes gone after VPS reboot | `pm2 save` / `pm2 startup` not run | Run both once — see step 3 |
| Discord bot won't start | Missing `DISCORD_TOKEN` | `pm2 logs office-discord-bot` will show the exact error; set the token in `.env` and `pm2 restart office-discord-bot` |
| Nginx serves a blank page | `root` path in the config doesn't point at `dist/` | Confirm `npm run build` succeeded and the `root` in `nginx/office-monitor.conf` matches your clone path |

<br>

## Useful PM2 commands

```bash
pm2 status                 # see what's running
pm2 logs office-server      # tail logs for the server
pm2 logs office-discord-bot # tail logs for the bot
pm2 restart office-server    # restart after an env var change
pm2 monit                    # live CPU/memory dashboard
```
