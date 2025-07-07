"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Sample weekly revenue vs miles data
const weeklyData = [
  {
    week: "Week 1 (May 1-7)",
    revenue: 68500,
    miles: 21450,
    rpm: 3.19,
    loads: 42,
    notes: "",
  },
  {
    week: "Week 2 (May 8-14)",
    revenue: 72300,
    miles: 22100,
    rpm: 3.27,
    loads: 45,
    notes: "High-value electronics shipments increased RPM.",
  },
  {
    week: "Week 3 (May 15-21)",
    revenue: 65800,
    miles: 21900,
    rpm: 3.0,
    loads: 40,
    notes: "Several low-paying loads due to route constraints.",
  },
  {
    week: "Week 4 (May 22-28)",
    revenue: 80900,
    miles: 24300,
    rpm: 3.33,
    loads: 49,
    notes: "Excellent week with premium rates on refrigerated loads.",
  },
]

// Sample monthly revenue vs miles data
const monthlyData = [
  {
    month: "January 2025",
    revenue: 245000,
    miles: 78500,
    rpm: 3.12,
    loads: 152,
    notes: "Winter weather impacted some deliveries.",
  },
  {
    month: "February 2025",
    revenue: 228000,
    miles: 74200,
    rpm: 3.07,
    loads: 143,
    notes: "",
  },
  {
    month: "March 2025",
    revenue: 267500,
    miles: 83400,
    rpm: 3.21,
    loads: 165,
    notes: "Spring shipping increase began mid-month.",
  },
  {
    month: "April 2025",
    revenue: 275000,
    miles: 86200,
    rpm: 3.19,
    loads: 170,
    notes: "",
  },
  {
    month: "May 2025",
    revenue: 287500,
    miles: 89750,
    rpm: 3.2,
    loads: 176,
    notes: "Current month (partial data).",
  },
]

export function RevenueVsMilesReport() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly")
  const [notes, setNotes] = useState<Record<string, string>>(
    [...weeklyData, ...monthlyData].reduce(
      (acc, item) => ({
        ...acc,
        [item.week || item.month]: item.notes,
      }),
      {},
    ),
  )
  const { toast } = useToast()

  const data = timeframe === "weekly" ? weeklyData : monthlyData

  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    toast({
      title: "Report Export Started",
      description: `Your ${format.toUpperCase()} report is being generated and will download shortly.`,
    })
  }

  const handleNoteChange = (period: string, note: string) => {
    setNotes((prev) => ({ ...prev, [period]: note }))
  }

  const handleNoteSave = (period: string) => {
    toast({
      title: "Notes Saved",
      description: "Period notes have been updated successfully.",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "weekly" | "monthly")}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("xlsx")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>PDF (.pdf)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{timeframe === "weekly" ? "Week" : "Month"}</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Miles</TableHead>
              <TableHead className="text-right">RPM</TableHead>
              <TableHead className="text-right">Loads</TableHead>
              <TableHead>Manager Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const period = item.week || item.month
              return (
                <TableRow
                  key={period}
                  className={cn(
                    item.rpm < 3.05
                      ? "bg-red-50/30 dark:bg-red-950/10"
                      : item.rpm >= 3.25
                        ? "bg-green-50/30 dark:bg-green-950/10"
                        : undefined,
                  )}
                >
                  <TableCell className="font-medium">{period}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.miles)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        item.rpm < 3.05
                          ? "text-red-600 dark:text-red-400"
                          : item.rpm >= 3.25
                            ? "text-green-600 dark:text-green-400"
                            : undefined,
                      )}
                    >
                      ${item.rpm.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.loads}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Add notes..."
                        value={notes[period] || ""}
                        onChange={(e) => handleNoteChange(period, e.target.value)}
                        className="min-h-[60px] text-xs"
                      />
                      <Button size="sm" variant="outline" className="ml-auto" onClick={() => handleNoteSave(period)}>
                        Save
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
