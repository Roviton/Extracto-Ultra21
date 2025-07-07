"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, Users, Zap } from "lucide-react"

export function BillingOverview() {
  // Mock data - replace with real data from your billing system
  const billingData = {
    currentPlan: "Professional",
    monthlySpend: 2450,
    nextBillingDate: "2024-02-15",
    activeUsers: 12,
    usagePercentage: 75,
    status: "active",
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{billingData.currentPlan}</div>
          <Badge variant={billingData.status === "active" ? "default" : "secondary"}>{billingData.status}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${billingData.monthlySpend}</div>
          <p className="text-xs text-muted-foreground">Next billing: {billingData.nextBillingDate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{billingData.activeUsers}</div>
          <p className="text-xs text-muted-foreground">Licensed users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{billingData.usagePercentage}%</div>
          <p className="text-xs text-muted-foreground">Of plan limits</p>
        </CardContent>
      </Card>
    </div>
  )
}
