"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample billing history data
const billingHistory = [
  {
    id: "INV-2024-005",
    date: "May 15, 2024",
    description: "Dispatch Pro Plan - Monthly",
    amount: "$99.00",
    status: "paid",
  },
  {
    id: "INV-2024-004",
    date: "Apr 15, 2024",
    description: "Dispatch Pro Plan - Monthly",
    amount: "$99.00",
    status: "paid",
  },
  {
    id: "INV-2024-003",
    date: "Mar 15, 2024",
    description: "Dispatch Pro Plan - Monthly",
    amount: "$99.00",
    status: "paid",
  },
  {
    id: "INV-2024-002",
    date: "Feb 15, 2024",
    description: "Dispatch Basic Plan - Monthly",
    amount: "$49.00",
    status: "paid",
  },
  {
    id: "INV-2024-001",
    date: "Jan 15, 2024",
    description: "Dispatch Basic Plan - Monthly",
    amount: "$49.00",
    status: "paid",
  },
  {
    id: "INV-2024-000",
    date: "Jan 10, 2024",
    description: "Additional AI Message Credits (500)",
    amount: "$25.00",
    status: "paid",
  },
]

export function BillingHistory() {
  const [year, setYear] = useState("2024")

  // Filter transactions by year
  const filteredHistory = billingHistory.filter((transaction) => transaction.date.includes(year))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Billing History</CardTitle>
        <div className="flex items-center gap-2">
          <Select defaultValue={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no billing transactions for the selected year.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
