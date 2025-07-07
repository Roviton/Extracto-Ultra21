"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DispatcherPerformanceChartsProps {
  timeRange: string
  chartType: "trends" | "comparison"
}

export function DispatcherPerformanceCharts({ timeRange, chartType }: DispatcherPerformanceChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {chartType === "trends" ? (
        <>
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Dispatcher Efficiency Trends</CardTitle>
              <CardDescription>
                Efficiency scores over the{" "}
                {timeRange === "day" ? "past 24 hours" : timeRange === "week" ? "past week" : "past month"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">
                [Efficiency Trend Chart - This would be implemented with a charting library like Chart.js or Recharts]
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response times over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <div className="text-muted-foreground">
                [Response Time Chart - This would be implemented with a charting library]
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>On-Time Delivery Rate</CardTitle>
              <CardDescription>Percentage of loads delivered on time</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <div className="text-muted-foreground">
                [On-Time Delivery Chart - This would be implemented with a charting library]
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Dispatcher Performance Comparison</CardTitle>
              <CardDescription>Compare key metrics across all dispatchers</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="efficiency">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                  <TabsTrigger value="response">Response Time</TabsTrigger>
                  <TabsTrigger value="ontime">On-Time Rate</TabsTrigger>
                  <TabsTrigger value="customer">Customer Rating</TabsTrigger>
                </TabsList>
                <TabsContent value="efficiency" className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    [Efficiency Comparison Chart - This would be implemented with a charting library]
                  </div>
                </TabsContent>
                <TabsContent value="response" className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    [Response Time Comparison Chart - This would be implemented with a charting library]
                  </div>
                </TabsContent>
                <TabsContent value="ontime" className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    [On-Time Rate Comparison Chart - This would be implemented with a charting library]
                  </div>
                </TabsContent>
                <TabsContent value="customer" className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    [Customer Rating Comparison Chart - This would be implemented with a charting library]
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Dispatchers with highest efficiency scores</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <div className="text-muted-foreground">
                [Top Performers Chart - This would be implemented with a charting library]
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Improvement</CardTitle>
              <CardDescription>Dispatchers requiring additional support</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <div className="text-muted-foreground">
                [Needs Improvement Chart - This would be implemented with a charting library]
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
