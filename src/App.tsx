import { OfficeProvider, useOfficeData } from './hooks/useOfficeData'
import { TopBar } from './components/TopBar'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { SimulationPanel } from './components/SimulationPanel'
import { StatusBar } from './components/StatusBar'

function Dashboard() {
  const { loading } = useOfficeData()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-canvas)]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading office data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">
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
