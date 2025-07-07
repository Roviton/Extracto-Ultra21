"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Initial column visibility settings
const initialColumnSettings = {
  loads: {
    id: true,
    reference: true,
    customer: true,
    origin: true,
    destination: true,
    pickupDate: true,
    deliveryDate: true,
    status: true,
    driver: true,
    rate: true,
    distance: true,
    rpm: true,
    timeline: true,
    createdAt: false,
    actions: true,
  },
  drivers: {
    name: true,
    status: true,
    location: true,
    phone: true,
    experience: true,
    performance: true,
    messaging: true,
    notes: true,
    actions: true,
  },
  customers: {
    name: true,
    status: true,
    contactName: true,
    performance: true,
    loadsCompleted: true,
    totalRevenue: true,
    onTimeRate: true,
    report: true,
    actions: true,
  },
  reports: {
    period: true,
    revenue: true,
    miles: true,
    rpm: true,
    loads: true,
    onTimeDelivery: true,
    issuePercentage: true,
    profitMargin: true,
    notes: true,
  },
}

type TableType = "loads" | "drivers" | "customers" | "reports"

export function ColumnCustomizationSettings() {
  const [columnSettings, setColumnSettings] = useState(initialColumnSettings)
  const [activeTab, setActiveTab] = useState<TableType>("loads")
  const { toast } = useToast()

  const handleToggle = (table: TableType, column: string, value: boolean) => {
    setColumnSettings((prev) => ({
      ...prev,
      [table]: {
        ...prev[table],
        [column]: value,
      },
    }))
  }

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Column visibility settings have been updated.",
    })
  }

  const handleResetDefaults = () => {
    setColumnSettings(initialColumnSettings)
    toast({
      title: "Settings reset",
      description: "Column visibility settings have been reset to defaults.",
    })
  }

  // Column labels for each table
  const columnLabels = {
    loads: {
      id: "Load ID",
      reference: "Reference",
      customer: "Customer",
      origin: "Origin",
      destination: "Destination",
      pickupDate: "Pickup Date",
      deliveryDate: "Delivery Date",
      status: "Status",
      driver: "Driver",
      rate: "Rate",
      distance: "Distance",
      rpm: "RPM",
      timeline: "Timeline",
      createdAt: "Created At",
      actions: "Actions",
    },
    drivers: {
      name: "Driver Name",
      status: "Status",
      location: "Location",
      phone: "Contact Info",
      experience: "Experience",
      performance: "Performance",
      messaging: "Messaging",
      notes: "Notes",
      actions: "Actions",
    },
    customers: {
      name: "Customer Name",
      status: "Status",
      contactName: "Contact Info",
      performance: "Performance",
      loadsCompleted: "Loads",
      totalRevenue: "Revenue",
      onTimeRate: "On-Time %",
      report: "Report",
      actions: "Actions",
    },
    reports: {
      period: "Period",
      revenue: "Revenue",
      miles: "Miles",
      rpm: "RPM",
      loads: "Loads",
      onTimeDelivery: "On-Time %",
      issuePercentage: "Issue %",
      profitMargin: "Profit Margin",
      notes: "Notes",
    },
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Column Customization</CardTitle>
          <CardDescription>Customize which columns are visible in tables throughout the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TableType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="loads">Loads Table</TabsTrigger>
              <TabsTrigger value="drivers">Drivers Table</TabsTrigger>
              <TabsTrigger value="customers">Customers Table</TabsTrigger>
              <TabsTrigger value="reports">Reports Tables</TabsTrigger>
            </TabsList>

            {(["loads", "drivers", "customers", "reports"] as TableType[]).map((tableType) => (
              <TabsContent key={tableType} value={tableType} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(columnSettings[tableType]).map(([column, isVisible]) => (
                    <div key={column} className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                      <Label htmlFor={`${tableType}-${column}`} className="flex-1">
                        {columnLabels[tableType][column as keyof (typeof columnLabels)[typeof tableType]]}
                      </Label>
                      <Switch
                        id={`${tableType}-${column}`}
                        checked={isVisible}
                        onCheckedChange={(checked) => handleToggle(tableType, column, checked)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleResetDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Display Settings</CardTitle>
          <CardDescription>Additional settings for how tables are displayed in the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dense-tables" className="flex flex-col space-y-1">
              <span>Use Dense Tables</span>
              <span className="font-normal text-xs text-muted-foreground">
                Reduce padding in tables to show more data on screen
              </span>
            </Label>
            <Switch id="dense-tables" />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="sticky-headers" className="flex flex-col space-y-1">
              <span>Sticky Table Headers</span>
              <span className="font-normal text-xs text-muted-foreground">
                Keep table headers visible when scrolling
              </span>
            </Label>
            <Switch id="sticky-headers" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="row-highlighting" className="flex flex-col space-y-1">
              <span>Row Highlighting</span>
              <span className="font-normal text-xs text-muted-foreground">
                Highlight rows based on status or other conditions
              </span>
            </Label>
            <Switch id="row-highlighting" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="row-numbers" className="flex flex-col space-y-1">
              <span>Show Row Numbers</span>
              <span className="font-normal text-xs text-muted-foreground">Display row numbers in tables</span>
            </Label>
            <Switch id="row-numbers" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
