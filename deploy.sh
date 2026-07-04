#!/usr/bin/env bash
# Redeploy script for the VPS. Run this after `git push` to update the
# live site with the latest code.
#
# Usage: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Pulling latest code..."
git pull --ff-only

echo "→ Installing dependencies..."
npm ci

echo "→ Building dashboard..."
npm run build

echo "→ Reloading PM2 processes..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "  pm2 not found — install with: npm i -g pm2"
  exit 1
fi

echo "→ Done. Check status with: pm2 status"
