import { AdminLoadDashboard } from "@/components/dashboard/admin/loads/admin-load-dashboard"

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor loads, dispatchers, and performance metrics</p>
      </div>
      <AdminLoadDashboard />
    </div>
  )
}
