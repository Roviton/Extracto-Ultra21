"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceKPICards } from "@/components/dashboard/reports-analytics/performance-kpi-cards"
import { DriverRPMReport } from "@/components/dashboard/reports-analytics/driver-rpm-report"
import { RevenueVsMilesReport } from "@/components/dashboard/reports-analytics/revenue-vs-miles-report"
import { CustomerProfitabilityReport } from "@/components/dashboard/reports-analytics/customer-profitability-report"
import { TrendsChart } from "@/components/dashboard/reports-analytics/trends-chart"

export default function ReportsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("driver-rpm")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Monitor key performance indicators and generate reports for your freight operations.
        </p>
      </div>

      {/* Performance KPI Cards */}
      <PerformanceKPICards />

      {/* Weekly/Monthly Trends Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-medium">Performance Trends</h2>
        <TrendsChart />
      </div>

      {/* Report Templates */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-medium">Report Templates</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="driver-rpm">Driver RPM</TabsTrigger>
              <TabsTrigger value="revenue-miles">Revenue vs Miles</TabsTrigger>
              <TabsTrigger value="customer-profitability">Customer Profitability</TabsTrigger>
            </TabsList>
            <TabsContent value="driver-rpm" className="pt-4">
              <DriverRPMReport />
            </TabsContent>
            <TabsContent value="revenue-miles" className="pt-4">
              <RevenueVsMilesReport />
            </TabsContent>
            <TabsContent value="customer-profitability" className="pt-4">
              <CustomerProfitabilityReport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
