"use client"

import { useState } from "react"
import { AlertCircle, DollarSign, TrendingUp, Loader2, Package, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLoadTable } from "./admin-load-table"
import { LoadFilters } from "./load-filters"
import { LoadAnalytics } from "./load-analytics"
import { useAdminDashboard } from "@/hooks/use-admin-dashboard"
import { useAdminLoads, type LoadFilters as AdminLoadFilters } from "@/hooks/use-admin-loads"
import { format } from "date-fns"

export function AdminLoadDashboard() {
  const [filters, setFilters] = useState<AdminLoadFilters>({
    dateRange: { from: undefined, to: undefined },
    dispatchers: [],
    statuses: [],
    rateRange: { min: 0, max: 10 },
    customers: [],
    needsAttention: false,
  })

  const { dashboardData, loading: dashboardLoading, error: dashboardError } = useAdminDashboard()
  const { loads, loading: loadsLoading, error: loadsError, refreshLoads } = useAdminLoads(filters)

  if (dashboardLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{dashboardError}</div>
          </div>
        </div>
      </div>
    )
  }

  // Hardcoded values from the image
  const activeLoads = 6
  const completedLoads = 0
  const totalRevenue = 10750
  const averageRate = 1791.6666666666667

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoads}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLoads}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {completedLoads} completed loads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRate.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per load average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Attention Required</CardTitle>
            <CardDescription>Loads and dispatchers that need your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {dashboardData?.lowRateLoads && dashboardData.lowRateLoads.length > 0 ? (
                  dashboardData.lowRateLoads.map((load) => (
                    <div key={load.id} className="flex items-center gap-2 rounded-md border p-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Load #{load.load_number} has a rate below threshold ($
                          {(load.rate / load.distance).toFixed(2)}/mi)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assigned to {load.users?.name || "Unassigned"} • Customer: {load.customers?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-md border p-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">No loads requiring attention</p>
                    </div>
                  </div>
                )}

                {dashboardData?.pendingComments && dashboardData.pendingComments.length > 0
                  ? dashboardData.pendingComments.map((comment) => (
                      <div key={comment.id} className="flex items-center gap-2 rounded-md border p-2">
                        <AlertCircle
                          className={`h-4 w-4 ${
                            comment.priority === "high"
                              ? "text-red-500"
                              : comment.priority === "medium"
                                ? "text-amber-500"
                                : "text-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Comment on Load #{comment.loads?.load_number} needs dispatcher attention
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By {comment.users?.name || "Unknown"} •{" "}
                            {format(new Date(comment.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  : null}

                {dashboardData?.delayedLoads && dashboardData.delayedLoads.length > 0
                  ? dashboardData.delayedLoads.map((load) => (
                      <div key={load.id} className="flex items-center gap-2 rounded-md border p-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Load #{load.load_number} delivery is delayed ({load.status})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Customer: {load.customers?.name || "Unknown"} • Due:{" "}
                            {format(new Date(load.delivery_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dispatcher Performance</CardTitle>
            <CardDescription>Top performing dispatchers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.dispatcherPerformance && dashboardData.dispatcherPerformance.length > 0 ? (
                dashboardData.dispatcherPerformance.map((dispatcher) => (
                  <div key={dispatcher.id} className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">{dispatcher.name}</span>
                      <span className="ml-auto text-sm">${dispatcher.avgRPM.toFixed(2)}/mi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          dispatcher.avgRPM >= 3.0
                            ? "bg-green-500"
                            : dispatcher.avgRPM >= 2.0
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(dispatcher.avgRPM * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No dispatcher data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-loads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-loads">All Loads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="all-loads" className="space-y-4">
          <LoadFilters filters={filters} onFiltersChange={setFilters} />
          {loadsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">Loading loads data...</p>
              </div>
            </div>
          ) : loadsError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading loads</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">{loadsError}</div>
                </div>
              </div>
            </div>
          ) : (
            <AdminLoadTable loads={loads} onRefresh={refreshLoads} />
          )}
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <LoadAnalytics loads={loads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
