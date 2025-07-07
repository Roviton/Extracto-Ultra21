"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function UsageMetrics() {
  const usageData = [
    {
      metric: "Active Dispatchers",
      current: 12,
      limit: 15,
      unit: "users",
    },
    {
      metric: "Monthly Loads",
      current: 2847,
      limit: null,
      unit: "loads",
    },
    {
      metric: "AI API Calls",
      current: 15420,
      limit: 25000,
      unit: "calls",
    },
    {
      metric: "Storage Used",
      current: 45.2,
      limit: 100,
      unit: "GB",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {usageData.map((item) => {
        const percentage = item.limit ? (item.current / item.limit) * 100 : 0

        return (
          <Card key={item.metric}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{item.metric}</CardTitle>
              <CardDescription>
                {item.current} {item.unit}
                {item.limit && ` of ${item.limit} ${item.unit}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {item.limit ? (
                <div className="space-y-2">
                  <Progress value={percentage} className="w-full" />
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of limit used</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unlimited</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
