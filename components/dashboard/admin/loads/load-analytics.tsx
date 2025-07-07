"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Truck } from "lucide-react"
import type { AdminLoad } from "@/hooks/use-admin-loads"

interface LoadAnalyticsProps {
  loads?: AdminLoad[]
  detailed?: boolean
}

export function LoadAnalytics({ loads = [], detailed = false }: LoadAnalyticsProps) {
  // Calculate analytics
  const totalLoads = loads.length
  const averageRPM = totalLoads > 0 ? loads.reduce((sum, load) => sum + load.rpm, 0) / totalLoads : 0

  // Rate distribution
  const lowRateLoads = loads.filter((load) => load.rpm < 2.0).length
  const mediumRateLoads = loads.filter((load) => load.rpm >= 2.0 && load.rpm < 3.0).length
  const highRateLoads = loads.filter((load) => load.rpm >= 3.0).length

  const lowRatePercentage = totalLoads > 0 ? (lowRateLoads / totalLoads) * 100 : 0
  const mediumRatePercentage = totalLoads > 0 ? (mediumRateLoads / totalLoads) * 100 : 0
  const highRatePercentage = totalLoads > 0 ? (highRateLoads / totalLoads) * 100 : 0

  // Status distribution
  const statusCounts: Record<string, number> = {}
  loads.forEach((load) => {
    statusCounts[load.status] = (statusCounts[load.status] || 0) + 1
  })

  // Dispatcher performance
  const dispatcherPerformance: Record<string, { loads: number; avgRpm: number }> = {}
  loads.forEach((load) => {
    if (load.dispatcher?.name) {
      if (!dispatcherPerformance[load.dispatcher.name]) {
        dispatcherPerformance[load.dispatcher.name] = { loads: 0, avgRpm: 0 }
      }
      dispatcherPerformance[load.dispatcher.name].loads += 1
      dispatcherPerformance[load.dispatcher.name].avgRpm += load.rpm
    }
  })

  // Calculate average RPM per dispatcher
  Object.keys(dispatcherPerformance).forEach((dispatcher) => {
    dispatcherPerformance[dispatcher].avgRpm /= dispatcherPerformance[dispatcher].loads
  })

  // Sort dispatchers by average RPM
  const sortedDispatchers = Object.entries(dispatcherPerformance)
    .sort(([, a], [, b]) => b.avgRpm - a.avgRpm)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RPM</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRPM.toFixed(2)}</div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={
                  averageRPM >= 3.0
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : averageRPM >= 2.0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {averageRPM >= 3.0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : averageRPM >= 2.0 ? (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {averageRPM >= 3.0 ? "Above Target" : averageRPM >= 2.0 ? "Near Target" : "Below Target"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Distribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-500">Low (&lt;$2.00/mi)</span>
                <span>{lowRateLoads} loads</span>
              </div>
              <Progress value={lowRatePercentage} className="h-1 bg-muted" indicatorColor="bg-red-500" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-500">Medium ($2.00-$3.00/mi)</span>
                <span>{mediumRateLoads} loads</span>
              </div>
              <Progress value={mediumRatePercentage} className="h-1 bg-muted" indicatorColor="bg-amber-500" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-green-500">High (&gt;$3.00/mi)</span>
                <span>{highRateLoads} loads</span>
              </div>
              <Progress value={highRatePercentage} className="h-1 bg-muted" indicatorColor="bg-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = (count / totalLoads) * 100
                let color = "bg-blue-500"
                let icon = null

                switch (status.toLowerCase()) {
                  case "completed":
                    color = "bg-green-500"
                    icon = <CheckCircle className="h-3 w-3 text-green-500" />
                    break
                  case "cancelled":
                    color = "bg-red-500"
                    icon = <AlertTriangle className="h-3 w-3 text-red-500" />
                    break
                  case "in_progress":
                  case "in progress":
                    color = "bg-blue-500"
                    icon = <Truck className="h-3 w-3 text-blue-500" />
                    break
                  default:
                    color = "bg-gray-500"
                }

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        {icon}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}</span>
                      </div>
                      <span>{count} loads</span>
                    </div>
                    <Progress value={percentage} className={`h-1 bg-muted ${color}`} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Dispatchers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedDispatchers.length > 0 ? (
                sortedDispatchers.map(([dispatcher, data]) => (
                  <div key={dispatcher} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{dispatcher}</span>
                      <span>${data.avgRpm.toFixed(2)}/mi</span>
                    </div>
                    <Progress
                      value={Math.min(data.avgRpm * 20, 100)}
                      className={`h-1 bg-muted ${
                        data.avgRpm >= 3.0 ? "bg-green-500" : data.avgRpm >= 2.0 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    />
                    <div className="text-xs text-muted-foreground">{data.loads} loads</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground">No dispatcher data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {detailed && <div className="grid gap-4 md:grid-cols-2">{/* Additional detailed analytics would go here */}</div>}
    </div>
  )
}
