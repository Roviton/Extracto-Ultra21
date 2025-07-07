"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DispatcherPerformanceTable } from "./dispatcher-performance-table"
import { DispatcherKpiCards } from "./dispatcher-kpi-cards"
import { DispatcherPerformanceCharts } from "./dispatcher-performance-charts"
import { DispatcherFilters } from "./dispatcher-filters"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function DispatchersKpiDashboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("week")

  // This would come from your API in a real application
  const hasUnderperformingDispatchers = true

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view this page. This page is only accessible to administrators and managers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatcher Performance</h1>
          <p className="text-muted-foreground">Monitor and analyze dispatcher performance metrics</p>
        </div>
        <DispatcherFilters timeRange={timeRange} setTimeRange={setTimeRange} />
      </div>

      {hasUnderperformingDispatchers && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            3 dispatchers are performing below target thresholds. Review their metrics and consider scheduling coaching
            sessions.
          </AlertDescription>
        </Alert>
      )}

      <DispatcherKpiCards timeRange={timeRange} />

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-6">
          <DispatcherPerformanceTable timeRange={timeRange} />
        </TabsContent>
        <TabsContent value="trends" className="space-y-6">
          <DispatcherPerformanceCharts timeRange={timeRange} chartType="trends" />
        </TabsContent>
        <TabsContent value="comparison" className="space-y-6">
          <DispatcherPerformanceCharts timeRange={timeRange} chartType="comparison" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
