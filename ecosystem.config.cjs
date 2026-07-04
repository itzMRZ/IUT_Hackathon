// PM2 process definitions for the VPS.
// Start everything:   pm2 start ecosystem.config.cjs
// Start just server:  pm2 start ecosystem.config.cjs --only office-server
// Reload after deploy: pm2 reload ecosystem.config.cjs --update-env
//
// Note: we point `script` directly at the local tsx binary rather than
// `npx tsx` — PM2's fork mode treats `script` as a file to load, and `npx`
// is a shell script, not JavaScript, which makes PM2 fail with
// "Unexpected identifier '$'" when it tries to parse it as Node code.
const path = require('node:path')

const tsx = path.join(__dirname, 'node_modules', '.bin', 'tsx')

module.exports = {
  apps: [
    {
      name: 'office-server',
      script: tsx,
      args: 'server/index.ts',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
    },
    {
      // Optional — only starts successfully once DISCORD_TOKEN is set in .env.
      // Remove this block (or `pm2 delete office-discord-bot`) if you're only
      // using the Discord webhook and don't need the bot.
      name: 'office-discord-bot',
      script: tsx,
      args: 'discord/bot.ts',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      watch: false,
    },
  ],
}
