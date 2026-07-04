import { OfficeProvider } from './hooks/useOfficeData'
import { HeroStats } from './components/HeroStats'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { SimulationPanel } from './components/SimulationPanel'
import { StatusBar } from './components/StatusBar'

function Dashboard() {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <HeroStats />
      </header>

      <div className="dashboard-body">
        <section className="dashboard-floor" aria-label="Office floor plan">
          <FloorPlan />
        </section>
        <aside className="dashboard-controls" aria-label="Device controls">
          <SimulationPanel />
        </aside>
      </div>

      <footer className="dashboard-footer">
        <StatusBar />
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <OfficeProvider>
      <Dashboard />
    </OfficeProvider>
  )
}
