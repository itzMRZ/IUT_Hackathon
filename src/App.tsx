import { OfficeProvider, useOfficeData } from './hooks/useOfficeData'
import { HeroStats } from './components/HeroStats'
import { SidebarPanel } from './components/SidebarPanel'
import { MobileRoomStrip } from './components/MobileRoomStrip'
import { FloorPlan } from './components/floor-plan/FloorPlan'

function Dashboard() {
  const { loading } = useOfficeData()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading office data</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      <HeroStats />
      <MobileRoomStrip />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden px-4 pb-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        <div className="min-h-0 min-w-0">
          <FloorPlan />
        </div>
        <div className="hidden min-h-0 lg:block">
          <SidebarPanel />
        </div>
      </div>
    </main>
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
