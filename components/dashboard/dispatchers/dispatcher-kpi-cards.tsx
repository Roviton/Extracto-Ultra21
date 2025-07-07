"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2, Clock, Truck, Users } from "lucide-react"

interface DispatcherKpiCardsProps {
  timeRange: string
}

export function DispatcherKpiCards({ timeRange }: DispatcherKpiCardsProps) {
  // This would come from your API in a real application
  const kpiData = {
    totalDispatchers: 12,
    activeDispatchers: 10,
    avgLoadsPerDispatcher: 18.5,
    avgResponseTime: "14 min",
    onTimeDeliveryRate: 94.2,
    dispatcherEfficiencyScore: 87.3,
    dispatcherEfficiencyChange: 2.1,
    customerSatisfactionScore: 4.7,
    customerSatisfactionChange: -0.2,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Dispatchers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpiData.activeDispatchers}/{kpiData.totalDispatchers}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((kpiData.activeDispatchers / kpiData.totalDispatchers) * 100)}% utilization
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Loads Per Dispatcher</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiData.avgLoadsPerDispatcher}</div>
          <p className="text-xs text-muted-foreground">
            Per {timeRange === "day" ? "day" : timeRange === "week" ? "week" : "month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dispatcher Efficiency</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{kpiData.dispatcherEfficiencyScore}%</div>
            <div
              className={`text-xs flex items-center ${kpiData.dispatcherEfficiencyChange >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {kpiData.dispatcherEfficiencyChange >= 0 ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(kpiData.dispatcherEfficiencyChange)}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Based on load assignment speed and accuracy</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiData.avgResponseTime}</div>
          <p className="text-xs text-muted-foreground">Time to respond to new loads</p>
        </CardContent>
      </Card>
    </div>
  )
}
