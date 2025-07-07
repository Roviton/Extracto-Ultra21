"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillingOverview } from "./billing-overview"
import { SubscriptionPlans } from "./subscription-plans"
import { PaymentMethods } from "./payment-methods"
import { UsageMetrics } from "./usage-metrics"
import { BillingHistory } from "./billing-history"

export function BillingDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        <TabsTrigger value="history">Billing History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <BillingOverview />
      </TabsContent>
      <TabsContent value="subscription" className="space-y-4">
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
  )
}
