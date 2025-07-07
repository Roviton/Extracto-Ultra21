"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, UserPlus, MessageSquare, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"
import { NewLoadModal } from "@/components/dashboard/modals/new-load-modal"

// Enhanced Load type with RPM-related fields and comments
export type Load = {
  id: string
  reference: string
  customer: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: "NEW" | "ASSIGNED" | "ACCEPTED" | "REFUSED" | "IN_PROGRESS" | "COMPLETED"
  driver?: {
    name: string
    avatar: string
  }
  timeline?: {
    arrivedPickup?: string
    departedPickup?: string
    arrivedDelivery?: string
    delivered?: string
  }
  rate?: string
  distance?: number // Miles
  rpm?: number // Revenue Per Mile
  weight?: string
  commodity?: string
  equipment?: string
  notes?: string
  comments?: string // Manager feedback
  createdAt?: string
  isHighlighted?: boolean
}

// Sample data with RPM and distance information
const initialData: Load[] = [
  {
    id: "L-1001",
    reference: "REF-12345",
    customer: "Acme Logistics",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-17",
    status: "NEW",
    rate: "$1,850",
    distance: 370,
    rpm: 5.0,
    createdAt: "2025-05-14T14:30:00",
  },
  {
    id: "L-1002",
    reference: "REF-23456",
    customer: "Global Transport Inc.",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-16",
    status: "ASSIGNED",
    driver: {
      name: "John Smith",
      avatar: "/javascript-code.png",
    },
    rate: "$950",
    distance: 180,
    rpm: 5.28,
    comments: "Driver requested early pickup",
    createdAt: "2025-05-14T12:15:00",
  },
  {
    id: "L-1003",
    reference: "REF-34567",
    customer: "FastFreight Co.",
    origin: "Dallas, TX",
    destination: "Houston, TX",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-15",
    status: "ACCEPTED",
    driver: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
    },
    timeline: {
      arrivedPickup: "2025-05-15T08:30:00",
    },
    rate: "$750",
    distance: 240,
    rpm: 3.13,
    comments: "Waiting on POD",
    createdAt: "2025-05-14T10:45:00",
  },
  {
    id: "L-1004",
    reference: "REF-45678",
    customer: "Prime Shipping LLC",
    origin: "Miami, FL",
    destination: "Orlando, FL",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-16",
    status: "IN_PROGRESS",
    driver: {
      name: "Mike Williams",
      avatar: "/intertwined-letters.png",
    },
    timeline: {
      arrivedPickup: "2025-05-15T09:15:00",
      departedPickup: "2025-05-15T10:30:00",
    },
    rate: "$650",
    distance: 235,
    rpm: 2.77,
    createdAt: "2025-05-14T09:20:00",
  },
  {
    id: "L-1005",
    reference: "REF-56789",
    customer: "Acme Logistics",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    pickupDate: "2025-05-14",
    deliveryDate: "2025-05-15",
    status: "COMPLETED",
    driver: {
      name: "Tom Davis",
      avatar: "/abstract-geometric-TD.png",
    },
    timeline: {
      arrivedPickup: "2025-05-14T08:00:00",
      departedPickup: "2025-05-14T09:30:00",
      arrivedDelivery: "2025-05-15T11:00:00",
      delivered: "2025-05-15T11:45:00",
    },
    rate: "$580",
    distance: 174,
    rpm: 3.33,
    comments: "POD received, invoice sent",
    createdAt: "2025-05-13T16:30:00",
  },
  {
    id: "L-1006",
    reference: "REF-67890",
    customer: "Global Transport Inc.",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-16",
    status: "REFUSED",
    driver: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
    },
    rate: "$1,100",
    distance: 525,
    rpm: 2.1,
    comments: "Driver refused due to maintenance issues",
    createdAt: "2025-05-13T14:10:00",
  },
  {
    id: "L-1007",
    reference: "REF-78901",
    customer: "FastFreight Co.",
    origin: "San Francisco, CA",
    destination: "San Diego, CA",
    pickupDate: "2025-05-17",
    deliveryDate: "2025-05-18",
    status: "NEW",
    rate: "$1,250",
    distance: 500,
    rpm: 2.5,
    createdAt: "2025-05-15T09:45:00",
  },
  {
    id: "L-1008",
    reference: "REF-89012",
    customer: "Prime Shipping LLC",
    origin: "Boston, MA",
    destination: "New York, NY",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-16",
    status: "NEW",
    rate: "$650",
    distance: 215,
    rpm: 3.02,
    createdAt: "2025-05-15T11:20:00",
  },
  {
    id: "L-1009",
    reference: "REF-90123",
    customer: "Acme Logistics",
    origin: "Atlanta, GA",
    destination: "Nashville, TN",
    pickupDate: "2025-05-17",
    deliveryDate: "2025-05-18",
    status: "ASSIGNED",
    driver: {
      name: "Mike Williams",
      avatar: "/intertwined-letters.png",
    },
    rate: "$780",
    distance: 250,
    rpm: 3.12,
    createdAt: "2025-05-15T13:10:00",
  },
  {
    id: "L-1010",
    reference: "REF-01234",
    customer: "Global Transport Inc.",
    origin: "Detroit, MI",
    destination: "Cleveland, OH",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-17",
    status: "NEW",
    rate: "$520",
    distance: 170,
    rpm: 3.06,
    createdAt: "2025-05-15T14:30:00",
  },
]

