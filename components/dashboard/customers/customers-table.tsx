"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Download, ExternalLink, Filter, MoreHorizontal, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Define the Customer type
export type Customer = {
  id: string
  name: string
  logo: string
  contactName: string
  contactEmail: string
  contactPhone: string
  address: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  performance: {
    loadsCompleted: number
    totalRevenue: number
    averageRPM: number
    issuePercentage: number
    onTimeDeliveryRate: number
    lateDeliveries: number
  }
  notes?: string
  createdAt: string
}

// Sample data
const initialData: Customer[] = [
  {
    id: "C-1001",
    name: "Acme Logistics",
    logo: "/acme-logistics-logo.png",
    contactName: "John Anderson",
    contactEmail: "john.anderson@acmelogistics.com",
    contactPhone: "(555) 123-4567",
    address: "123 Main St, Los Angeles, CA 90001",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 156,
      totalRevenue: 287500,
      averageRPM: 3.2,
      issuePercentage: 2.5,
      onTimeDeliveryRate: 97.5,
      lateDeliveries: 4,
    },
    notes: "Prefers early morning deliveries. Net-30 payment terms.",
    createdAt: "2022-03-15",
  },
  {
    id: "C-1002",
    name: "Global Transport Inc.",
    logo: "/global-transport-logo.png",
    contactName: "Sarah Williams",
    contactEmail: "sarah.williams@globaltransport.com",
    contactPhone: "(555) 234-5678",
    address: "456 Oak Ave, Chicago, IL 60601",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 98,
      totalRevenue: 186200,
      averageRPM: 3.1,
      issuePercentage: 1.8,
      onTimeDeliveryRate: 98.2,
      lateDeliveries: 2,
    },
    notes: "High-value electronics shipments. Requires additional insurance.",
    createdAt: "2022-05-22",
  },
  {
    id: "C-1003",
    name: "FastFreight Co.",
    logo: "/fastfreight-logo.png",
    contactName: "Michael Johnson",
    contactEmail: "michael.johnson@fastfreight.com",
    contactPhone: "(555) 345-6789",
    address: "789 Pine St, Dallas, TX 75201",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 215,
      totalRevenue: 398750,
      averageRPM: 3.4,
      issuePercentage: 3.2,
      onTimeDeliveryRate: 92.1,
      lateDeliveries: 17,
    },
    notes: "Often has last-minute shipments. Premium rates for expedited service.",
    createdAt: "2021-11-08",
  },
  {
    id: "C-1004",
    name: "Prime Shipping LLC",
    logo: "/prime-shipping-logo.png",
    contactName: "Emily Davis",
    contactEmail: "emily.davis@primeshipping.com",
    contactPhone: "(555) 456-7890",
    address: "101 Maple Dr, Miami, FL 33101",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 78,
      totalRevenue: 142600,
      averageRPM: 2.9,
      issuePercentage: 5.1,
      onTimeDeliveryRate: 89.7,
      lateDeliveries: 8,
    },
    notes: "Seasonal business with peak in Q4. Requires temperature-controlled equipment.",
    createdAt: "2023-01-15",
  },
  {
    id: "C-1005",
    name: "Horizon Freight Systems",
    logo: "/horizon-freight-logo.png",
    contactName: "Robert Chen",
    contactEmail: "robert.chen@horizonfreight.com",
    contactPhone: "(555) 567-8901",
    address: "222 Elm St, Seattle, WA 98101",
    status: "INACTIVE",
    performance: {
      loadsCompleted: 42,
      totalRevenue: 76300,
      averageRPM: 3.0,
      issuePercentage: 2.3,
      onTimeDeliveryRate: 95.2,
      lateDeliveries: 2,
    },
    notes: "Account currently on hold due to payment issues.",
    createdAt: "2022-08-30",
  },
  {
    id: "C-1006",
    name: "Velocity Logistics",
    logo: "/velocity-logistics-logo.png",
    contactName: "Amanda Martinez",
    contactEmail: "amanda.martinez@velocitylogistics.com",
    contactPhone: "(555) 678-9012",
    address: "333 Cedar Rd, Denver, CO 80201",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 124,
      totalRevenue: 248000,
      averageRPM: 3.3,
      issuePercentage: 1.6,
      onTimeDeliveryRate: 98.4,
      lateDeliveries: 2,
    },
    notes: "Excellent communication. Prefers dedicated drivers when possible.",
    createdAt: "2022-04-12",
  },
  {
    id: "C-1007",
    name: "Summit Supply Chain",
    logo: "/summit-supply-logo.png",
    contactName: "David Wilson",
    contactEmail: "david.wilson@summitsupply.com",
    contactPhone: "(555) 789-0123",
    address: "444 Birch Ln, Atlanta, GA 30301",
    status: "ACTIVE",
    performance: {
      loadsCompleted: 86,
      totalRevenue: 163400,
      averageRPM: 3.1,
      issuePercentage: 4.7,
      onTimeDeliveryRate: 90.7,
      lateDeliveries: 8,
    },
    notes: "Multiple pickup locations. Requires careful coordination.",
    createdAt: "2022-09-05",
  },
  {
    id: "C-1008",
    name: "Coastal Distribution",
    logo: "/coastal-distribution-logo.png",
    contactName: "Jennifer Lee",
    contactEmail: "jennifer.lee@coastaldistribution.com",
    contactPhone: "(555) 890-1234",
    address: "555 Spruce Ave, San Francisco, CA 94101",
    status: "PENDING",
    performance: {
      loadsCompleted: 0,
      totalRevenue: 0,
      averageRPM: 0,
      issuePercentage: 0,
      onTimeDeliveryRate: 0,
      lateDeliveries: 0,
    },
    notes: "New customer. Credit check in progress.",
    createdAt: "2023-04-28",
  },
]

