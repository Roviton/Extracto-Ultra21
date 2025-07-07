"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillingOverview } from "./billing-overview"
import { SubscriptionPlans } from "./subscription-plans"
import { UsageMetrics } from "./usage-metrics"
import { PaymentMethods } from "./payment-methods"
import { BillingHistory } from "./billing-history"

export function BillingDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BillingOverview />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <UsageMetrics />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BillingHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
