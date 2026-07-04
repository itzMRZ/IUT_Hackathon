import { Activity, Wifi, WifiOff } from 'lucide-react'
import { OfficeProvider, useOfficeData } from './hooks/useOfficeData'
import { DevicePanel } from './components/DevicePanel'
import { PowerMeter } from './components/PowerMeter'
import { AlertsPanel } from './components/AlertsPanel'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { totalWattage } from './lib/wattage'

function Header() {
  const { devices, connected, loading, source } = useOfficeData()
  const total = totalWattage(devices)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <div className="flex items-center gap-3">
        <Activity size={22} className="text-[var(--color-accent)]" />
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Office Monitor</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)]">Total Power</p>
          <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">{total}W</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-[var(--color-text-muted)]">Office Hours</p>
          <p className="text-sm text-[var(--color-text)]">9 AM - 5 PM</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
          {connected && !loading ? (
            <>
              <Wifi size={14} className="text-[var(--color-live)]" />
              <span className="text-xs font-medium text-[var(--color-live)]">
                Live{source === 'mock' ? ' (demo)' : ''}
              </span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">Connecting</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Dashboard() {
  const { loading } = useOfficeData()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading office data</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 max-w-[1600px] mx-auto w-full">
      <div className="min-w-0">
        <FloorPlan />
      </div>
      <div className="space-y-4">
        <DevicePanel />
        <PowerMeter />
        <AlertsPanel />
      </div>
    </main>
  )
}

export default function App() {
  return (
    <OfficeProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
        <Header />
        <Dashboard />
      </div>
    </OfficeProvider>
  )
}
