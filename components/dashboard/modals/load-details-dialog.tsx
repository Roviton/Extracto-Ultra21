"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Paperclip } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LoadDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  load: any
}

export function LoadDetailsDialog({ isOpen, onClose, load }: LoadDetailsDialogProps) {
  // Add null check to prevent errors
  if (!load) {
    return null
  }

  const getCustomerDisplay = (customer: any): string => {
    if (!customer) return "Unknown Customer"

    if (typeof customer === "string") {
      return customer
    }

    if (typeof customer === "object") {
      const name = customer.name || customer.company_name || customer.customer_name
      if (typeof name === "string") {
        return name
      }
      return "Unknown Customer"
    }

    return "Unknown Customer"
  }

  const getDriverDisplay = (loadDrivers: any): string => {
    if (!loadDrivers) return "Unassigned"

    // Ensure loadDrivers is an array
    const driversArray = Array.isArray(loadDrivers) ? loadDrivers : []

    if (driversArray.length === 0) return "Unassigned"

    const driverNames = driversArray.map((assignment: any) => {
      if (!assignment) return "Unknown Driver"

      let driverName = "Unknown Driver"

      // Handle if driver is a string directly
      if (typeof assignment.driver === "string") {
        driverName = assignment.driver
      }
      // Handle if driver is an object
      else if (assignment.driver && typeof assignment.driver === "object") {
        driverName = assignment.driver.name || "Unknown Driver"
      }

      const isPrimary = assignment.is_primary ? " (Primary)" : ""
      return `${driverName}${isPrimary}`
    })

    return driverNames.join(", ")
  }

  const formatDate = (dateString: any): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined) return "$0.00"
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (isNaN(numAmount)) return "$0.00"

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount)
  }

  // Safely get string value from any property
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "N/A"
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    if (typeof value === "object") {
      try {
        // Try to get a meaningful string representation
        if (value.name) return String(value.name)
        if (value.id) return String(value.id)
        return "Complex Object"
      } catch {
        return "Complex Object"
      }
    }
    return "N/A"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Load Details - {safeString(load.load_number || load.id)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left side - Rate Confirmation Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                <Badge variant="outline" className="ml-2">
                  {formatCurrency(load.rate)}
                </Badge>
              </div>
              <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-md border bg-white">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium">Rate Confirmation PDF</p>
                    <p className="text-xs text-muted-foreground">
                      {safeString(load.load_number || load.id)} - {safeString(load.dispatcher)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>rate-confirmation-{safeString(load.load_number || load.id).toLowerCase()}.pdf</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Load Details */}
          <Card>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">
                  Load Details
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Load ID:</span>
                        <p>{safeString(load.load_number || load.id)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Status:</span>
                        <p>{safeString(load.status)}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Customer:</span>
                        <p>{getCustomerDisplay(load.customer)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Dispatcher:</span>
                        <p>{safeString(load.dispatcher)}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Origin:</span>
                        <p>
                          {safeString(load.pickup_city)}, {safeString(load.pickup_state)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Destination:</span>
                        <p>
                          {safeString(load.delivery_city)}, {safeString(load.delivery_state)}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Pickup Date:</span>
                        <p>{formatDate(load.pickup_date)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Delivery Date:</span>
                        <p>{formatDate(load.delivery_date)}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Rate:</span>
                        <p>{formatCurrency(load.rate)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Equipment:</span>
                        <p>{safeString(load.equipment_type)}</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Commodity:</span>
                        <p>{safeString(load.commodity)}</p>
                        {load.weight && <p>Weight: {safeString(load.weight)} lbs</p>}
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Driver:</span>
                        <p>{getDriverDisplay(load.load_drivers)}</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Special Instructions:</span>
                        <p className="whitespace-pre-line">{safeString(load.special_instructions)}</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="p-4">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Manager Comments:</span>
                  <p className="whitespace-pre-line">{safeString(load.comments)}</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