// Status badge component
function StatusBadge({ status }: { status: Load["status"] }) {
  const statusConfig = {
    NEW: { variant: "outline" as const, label: "New" },
    ASSIGNED: { variant: "secondary" as const, label: "Assigned" },
    ACCEPTED: { variant: "default" as const, label: "Accepted" },
    REFUSED: { variant: "destructive" as const, label: "Refused" },
    IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
    COMPLETED: { variant: "success" as const, label: "Completed" },
  }

  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}

// RPM Indicator component
function RpmIndicator({ rpm }: { rpm: number | undefined }) {
  if (rpm === undefined) return <span className="text-muted-foreground">N/A</span>

  let color = "text-green-600 dark:text-green-400"
  if (rpm < 2.0) {
    color = "text-red-600 dark:text-red-400"
  } else if (rpm < 3.0) {
    color = "text-amber-600 dark:text-amber-400"
  }

  return (
    <div className="flex items-center">
      <span className={`font-medium ${color}`}>${rpm.toFixed(2)}</span>
      <span className="ml-1 text-xs text-muted-foreground">/mi</span>
    </div>
  )
}

// Inline Editable Comment component
function InlineEditableComment({
  initialValue,
  loadId,
  onSave,
  readOnly = false,
}: {
  initialValue?: string
  loadId: string
  onSave: (loadId: string, comment: string) => void
  readOnly?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onSave(loadId, value)
    setIsEditing(false)
    toast({
      title: "Comment saved",
      description: "Your comment has been saved successfully",
    })
  }

  if (readOnly) {
    return (
      <div className="rounded-md p-2 text-sm">
        {value ? value : <span className="text-muted-foreground italic">No comments</span>}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[80px] w-full text-sm"
          placeholder="Add a comment..."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="cursor-pointer rounded-md p-2 text-sm hover:bg-muted/50" onClick={() => setIsEditing(true)}>
      {value ? value : <span className="text-muted-foreground italic">Add comment...</span>}
    </div>
  )
}

interface LoadsTableProps {
  isDispatcherView?: boolean
}

export function LoadsTable({ isDispatcherView = false }: LoadsTableProps) {
  const [showNewLoadModal, setShowNewLoadModal] = useState(false)
  const loadsTableRef = useRef<{ addNewLoad: (loadData: Omit<Load, "id" | "status" | "createdAt">) => Load }>(null)

  const handleNewLoad = (loadData: Omit<Load, "id" | "status" | "createdAt">) => {
    if (loadsTableRef.current) {
      const newLoad = loadsTableRef.current.addNewLoad(loadData)
      setShowNewLoadModal(false)
      return newLoad
    }
  }
  const [data, setData] = useState<Load[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide financial columns for dispatchers
    ...(isDispatcherView && { rate: false }),
  })
  const [rowSelection, setRowSelection] = useState({})
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [customerFilter, setCustomerFilter] = useState<string[]>([])
  const [driverFilter, setDriverFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({})

  // Get unique customers for filtering
  const uniqueCustomers = Array.from(new Set(data.map((load) => load.customer)))

  // Get unique drivers for filtering
  const uniqueDrivers = Array.from(new Set(data.filter((load) => load.driver).map((load) => load.driver?.name)))

  // Handle comment save
  const handleCommentSave = (loadId: string, comment: string) => {
    setData((prevData) => prevData.map((load) => (load.id === loadId ? { ...load, comments: comment } : load)))
  }

  // Define quick filters
  const quickFilters = [
    {
      name: "Unassigned Loads",
      filter: () => {
        setStatusFilter(["NEW"])
      },
    },
    {
      name: "Delayed Loads",
      filter: () => {
        // This is a simplified example - in a real app, you'd compare dates
        setStatusFilter(["IN_PROGRESS"])
      },
    },
    {
      name: "Today's Pickups",
      filter: () => {
        const today = new Date()
        setDateRange({
          from: today,
          to: today,
        })
      },
    },
    {
      name: "All Active Loads",
      filter: () => {
        setStatusFilter(["NEW", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"])
      },
    },
  ]

  const columns: ColumnDef<Load>[] = [
    {
      accessorKey: "id",
      header: "Load ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "reference",
      header: "Reference",
    },
    {
      accessorKey: "customer",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "origin",
      header: "Origin",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "pickupDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Pickup
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("pickupDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery",
      cell: ({ row }) => {
        const date = new Date(row.getValue("deliveryDate"))
        return <div>{date.toLocaleDateString()}</div>
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
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original.driver

        if (!driver) {
          return (
            <PermissionGuard
              permission="assign:drivers"
              fallback={<span className="text-muted-foreground">Not assigned</span>}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  setSelectedLoad(row.original)
                  setShowAssignModal(true)
                }}
              >
                <UserPlus className="mr-2 h-3.5 w-3.5" />
                Assign
              </Button>
            </PermissionGuard>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
              <AvatarFallback>
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span>{driver.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => <div>{row.getValue("rate") || "N/A"}</div>,
    },
    {
      accessorKey: "distance",
      header: "Distance",
      cell: ({ row }) => {
        const distance = row.getValue("distance") as number | undefined
        return <div>{distance ? `${distance} mi` : "N/A"}</div>
      },
    },
    {
      accessorKey: "rpm",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            RPM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <RpmIndicator rpm={row.getValue("rpm")} />,
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: ({ row }) => (
        <InlineEditableComment
          initialValue={row.original.comments}
          loadId={row.original.id}
          onSave={handleCommentSave}
          readOnly={!isDispatcherView && row.original.status === "COMPLETED"}
        />
      ),
    },
    {
      id: "notify",
      header: "Notify",
      cell: ({ row }) => {
        const driver = row.original.driver

        if (!driver) return null

        return (
          <PermissionGuard permission="message:drivers">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setSelectedLoad(row.original)
                setShowNotifyModal(true)
              }}
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              Message
            </Button>
          </PermissionGuard>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const load = row.original

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
                  setSelectedLoad(load)
                  setShowDetailsModal(true)
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {load.status === "NEW" && (
                <PermissionGuard permission="assign:drivers">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedLoad(load)
                      setShowAssignModal(true)
                    }}
                  >
                    Assign driver
                  </DropdownMenuItem>
                </PermissionGuard>
              )}
              {load.status === "ASSIGNED" && (
                <PermissionGuard permission="message:drivers">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedLoad(load)
                      setShowNotifyModal(true)
                    }}
                  >
                    Send reminder
                  </DropdownMenuItem>
                </PermissionGuard>
              )}
              {(load.status === "ACCEPTED" || load.status === "IN_PROGRESS") && (
                <PermissionGuard permission="message:drivers">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedLoad(load)
                      setShowNotifyModal(true)
                    }}
                  >
                    Contact driver
                  </DropdownMenuItem>
                </PermissionGuard>
              )}
              {load.status === "REFUSED" && (
                <PermissionGuard permission="assign:drivers">
                  <DropdownMenuItem>Reassign load</DropdownMenuItem>
                </PermissionGuard>
              )}
              <PermissionGuard permission="edit:loads">
                <DropdownMenuItem>Edit load</DropdownMenuItem>
              </PermissionGuard>
              <DropdownMenuSeparator />
              <PermissionGuard
                permission="view:financial"
                fallback={<DropdownMenuItem>Export details</DropdownMenuItem>}
              >
                <DropdownMenuItem>Export details</DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply filters
  const filteredData = useMemo(() => {
    return (data || []).filter((load) => {
      // Apply status filter
      if (statusFilter && statusFilter.length > 0 && !statusFilter.includes(load.status)) {
        return false
      }

      // Apply customer filter
      if (customerFilter && customerFilter.length > 0 && !customerFilter.includes(load.customer)) {
        return false
      }

      // Apply driver filter
      if (driverFilter && driverFilter.length > 0 && load.driver && !driverFilter.includes(load.driver.name)) {
        return false
      }

      // Apply date range filter
      if (dateRange?.from) {
        const pickupDate = new Date(load.pickupDate)
        if (pickupDate < dateRange.from) return false
      }

      if (dateRange?.to) {
        const pickupDate = new Date(load.pickupDate)
        if (pickupDate > dateRange.to) return false
      }

      // Apply global filter (search)
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase()
        return (
          load.id?.toLowerCase().includes(searchTerm) ||
          load.reference?.toLowerCase().includes(searchTerm) ||
          load.customer?.toLowerCase().includes(searchTerm) ||
          load.origin?.toLowerCase().includes(searchTerm) ||
          load.destination?.toLowerCase().includes(searchTerm) ||
          load.driver?.name?.toLowerCase().includes(searchTerm) ||
          false
        )
      }

      return true
    })
  }, [data, statusFilter, customerFilter, driverFilter, dateRange, globalFilter])

  useEffect(() => {
    setData(filteredData)
  }, [filteredData])

  const table = useReactTable({
    data,
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
      <div className="flex justify-between">
        {isDispatcherView && (
          <Button onClick={() => setShowNewLoadModal(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Load
          </Button>
        )}
      </div>

      <LoadsDataTable ref={loadsTableRef} isHistoryView={true} />

      <NewLoadModal isOpen={showNewLoadModal} onClose={() => setShowNewLoadModal(false)} onSubmit={handleNewLoad} />
    </div>
  )
}
