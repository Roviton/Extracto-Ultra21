import { DispatchersKpiDashboard } from "@/components/dashboard/dispatchers/dispatchers-kpi-dashboard"

export const metadata = {
  title: "Dispatcher Performance | Freight Dispatch",
  description: "Monitor and analyze dispatcher performance metrics",
}

export default function DispatchersPage() {
  return <DispatchersKpiDashboard />
}
