import { BillingDashboard } from "@/components/dashboard/admin/billing-dashboard"

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your freight dispatch platform subscription and billing details</p>
      </div>
      <BillingDashboard />
    </div>
  )
}
