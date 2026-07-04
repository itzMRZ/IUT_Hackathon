# Deploying to a VPS

Everything runs on one server. Nginx serves the built dashboard and forwards
`/api` and `/ws` traffic to a Node process. PM2 keeps that Node process
alive. That's it — no split hosting, no extra config.

Follow the steps in order. Takes about 15 minutes.

## What you need first

SSH into your VPS (Ubuntu/Debian) and install these:

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt-get install -y nginx

# PM2 — keeps the server running, restarts it if it crashes
sudo npm install -g pm2

# Certbot — free HTTPS (skip if you don't have a domain yet)
sudo apt-get install -y certbot python3-certbot-nginx
```

## 1. Get the code

```bash
sudo mkdir -p /var/www/office-monitor
sudo chown $USER:$USER /var/www/office-monitor
git clone https://github.com/itzMRZ/IUT_Hackathon.git /var/www/office-monitor
cd /var/www/office-monitor

cp .env.example .env
nano .env
```

In `.env`, fill in `DISCORD_WEBHOOK_URL` and/or `DISCORD_TOKEN` if you want
Discord notifications. Everything else can stay blank — leave
`VITE_API_URL` and `VITE_WS_URL` unset, Nginx handles that for you.

## 2. Build it

```bash
npm ci
npm run build
```

This creates `dist/` — the folder Nginx will serve.

## 3. Start the server

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

`pm2 startup` prints a command — copy and run it. That's what makes the
server come back automatically if the VPS reboots.

Check it's actually working:

```bash
pm2 status
curl http://127.0.0.1:3001/api/health
```

You should see `{ "ok": true }`. If not, run `pm2 logs office-server` and
read the error.

Don't want the Discord bot running, just the webhook? Stop it:

```bash
pm2 stop office-discord-bot
```

## 4. Point Nginx at it

```bash
sudo cp nginx/office-monitor.conf /etc/nginx/sites-available/office-monitor
sudo nano /etc/nginx/sites-available/office-monitor
```

Change two things in that file:
- `server_name your-domain.com;` → your actual domain or the server's IP
- `root /var/www/office-monitor/dist;` → only if you cloned somewhere else

Then enable it:

```bash
sudo ln -s /etc/nginx/sites-available/office-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Open `http://your-domain-or-ip` in a browser. You should see the dashboard
with a green "Live" badge.

## 5. Add HTTPS (needs a real domain, not just an IP)

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot does everything — edits the Nginx config, sets up auto-renewal.
No domain? Skip this. Plain HTTP works fine for a demo, browsers will just
show "Not Secure."

## 6. Lock down the firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

Don't open port 3001 to the internet — Nginx already talks to it locally,
nothing outside needs direct access.

---

## Pushing updates later

```bash
cd /var/www/office-monitor
./deploy.sh
```

Pulls the latest code, rebuilds, restarts everything. One command, done.

## Discord bot

Runs as its own PM2 process (`office-discord-bot`), already set up in
`ecosystem.config.cjs`. Just needs `DISCORD_TOKEN` in `.env`, then:

```bash
pm2 restart office-discord-bot
```

Full command list and API reference for the bot:
[`docs/DISCORD_BOT_HANDOFF.md`](docs/DISCORD_BOT_HANDOFF.md).

## Something broken? Check this first

| What you're seeing | What's wrong | What to do |
|---|---|---|
| Dashboard loads, badge says "Reconnecting" | Server's down, or Nginx isn't proxying `/ws` right | `pm2 status` — is `office-server` online? Check the `/ws` block in your Nginx config has `Upgrade`/`Connection` headers |
| `502 Bad Gateway` | Server crashed, or wrong port | `pm2 logs office-server` — read the actual error. Check `PORT` in `.env` matches Nginx's `proxy_pass` |
| Pushed new code, site looks the same | Forgot to rebuild | `./deploy.sh`, or manually: `npm run build && pm2 reload ecosystem.config.cjs` |
| PM2 processes gone after a reboot | Never ran `pm2 save` / `pm2 startup` | Run both — see step 3 |
| Discord bot crash-loops | No `DISCORD_TOKEN` set | `pm2 logs office-discord-bot`, add the token to `.env`, restart |
| Blank white page | Nginx `root` path is wrong | Make sure `npm run build` actually ran and `root` in the Nginx config points at your real `dist/` folder |

## PM2 cheat sheet

```bash
pm2 status                    # what's running
pm2 logs office-server        # tail server logs
pm2 logs office-discord-bot   # tail bot logs
pm2 restart office-server     # restart after changing .env
pm2 monit                     # live CPU/memory view
```
