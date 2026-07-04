import { OfficeProvider } from './hooks/useOfficeData'
import { HeroStats } from './components/HeroStats'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { SimulationPanel } from './components/SimulationPanel'
import { StatusBar } from './components/StatusBar'

function Dashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <HeroStats />
      <main className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-2 overflow-hidden px-2 pb-2 lg:grid-cols-[1fr_260px] lg:grid-rows-1">
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
