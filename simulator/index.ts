import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { runTick } from './devices.js'
import { checkAlerts } from './rules.js'

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_URL) to run simulator')
  process.exit(1)
}

const supabase = createClient(url, key)

async function tick() {
  try {
    await runTick(supabase)
    await checkAlerts(supabase)
  } catch (err) {
    console.error('Simulator tick error:', err)
  }
}

console.log('Office simulator started. Ticking every 15-30s...')
tick()
setInterval(() => {
  const delay = 15_000 + Math.random() * 15_000
  setTimeout(tick, delay)
}, 20_000)
