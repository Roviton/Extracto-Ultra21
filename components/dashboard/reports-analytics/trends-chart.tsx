"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

// Sample weekly trends data
const weeklyTrendsData = [
  {
    name: "Week 1",
    loadCount: 42,
    revenue: 68500,
    onTimeDelivery: 95.2,
  },
  {
    name: "Week 2",
    loadCount: 45,
    revenue: 72300,
    onTimeDelivery: 96.8,
  },
  {
    name: "Week 3",
    loadCount: 40,
    revenue: 65800,
    onTimeDelivery: 92.5,
  },
  {
    name: "Week 4",
    loadCount: 49,
    revenue: 80900,
    onTimeDelivery: 97.1,
  },
]

// Sample monthly trends data
const monthlyTrendsData = [
  {
    name: "Jan",
    loadCount: 152,
    revenue: 245000,
    onTimeDelivery: 94.3,
  },
  {
    name: "Feb",
    loadCount: 143,
    revenue: 228000,
    onTimeDelivery: 93.8,
  },
  {
    name: "Mar",
    loadCount: 165,
    revenue: 267500,
    onTimeDelivery: 95.2,
  },
  {
    name: "Apr",
    loadCount: 170,
    revenue: 275000,
    onTimeDelivery: 96.1,
  },
  {
    name: "May",
    loadCount: 176,
    revenue: 287500,
    onTimeDelivery: 95.7,
  },
]

export function TrendsChart() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly")
  const [chartType, setChartType] = useState<"revenue-loads" | "delivery">("revenue-loads")

  const data = timeframe === "weekly" ? weeklyTrendsData : monthlyTrendsData

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "weekly" | "monthly")}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={chartType} onValueChange={(v) => setChartType(v as "revenue-loads" | "delivery")}>
          <TabsList>
            <TabsTrigger value="revenue-loads">Revenue & Loads</TabsTrigger>
            <TabsTrigger value="delivery">On-Time Delivery</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="p-4">
        {chartType === "revenue-loads" ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") return [formatCurrency(value as number), "Revenue"]
                  return [value, name === "loadCount" ? "Load Count" : name]
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="loadCount" name="Load Count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[85, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "On-Time Delivery"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="onTimeDelivery"
                name="On-Time Delivery %"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
