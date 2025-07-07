"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, CheckCircle, TrendingUp } from "lucide-react"
import useLoads from "@/hooks/use-loads"
import { useMemo } from "react"

interface DashboardStatsProps {
  className?: string
}

export function DashboardStats({ className }: DashboardStatsProps) {
  // Use the SAME data source as the loads table
  const { loads: activeLoads, loading: activeLoading } = useLoads({ viewMode: "active" })
  const { loads: completedLoads, loading: completedLoading } = useLoads({ viewMode: "history" })

  // Calculate metrics from the SAME data that tables use
  const metrics = useMemo(() => {
    console.log("📊 Calculating dashboard metrics...")
    console.log("Active loads:", activeLoads?.length || 0)
    console.log("History loads:", completedLoads?.length || 0)

    // Active loads count (same filter as Active Loads table)
    const activeCount = activeLoads?.length || 0

    // Only count loads that are actually completed
    const actuallyCompletedLoads = completedLoads?.filter((load) => load.status === "completed") || []
    const completedCount = actuallyCompletedLoads.length

    console.log("Actually completed loads:", completedCount)

    // Calculate total revenue from ONLY completed loads
    const totalRevenue = actuallyCompletedLoads.reduce((sum, load) => {
      if (load.rate) {
        const rate = typeof load.rate === "string" ? Number.parseFloat(load.rate.replace(/[$,]/g, "")) : load.rate
        const validRate = isNaN(rate) ? 0 : rate
        console.log(`Completed Load ${load.load_number}: rate = ${validRate}`)
        return sum + validRate
      }
      return sum
    }, 0)

    console.log("Total revenue from completed loads:", totalRevenue)

    // Calculate average rate from ACTIVE loads with rates
    const activeLoadsWithRates = (activeLoads || []).filter((load) => {
      if (!load.rate) return false
      const rate = typeof load.rate === "string" ? Number.parseFloat(load.rate.replace(/[$,]/g, "")) : load.rate
      return !isNaN(rate) && rate > 0
    })

    console.log("Active loads with valid rates:", activeLoadsWithRates.length)

    const averageRate =
      activeLoadsWithRates.length > 0
        ? activeLoadsWithRates.reduce((sum, load) => {
            const rate = typeof load.rate === "string" ? Number.parseFloat(load.rate.replace(/[$,]/g, "")) : load.rate
            console.log(`Active Load ${load.load_number}: rate = ${rate}`)
            return sum + rate
          }, 0) / activeLoadsWithRates.length
        : 0

    console.log("Average rate from active loads:", averageRate)

    return {
      activeCount,
      completedCount,
      totalRevenue,
      averageRate,
      activeLoadsWithRates: activeLoadsWithRates.length,
    }
  }, [activeLoads, completedLoads])

  const isLoading = activeLoading || completedLoading

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.activeCount}</div>
          <p className="text-xs text-muted-foreground">Currently active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.completedCount}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : `$${metrics.totalRevenue.toLocaleString()}`}</div>
          <p className="text-xs text-muted-foreground">From {metrics.completedCount} completed loads</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : metrics.activeLoadsWithRates > 0 ? `$${metrics.averageRate.toFixed(2)}` : "$0.00"}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeLoadsWithRates > 0
              ? `Average from ${metrics.activeLoadsWithRates} active loads`
              : "No active loads with rates"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
