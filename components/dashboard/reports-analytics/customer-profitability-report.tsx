"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, ChevronDown, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

// Sample customer profitability data
const customerProfitabilityData = [
  {
    id: "C-1001",
    name: "Acme Logistics",
    revenue: 287500,
    miles: 89750,
    rpm: 3.2,
    loads: 156,
    onTimeDelivery: 97.5,
    issuePercentage: 2.5,
    profitMargin: 18.5,
    notes: "Excellent customer with consistent high-value loads.",
  },
  {
    id: "C-1002",
    name: "Global Transport Inc.",
    revenue: 186200,
    miles: 60065,
    rpm: 3.1,
    loads: 98,
    onTimeDelivery: 98.2,
    issuePercentage: 1.8,
    profitMargin: 17.2,
    notes: "",
  },
  {
    id: "C-1003",
    name: "FastFreight Co.",
    revenue: 398750,
    miles: 117280,
    rpm: 3.4,
    loads: 215,
    onTimeDelivery: 92.1,
    issuePercentage: 3.2,
    profitMargin: 21.5,
    notes: "High revenue but also high issue rate. Consider operational adjustments.",
  },
  {
    id: "C-1004",
    name: "Prime Shipping LLC",
    revenue: 142600,
    miles: 49170,
    rpm: 2.9,
    loads: 78,
    onTimeDelivery: 89.7,
    issuePercentage: 5.1,
    profitMargin: 12.8,
    notes: "Low RPM and high issue rate. Consider renegotiating rates.",
  },
  {
    id: "C-1005",
    name: "Horizon Freight Systems",
    revenue: 76300,
    miles: 25430,
    rpm: 3.0,
    loads: 42,
    onTimeDelivery: 95.2,
    issuePercentage: 2.3,
    profitMargin: 15.6,
    notes: "",
  },
  {
    id: "C-1006",
    name: "Velocity Logistics",
    revenue: 248000,
    miles: 75150,
    rpm: 3.3,
    loads: 124,
    onTimeDelivery: 98.4,
    issuePercentage: 1.6,
    profitMargin: 19.8,
    notes: "Very reliable customer with excellent communication.",
  },
  {
    id: "C-1007",
    name: "Summit Supply Chain",
    revenue: 163400,
    miles: 52710,
    rpm: 3.1,
    loads: 86,
    onTimeDelivery: 90.7,
    issuePercentage: 4.7,
    profitMargin: 14.2,
    notes: "Multiple issues with delivery windows. Needs attention.",
  },
]

export function CustomerProfitabilityReport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>(
    customerProfitabilityData.reduce((acc, customer) => ({ ...acc, [customer.id]: customer.notes }), {}),
  )
  const { toast } = useToast()

  const filteredData = customerProfitabilityData.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    toast({
      title: "Report Export Started",
      description: `Your ${format.toUpperCase()} report is being generated and will download shortly.`,
    })
  }

  const handleNoteChange = (customerId: string, note: string) => {
    setCustomerNotes((prev) => ({ ...prev, [customerId]: note }))
  }

  const handleNoteSave = (customerId: string) => {
    toast({
      title: "Notes Saved",
      description: "Customer notes have been updated successfully.",
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
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
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
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Loads</TableHead>
              <TableHead className="text-right">RPM</TableHead>
              <TableHead className="text-right">Profit Margin</TableHead>
              <TableHead className="text-right">On-Time %</TableHead>
              <TableHead className="text-right">Issue %</TableHead>
              <TableHead>Manager Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((customer) => {
                const hasDeliveryIssue = customer.onTimeDelivery < 93
                const hasLowProfitability = customer.profitMargin < 15
                const hasHighProfitability = customer.profitMargin > 18

                return (
                  <TableRow
                    key={customer.id}
                    className={cn(
                      hasDeliveryIssue || hasLowProfitability
                        ? "bg-red-50/30 dark:bg-red-950/10"
                        : hasHighProfitability
                          ? "bg-green-50/30 dark:bg-green-950/10"
                          : undefined,
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.id}</div>
                        </div>
                        {hasDeliveryIssue && (
                          <Badge variant="destructive" className="ml-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Late Deliveries
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.revenue)}</TableCell>
                    <TableCell className="text-right">{customer.loads}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          customer.rpm < 3.0
                            ? "text-red-600 dark:text-red-400"
                            : customer.rpm >= 3.3
                              ? "text-green-600 dark:text-green-400"
                              : undefined,
                        )}
                      >
                        ${customer.rpm.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          hasLowProfitability
                            ? "text-red-600 dark:text-red-400"
                            : hasHighProfitability
                              ? "text-green-600 dark:text-green-400"
                              : undefined,
                        )}
                      >
                        {customer.profitMargin.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          hasDeliveryIssue
                            ? "text-red-600 dark:text-red-400"
                            : customer.onTimeDelivery >= 98
                              ? "text-green-600 dark:text-green-400"
                              : undefined,
                        )}
                      >
                        {customer.onTimeDelivery.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          customer.issuePercentage > 3
                            ? "text-red-600 dark:text-red-400"
                            : customer.issuePercentage < 2
                              ? "text-green-600 dark:text-green-400"
                              : undefined,
                        )}
                      >
                        {customer.issuePercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-col gap-2">
                        <Textarea
                          placeholder="Add notes..."
                          value={customerNotes[customer.id] || ""}
                          onChange={(e) => handleNoteChange(customer.id, e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                          onClick={() => handleNoteSave(customer.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
