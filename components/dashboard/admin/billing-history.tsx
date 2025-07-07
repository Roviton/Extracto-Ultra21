"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

export function BillingHistory() {
  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 299,
      status: "paid",
      description: "Professional Plan - January 2024",
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      amount: 299,
      status: "paid",
      description: "Professional Plan - December 2023",
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      amount: 299,
      status: "paid",
      description: "Professional Plan - November 2023",
    },
    {
      id: "INV-2023-010",
      date: "2023-10-15",
      amount: 99,
      status: "paid",
      description: "Starter Plan - October 2023",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Your recent invoices and payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">{invoice.description}</p>
                <p className="text-xs text-muted-foreground">{invoice.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium">${invoice.amount}</p>
                  {getStatusBadge(invoice.status)}
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
