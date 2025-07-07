"use client"

import { useState, useEffect, useMemo } from "react"
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
import { ArrowUpDown, ChevronDown, Filter, MoreHorizontal, Phone, Eye, Trash2 } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getDrivers, updateDriverStatus, deleteDriver } from "@/actions/driver-actions"
import { DriverProfileModal } from "./driver-profile-modal"

// Simplified Driver type for MVP
export type Driver = {
  id: string
  name: string
  email?: string
  phone?: string
  status: "available" | "booked" | "out_of_service" | "on_vacation"
  license_number?: string
  equipment_type?: string
  notes?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  is_active: boolean
}

// Status badge component
function StatusBadge({ status }: { status: Driver["status"] }) {
  const statusConfig = {
    available: {
      variant: "outline" as const,
      label: "Available",
      className: "border-green-500 text-green-700 bg-green-50",
    },
    booked: { variant: "default" as const, label: "Booked", className: "bg-blue-500 text-white" },
    out_of_service: { variant: "secondary" as const, label: "Out of Service", className: "bg-red-500 text-white" },
    on_vacation: { variant: "secondary" as const, label: "On Vacation", className: "bg-yellow-500 text-white" },
  }

  const config = statusConfig[status] || statusConfig.out_of_service

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export function DriversTable() {
  const [data, setData] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { toast } = useToast()

  // Load drivers data
  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const result = await getDrivers()
      if (result.success) {
        setData(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error loading drivers:", error)
      setData([])
      toast({
        title: "Error loading drivers",
        description: error.message || "Failed to load drivers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (driverId: string, newStatus: string) => {
    try {
      const result = await updateDriverStatus(driverId, newStatus)
      if (result.success) {
        await loadDrivers()
        toast({
          title: "Status updated",
          description: "Driver status has been updated successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle driver deletion
  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deleteDriver(driverId)
      if (result.success) {
        await loadDrivers()
        toast({
          title: "Driver deleted",
          description: "Driver has been removed from your fleet",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error deleting driver",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Driver
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const driver = row.original
        const initials = driver.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={driver.avatar_url || "/placeholder.svg"} alt={driver.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{driver.name}</div>
              <div className="text-xs text-muted-foreground">{driver.id.slice(0, 8)}</div>
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
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="space-y-1">
            {driver.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{driver.phone}</span>
              </div>
            )}
            {driver.email && <div className="text-xs text-muted-foreground">{driver.email}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "equipment_type",
      header: "Equipment",
      cell: ({ row }) => {
        const equipmentType = row.getValue("equipment_type") as string
        return <Badge variant="outline">{equipmentType || "Not specified"}</Badge>
      },
    },
    {
      accessorKey: "license_number",
      header: "License",
      cell: ({ row }) => {
        const license = row.getValue("license_number") as string
        return <span className="text-sm font-mono">{license || "Not provided"}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original

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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDriverId(driver.id)
                  setShowProfileModal(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver.id)}>
                Copy driver ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusUpdate(driver.id, "available")}>
                Set Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(driver.id, "booked")}>Set Booked</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(driver.id, "out_of_service")}>
                Set Out of Service
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteDriver(driver.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Driver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply filters
  const filteredData = useMemo(() => {
    return (data || []).filter((driver) => {
      // Apply status filter
      if (statusFilter && statusFilter.length > 0 && !statusFilter.includes(driver.status)) {
        return false
      }

      // Apply global filter (search)
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase()
        return (
          driver.name?.toLowerCase().includes(searchTerm) ||
          driver.id?.toLowerCase().includes(searchTerm) ||
          driver.email?.toLowerCase().includes(searchTerm) ||
          driver.phone?.toLowerCase().includes(searchTerm) ||
          driver.license_number?.toLowerCase().includes(searchTerm) ||
          false
        )
      }

      return true
    })
  }, [data, statusFilter, globalFilter])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search drivers..."
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
                checked={statusFilter.includes("available")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "available"] : prev.filter((s) => s !== "available")))
                }}
              >
                Available
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("booked")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "booked"] : prev.filter((s) => s !== "booked")))
                }}
              >
                Booked
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("out_of_service")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) =>
                    checked ? [...prev, "out_of_service"] : prev.filter((s) => s !== "out_of_service"),
                  )
                }}
              >
                Out of Service
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("on_vacation")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) =>
                    checked ? [...prev, "on_vacation"] : prev.filter((s) => s !== "on_vacation"),
                  )
                }}
              >
                On Vacation
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
                      {column.id === "name" ? "Driver" : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No drivers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} driver(s) total
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

      {/* Driver Profile Modal */}
      <DriverProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedDriverId(null)
        }}
        driverId={selectedDriverId}
      />
    </div>
  )
}
