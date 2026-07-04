# AGENTS.md

## Cursor Cloud specific instructions

Office Monitor is a two-part app with **no database** (state is in-memory and resets on restart):

- **Server** (`server/`): Node WebSocket + REST API + device simulation on port `3001`. Run with `npm run server`.
- **Dashboard** (`src/`): Vite/React frontend on port `5173`. Run with `npm run dev`. Vite proxies `/api` and `/ws` to the server, so the server must be running for live data (the dashboard still renders with seed data if the server is down).

Run both together with `npm run dev:all` (uses `concurrently`).

Standard commands live in `package.json` scripts and `README.md`:
- Lint: `npm run lint` (oxlint; one pre-existing `only-export-components` warning in `src/hooks/useOfficeData.tsx` is expected, exit code 0).
- Build: `npm run build` (`tsc -b && vite build`).

Non-obvious notes:
- Discord integration (webhook + bot) is **opt-in** and requires `.env` secrets (`DISCORD_WEBHOOK_URL`, `DISCORD_TOKEN`). Nothing Discord-related is needed to run or test the dashboard + simulation; the server logs "Discord webhook: disabled" when unset.
- A background auto-simulation tick changes devices roughly every 18s, so device/stat values shift on their own even without user interaction.
- The onboarding tour modal shows once per browser (tracked in `localStorage`); dismiss it to reach the dashboard.
