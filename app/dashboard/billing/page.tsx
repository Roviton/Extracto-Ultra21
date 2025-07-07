import { BillingDashboard } from "@/components/dashboard/billing/billing-dashboard"
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function BillingPage() {
  return (
    <PermissionGuard requiredPermissions={["billing.view"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your communication platform subscription and billing details</p>
        </div>
        <BillingDashboard />
      </div>
    </PermissionGuard>
  )
}
