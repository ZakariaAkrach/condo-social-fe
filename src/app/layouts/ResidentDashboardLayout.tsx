import { Outlet } from "react-router"

export function ResidentDashboardLayout() {

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}