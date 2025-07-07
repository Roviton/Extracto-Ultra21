"use client"

import { useState, useMemo } from "react"
import { Search, Download, FileSpreadsheet, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { LoadsArchiveTable } from "@/components/dashboard/loads/loads-archive-table"
import { LoadDetailsModal } from "@/components/dashboard/modals/load-details-modal"
import useLoads from "@/hooks/use-loads"
import { useToast } from "@/components/ui/use-toast"
import type { DateRange } from "react-day-picker"
import * as XLSX from "xlsx"

interface Load {
  id: string
  load_number?: string | null
  reference_number?: string | null
  customer?: any | null
  pickup_city?: string | null
  pickup_state?: string | null
  pickup_date?: string | null
  pickup_address?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_date?: string | null
  delivery_address?: string | null
  status: string
  rate?: number | string | null
  commodity?: string | null
  weight?: number | null
  miles?: number | null
  load_drivers?: any[] | null
  equipment_type?: string | null
  special_instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
  completed_at?: string | null
}

const LoadsArchivePage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dateFilterType, setDateFilterType] = useState<"pickup" | "delivery">("pickup")
  const { toast } = useToast()

  // Fetch only completed and cancelled loads
  const { loads, loading, error } = useLoads({
    viewMode: "archived", // This should include both completed and cancelled
  })

  // Apply date range filtering
  const dateFilteredLoads = useMemo(() => {
    if (!dateRange?.from || !loads) return loads

    return loads.filter((load: Load) => {
      const targetDate = dateFilterType === "pickup" ? load.pickup_date : load.delivery_date
      if (!targetDate) return false

      const loadDate = new Date(targetDate)
      const fromDate = new Date(dateRange.from!)
      const toDate = dateRange.to ? new Date(dateRange.to) : fromDate

      // Set time to start/end of day for proper comparison
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)
      loadDate.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

      return loadDate >= fromDate && loadDate <= toDate
    })
  }, [loads, dateRange, dateFilterType])

  // Filter loads based on search query
  const filteredLoads = useMemo(() => {
    const loadsToFilter = dateFilteredLoads || []

    if (!searchQuery.trim()) return loadsToFilter

    const query = searchQuery.toLowerCase()
    return loadsToFilter.filter((load: Load) => {
      const loadNumber = load.load_number?.toLowerCase() || ""
      const referenceNumber = load.reference_number?.toLowerCase() || ""
      const customerName = getCustomerDisplay(load.customer).toLowerCase()
      const pickupLocation = `${load.pickup_city || ""} ${load.pickup_state || ""}`.toLowerCase()
      const deliveryLocation = `${load.delivery_city || ""} ${load.delivery_state || ""}`.toLowerCase()
      const driverName = getDriverDisplay(load.load_drivers).toLowerCase()

      return (
        loadNumber.includes(query) ||
        referenceNumber.includes(query) ||
        customerName.includes(query) ||
        pickupLocation.includes(query) ||
        deliveryLocation.includes(query) ||
        driverName.includes(query)
      )
    })
  }, [dateFilteredLoads, searchQuery])

  const getCustomerDisplay = (customer: any): string => {
    if (!customer) return "N/A"
    if (typeof customer === "string") return customer
    if (typeof customer === "object") return customer.name || customer.company_name || customer.customer_name || "N/A"
    return "N/A"
  }

  const getDriverDisplay = (loadDrivers: any[] | null | undefined): string => {
    if (!loadDrivers || loadDrivers.length === 0) return "Unassigned"
    return loadDrivers.map((ld) => ld.driver?.name || "Unknown").join(", ")
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return "$0.00"
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (isNaN(numAmount)) return "$0.00"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numAmount)
  }

  const generateFilename = (format: "csv" | "xlsx"): string => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "_")
    let filename = "loads_archive"

    if (dateRange?.from) {
      const fromDate = dateRange.from.toISOString().slice(0, 10).replace(/-/g, "_")
      const toDate = dateRange.to ? dateRange.to.toISOString().slice(0, 10).replace(/-/g, "_") : fromDate
      filename += `_${fromDate}_to_${toDate}`
    } else {
      filename += `_${timestamp}`
    }

    return `${filename}.${format}`
  }

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true)
    try {
      const exportData = filteredLoads.map((load: Load) => ({
        "Load ID": load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`,
        "Reference Number": load.reference_number || "",
        Customer: getCustomerDisplay(load.customer),
        "Pick Up Location": `${load.pickup_city || ""}, ${load.pickup_state || ""}`,
        "Pick Up Address": load.pickup_address || "",
        "Pick Date": formatDate(load.pickup_date),
        "Delivery Location": `${load.delivery_city || ""}, ${load.delivery_state || ""}`,
        "Delivery Address": load.delivery_address || "",
        "Delivery Date": formatDate(load.delivery_date),
        Driver: getDriverDisplay(load.load_drivers),
        Rate: formatCurrency(load.rate),
        Status: load.status.charAt(0).toUpperCase() + load.status.slice(1),
        Commodity: load.commodity || "",
        Weight: load.weight ? `${load.weight} lbs` : "",
        Miles: load.miles || "",
        Equipment: load.equipment_type || "",
        "Completed Date": formatDate(load.completed_at || load.updated_at),
        "Special Instructions": load.special_instructions || "",
      }))

      const filename = generateFilename(format)

      if (format === "csv") {
        const csvContent = convertToCSV(exportData)
        downloadFile(csvContent, filename, "text/csv")
      } else {
        // Create proper Excel file using XLSX library
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()

        // Set column widths for better formatting
        const columnWidths = [
          { wch: 20 }, // Load ID
          { wch: 15 }, // Reference Number
          { wch: 25 }, // Customer
          { wch: 25 }, // Pick Up Location
          { wch: 30 }, // Pick Up Address
          { wch: 12 }, // Pick Date
          { wch: 25 }, // Delivery Location
          { wch: 30 }, // Delivery Address
          { wch: 12 }, // Delivery Date
          { wch: 20 }, // Driver
          { wch: 12 }, // Rate
          { wch: 12 }, // Status
          { wch: 20 }, // Commodity
          { wch: 12 }, // Weight
          { wch: 10 }, // Miles
          { wch: 15 }, // Equipment
          { wch: 15 }, // Completed Date
          { wch: 40 }, // Special Instructions
        ]
        worksheet["!cols"] = columnWidths

        XLSX.utils.book_append_sheet(workbook, worksheet, "Loads Archive")

        // Generate Excel file as array buffer
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        downloadBlob(blob, filename)
      }

      const dateRangeText = dateRange?.from
        ? ` (${dateFilterType} date: ${formatDate(dateRange.from.toISOString())} - ${formatDate(dateRange.to?.toISOString() || dateRange.from.toISOString())})`
        : ""

      toast({
        title: "Export Successful",
        description: `${filteredLoads.length} loads exported to ${format.toUpperCase()}${dateRangeText}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""')
            return escaped.includes(",") ? `"${escaped}"` : escaped
          })
          .join(","),
      ),
    ]

    return csvRows.join("\n")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    downloadBlob(blob, filename)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load)
  }

  const clearDateFilter = () => {
    setDateRange(undefined)
  }

  const hasActiveFilters = dateRange?.from || searchQuery.trim()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loads Archive</h1>
          <p className="text-muted-foreground">View completed and cancelled loads</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting || filteredLoads.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("xlsx")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search loads by Load #, Customer, Route, or Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Filter by Date Range</label>
              <div className="flex gap-2">
                <Select
                  value={dateFilterType}
                  onValueChange={(value: "pickup" | "delivery") => setDateFilterType(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup Date</SelectItem>
                    <SelectItem value="delivery">Delivery Date</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  range={dateRange}
                  onRangeChange={setDateRange}
                  placeholder="Select date range"
                  className="flex-1"
                />
              </div>
            </div>

            {dateRange?.from && (
              <Button variant="outline" size="sm" onClick={clearDateFilter}>
                <X className="mr-2 h-4 w-4" />
                Clear Filter
              </Button>
            )}
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {searchQuery.trim() && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Search: "{searchQuery}"</span>
              )}
              {dateRange?.from && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {dateFilterType === "pickup" ? "Pickup" : "Delivery"}: {formatDate(dateRange.from.toISOString())} -{" "}
                  {formatDate(dateRange.to?.toISOString() || dateRange.from.toISOString())}
                </span>
              )}
              <span>
                Showing {filteredLoads.length} of {loads?.length || 0} loads
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Table */}
      <LoadsArchiveTable loads={filteredLoads} loading={loading} error={error} onViewDetails={handleViewDetails} />

      {/* Load Details Modal */}
      {selectedLoad && (
        <LoadDetailsModal isOpen={!!selectedLoad} onClose={() => setSelectedLoad(null)} load={selectedLoad} />
      )}
    </div>
  )
}

export default LoadsArchivePage
