"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, AlertTriangle, TrendingDown, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function PerformanceKPICards() {
  // Sample KPI data
  const kpiData = {
    totalRevenue: {
      value: 287500,
      change: 8.5,
      isPositive: true,
    },
    fleetAverageRPM: {
      value: 3.18,
      change: -0.12,
      isPositive: false,
    },
    loadsBelowRPMThreshold: {
      value: 14.3,
      change: 2.1,
      isPositive: false,
    },
    mostFrequentIssue: {
      value: "Late Pickup",
      count: 12,
    },
    driverWithMostLateness: {
      name: "Mike Williams",
      count: 5,
    },
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue (Month)</div>
            <div className="rounded-full bg-primary/10 p-1">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatCurrency(kpiData.totalRevenue.value)}</div>
          <div className="mt-1 flex items-center text-xs">
            <div
              className={cn(
                "flex items-center",
                kpiData.totalRevenue.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {kpiData.totalRevenue.isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {kpiData.totalRevenue.change}%
            </div>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Fleet Average RPM</div>
            <div className="rounded-full bg-primary/10 p-1">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">${kpiData.fleetAverageRPM.value.toFixed(2)}</div>
          <div className="mt-1 flex items-center text-xs">
            <div
              className={cn(
                "flex items-center",
                kpiData.fleetAverageRPM.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {kpiData.fleetAverageRPM.isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              ${Math.abs(kpiData.fleetAverageRPM.change).toFixed(2)}
            </div>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">% Loads Below RPM Threshold</div>
            <div className="rounded-full bg-amber-100 p-1 dark:bg-amber-900/30">
              <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{kpiData.loadsBelowRPMThreshold.value}%</div>
          <div className="mt-1 flex items-center text-xs">
            <div
              className={cn(
                "flex items-center",
                kpiData.loadsBelowRPMThreshold.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {kpiData.loadsBelowRPMThreshold.isPositive ? (
                <ArrowDown className="mr-1 h-3 w-3" />
              ) : (
                <ArrowUp className="mr-1 h-3 w-3" />
              )}
              {kpiData.loadsBelowRPMThreshold.change}%
            </div>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Most Frequent Issue</div>
            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{kpiData.mostFrequentIssue.value}</div>
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            {kpiData.mostFrequentIssue.count} occurrences this month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Driver With Most Late Loads</div>
            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
              <User className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{kpiData.driverWithMostLateness.name}</div>
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            {kpiData.driverWithMostLateness.count} late deliveries this month
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
