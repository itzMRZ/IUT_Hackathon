import { OfficeProvider } from './hooks/useOfficeData'
import { HeroStats } from './components/HeroStats'
import { FloorPlan } from './components/floor-plan/FloorPlan'
import { ManualControls } from './components/ManualControls'
import { PresetPanel } from './components/PresetPanel'
import { StatusBar } from './components/StatusBar'
import { OnboardingTour } from './components/OnboardingTour'

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

        <aside className="dashboard-manual" aria-label="On off controls">
          <ManualControls />
        </aside>

        <aside className="dashboard-presets" aria-label="Preset modes">
          <PresetPanel />
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
      <OnboardingTour />
    </OfficeProvider>
  )
}
