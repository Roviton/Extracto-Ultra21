import type { Metadata } from "next"
import { DispatcherMonitoring } from "@/components/dashboard/admin/dispatcher-monitoring"

export const metadata: Metadata = {
  title: "Dispatcher Monitoring",
  description: "Monitor dispatcher performance and assignment history",
}

export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatcher Monitoring</h1>
          <p className="text-muted-foreground">Track dispatcher performance and assignment history</p>
        </div>
      </div>
      <DispatcherMonitoring />
    </div>
  )
}
