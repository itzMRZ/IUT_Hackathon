import { OfficeProvider, useOfficeData } from './hooks/useOfficeData'
import { HeroStats } from './components/HeroStats'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { SimulationPanel } from './components/SimulationPanel'
import { StatusBar } from './components/StatusBar'

function Dashboard() {
  const { loading, connected } = useOfficeData()

  if (loading && !connected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[var(--color-canvas)]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-slate-500">Connecting to office server…</p>
        <p className="text-xs text-slate-400">Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run dev:all</code></p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <HeroStats />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden px-2 pb-2 lg:grid-cols-[1fr_260px]">
        <FloorPlan />
        <SimulationPanel />
      </main>
      <StatusBar />
    </div>
  )
}

export default function App() {
  return (
    <OfficeProvider>
      <div className="flex h-full flex-col overflow-hidden bg-[var(--color-canvas)]">
        <Dashboard />
      </div>
    </OfficeProvider>
  )
}