// Status badge component
function StatusBadge({ status }: { status: Customer["status"] }) {
  const statusConfig = {
    ACTIVE: { variant: "outline" as const, label: "Active" },
    INACTIVE: { variant: "secondary" as const, label: "Inactive" },
    PENDING: { variant: "default" as const, label: "Pending" },
  }

  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Customer Summary Card component
function CustomerSummaryCard({ customer }: { customer: Customer }) {
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

  // Determine if this customer has a late delivery problem
  const hasLateDeliveryIssue = customer.performance.onTimeDeliveryRate < 93

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{customer.name} Performance Summary</h3>
        {hasLateDeliveryIssue && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Late Delivery Alert
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Loads Completed</div>
            <div className="mt-1 text-2xl font-bold">{formatNumber(customer.performance.loadsCompleted)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(customer.performance.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Average RPM</div>
            <div className="mt-1 text-2xl font-bold">
              ${customer.performance.averageRPM > 0 ? customer.performance.averageRPM.toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className={cn(hasLateDeliveryIssue && "border-red-200 dark:border-red-900")}>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">On-Time Delivery Rate</div>
            <div
              className={cn(
                "mt-1 text-2xl font-bold",
                hasLateDeliveryIssue ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400",
              )}
            >
              {customer.performance.onTimeDeliveryRate > 0 ? customer.performance.onTimeDeliveryRate.toFixed(1) : "0.0"}
              %
            </div>
            {hasLateDeliveryIssue && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                {customer.performance.lateDeliveries} late deliveries
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Issue Percentage</div>
            <div
              className={cn(
                "mt-1 text-2xl font-bold",
                customer.performance.issuePercentage > 3
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400",
              )}
            >
              {customer.performance.issuePercentage > 0 ? customer.performance.issuePercentage.toFixed(1) : "0.0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium">On-Time Delivery Rate</div>
            <div className="text-sm font-medium">
              {customer.performance.onTimeDeliveryRate > 0 ? customer.performance.onTimeDeliveryRate.toFixed(1) : "0.0"}
              %
            </div>
          </div>
          <Progress
            value={customer.performance.onTimeDeliveryRate}
            className={cn(
              "h-2",
              hasLateDeliveryIssue
                ? "bg-red-100 dark:bg-red-950/50 [&>div]:bg-red-600 dark:[&>div]:bg-red-400"
                : "bg-green-100 dark:bg-green-950/50 [&>div]:bg-green-600 dark:[&>div]:bg-green-400",
            )}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button>
      </div>
    </div>
  )
}

// Quick Report Button component
function QuickReportButton({ customer }: { customer: Customer }) {
  const { toast } = useToast()

  const handleGenerateReport = (format: "csv" | "pdf") => {
    // In a real application, this would trigger an API call to generate the report
    toast({
      title: "Report generation started",
      description: `${format.toUpperCase()} report for ${customer.name} will be ready shortly.`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Report</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Generate Report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGenerateReport("csv")}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerateReport("pdf")}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download PDF</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View Full Analytics</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CustomersTable() {
  const [data, setData] = useState<Customer[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const { toast } = useToast()

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-muted-foreground">{customer.id}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="space-y-1">
            <div>{customer.contactName}</div>
            <div className="text-xs text-muted-foreground">{customer.contactEmail}</div>
            <div className="text-xs text-muted-foreground">{customer.contactPhone}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "performance",
      header: "Performance",
      cell: ({ row }) => {
        const customer = row.original
        const hasLateDeliveryIssue = customer.performance.onTimeDeliveryRate < 93

        return (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  View Summary
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px]" align="start">
                <CustomerSummaryCard customer={customer} />
              </PopoverContent>
            </Popover>
            {hasLateDeliveryIssue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Late Deliveries
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "loadsCompleted",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Loads
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        return <div className="font-medium">{customer.performance.loadsCompleted}</div>
      },
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Revenue
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(customer.performance.totalRevenue)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "onTimeRate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            On-Time %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        const onTimeRate = customer.performance.onTimeDeliveryRate
        const hasLateDeliveryIssue = onTimeRate < 93

        return (
          <div
            className={cn(
              "font-medium",
              hasLateDeliveryIssue ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400",
            )}
          >
            {onTimeRate > 0 ? onTimeRate.toFixed(1) : "0.0"}%
          </div>
        )
      },
    },
    {
      id: "report",
      cell: ({ row }) => {
        const customer = row.original
        return <QuickReportButton customer={customer} />
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customer.id)}>
                Copy customer ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Edit customer</DropdownMenuItem>
              <DropdownMenuItem>View loads</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Contact customer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply filters
  const filteredData = [...initialData].filter((customer) => {
    // Apply status filter
    if (statusFilter.length > 0 && !statusFilter.includes(customer.status)) {
      return false
    }

    // Apply global filter (search)
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase()
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.id.toLowerCase().includes(searchTerm) ||
        customer.contactName.toLowerCase().includes(searchTerm) ||
        customer.contactEmail.toLowerCase().includes(searchTerm) ||
        customer.contactPhone.toLowerCase().includes(searchTerm) ||
        false
      )
    }

    return true
  })

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search customers..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Status
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("ACTIVE")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "ACTIVE"] : prev.filter((s) => s !== "ACTIVE")))
                }}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("INACTIVE")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "INACTIVE"] : prev.filter((s) => s !== "INACTIVE")))
                }}
              >
                Inactive
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("PENDING")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "PENDING"] : prev.filter((s) => s !== "PENDING")))
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter([])} className="justify-center text-center">
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                View
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Table Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "name" ? "Customer" : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8 flex items-center gap-2">
            <Download className="h-3.5 w-3.5" />
            Export All
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    row.original.performance.onTimeDeliveryRate < 93 ? "bg-red-50/30 dark:bg-red-950/10" : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} customer(s) total
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
