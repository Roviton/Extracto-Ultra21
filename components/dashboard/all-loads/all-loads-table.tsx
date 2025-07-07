"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Filter, MessageSquare, MoreHorizontal, Search, FileText, Paperclip } from "lucide-react"
import { LoadCommentManager } from "../load-comment-manager"
import { useAuth } from "@/contexts/auth-context"
import { LoadDetailsDialog } from "../modals/load-details-dialog"

// Mock data for demonstration
const mockLoads = [
  {
    id: "LD-1001",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    pickupDate: "2023-05-15",
    deliveryDate: "2023-05-16",
    status: "New",
    rate: "$1,850",
    dispatcher: "John Smith",
    comments: "",
  },
  {
    id: "LD-1002",
    origin: "Atlanta, GA",
    destination: "Nashville, TN",
    pickupDate: "2023-05-16",
    deliveryDate: "2023-05-17",
    status: "Assigned",
    rate: "$1,650",
    dispatcher: "Sarah Johnson",
    comments: "Rate is below market average. Accepted due to regular customer relationship.",
  },
  {
    id: "LD-1003",
    origin: "Dallas, TX",
    destination: "Houston, TX",
    pickupDate: "2023-05-17",
    deliveryDate: "2023-05-17",
    status: "In Progress",
    rate: "$950",
    dispatcher: "Mike Davis",
    comments: "",
  },
  {
    id: "LD-1004",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickupDate: "2023-05-18",
    deliveryDate: "2023-05-19",
    status: "Completed",
    rate: "$2,100",
    dispatcher: "John Smith",
    comments: "Driver reported delay at pickup. Consider time buffer for future loads with this shipper.",
  },
  {
    id: "LD-1005",
    origin: "Miami, FL",
    destination: "Orlando, FL",
    pickupDate: "2023-05-19",
    deliveryDate: "2023-05-19",
    status: "Cancelled",
    rate: "$850",
    dispatcher: "Sarah Johnson",
    comments: "Broker cancelled due to scheduling conflict. No penalty applied.",
  },
  {
    id: "LD-1006",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    pickupDate: "2023-05-20",
    deliveryDate: "2023-05-20",
    status: "New",
    rate: "$1,200",
    dispatcher: "Mike Davis",
    comments: "",
  },
  {
    id: "LD-1007",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickupDate: "2023-05-21",
    deliveryDate: "2023-05-22",
    status: "Assigned",
    rate: "$1,750",
    dispatcher: "John Smith",
    comments: "High-priority customer. Ensure timely delivery.",
  },
  {
    id: "LD-1008",
    origin: "Boston, MA",
    destination: "New York, NY",
    pickupDate: "2023-05-22",
    deliveryDate: "2023-05-22",
    status: "Accepted",
    rate: "$1,100",
    dispatcher: "Sarah Johnson",
    comments: "",
  },
]

export function AllLoadsTable() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loads, setLoads] = useState(mockLoads)
  const { user } = useAuth()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<any>(null)

  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin"

  const filteredLoads = (loads || []).filter((load) => {
    // Filter by tab
    if (activeTab !== "all" && load?.status?.toLowerCase() !== activeTab.toLowerCase()) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        load?.id?.toLowerCase().includes(query) ||
        load?.origin?.toLowerCase().includes(query) ||
        load?.destination?.toLowerCase().includes(query) ||
        load?.dispatcher?.toLowerCase().includes(query)
      )
    }

    return true
  })

  const handleCommentUpdate = (loadId: string, comment: string) => {
    setLoads(loads.map((load) => (load.id === loadId ? { ...load, comments: comment } : load)))
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            New
          </Badge>
        )
      case "assigned":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Assigned
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Accepted
          </Badge>
        )
      case "in progress":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewDetails = (load: any) => {
    setSelectedLoad(load)
    setIsDetailsModalOpen(true)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Loads</CardTitle>
            <CardDescription>View and manage loads across all dispatchers</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search loads..."
                className="w-full pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter by dispatcher</DropdownMenuItem>
                <DropdownMenuItem>Filter by date range</DropdownMenuItem>
                <DropdownMenuItem>Filter by rate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Loads</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="in progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="m-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Dispatcher</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No loads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoads.map((load) => (
                      <>
                        <TableRow
                          key={load.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedLoad(selectedLoad?.id === load.id ? null : load)
                          }}
                        >
                          <TableCell className="font-medium">{load.id}</TableCell>
                          <TableCell>{load.origin}</TableCell>
                          <TableCell>{load.destination}</TableCell>
                          <TableCell>{load.pickupDate}</TableCell>
                          <TableCell>{getStatusBadge(load.status)}</TableCell>
                          <TableCell>{load.rate}</TableCell>
                          <TableCell>{load.dispatcher}</TableCell>
                          <TableCell>
                            {isManagerOrAdmin ? (
                              <LoadCommentManager
                                loadId={load.id}
                                comment={load.comments}
                                onCommentUpdate={(comment) => handleCommentUpdate(load.id, comment)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : load.comments ? (
                              <div className="flex items-center gap-1 text-sm">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="line-clamp-1">{load.comments}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No comments</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    handleViewDetails(load)
                                  }}
                                >
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem>View history</DropdownMenuItem>
                                <DropdownMenuItem>Contact dispatcher</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {selectedLoad?.id === load.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              <div className="border-t bg-muted/30 p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {/* Left side - Rate Confirmation Preview */}
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                                        <Badge variant="outline" className="ml-2">
                                          {load.rate}
                                        </Badge>
                                      </div>
                                      <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-md border bg-white">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="flex flex-col items-center justify-center text-center">
                                            <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm font-medium">Rate Confirmation PDF</p>
                                            <p className="text-xs text-muted-foreground">
                                              {load.id} - {load.dispatcher}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex justify-end">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                          <Paperclip className="h-3 w-3" />
                                          <span>rate-confirmation-{load.id.toLowerCase()}.pdf</span>
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Right side - Load Details */}
                                  <Card>
                                    <CardContent className="p-4">
                                      <Tabs defaultValue="details">
                                        {user?.role === "admin" ? (
                                          // For admin users, show only the Load Details tab without tabs UI
                                          <div className="mb-4">
                                            <h3 className="text-lg font-semibold">Load Details</h3>
                                          </div>
                                        ) : (
                                          // For non-admin users, show all tabs
                                          <TabsList className="w-full">
                                            <TabsTrigger value="details" className="flex-1">
                                              Load Details
                                            </TabsTrigger>
                                            <TabsTrigger value="communication" className="flex-1">
                                              Communication
                                            </TabsTrigger>
                                            <TabsTrigger value="updates" className="flex-1">
                                              Broker Updates
                                            </TabsTrigger>
                                          </TabsList>
                                        )}
                                        {user?.role === "admin" ? (
                                          // For admin users, show only the details content without TabsContent wrapper
                                          <div className="pt-4">
                                            {/* Load details content here - keep the existing content */}
                                            <div className="grid grid-cols-1 gap-y-4 text-sm md:grid-cols-2 md:gap-x-6">
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Load ID / Reference:
                                                </div>
                                                <div>{load.id} / REF-12345</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Broker/Customer:
                                                </div>
                                                <div>Acme Logistics</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Origin Name & Address:
                                                </div>
                                                <div>ABC Warehouse</div>
                                                <div>123 Shipping Lane, {load.origin}</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Shipper Contact:
                                                </div>
                                                <div>John Smith • 555-123-4567</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Pickup Date & Time:
                                                </div>
                                                <div>{load.pickupDate} 14:00-16:00</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Pickup Number (PU#):
                                                </div>
                                                <div>PU12345</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Destination Name & Address:
                                                </div>
                                                <div>XYZ Distribution Center</div>
                                                <div>456 Receiving Blvd, {load.destination}</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Consignee Contact:
                                                </div>
                                                <div>Jane Doe • 555-987-6543</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Delivery Date & Time:
                                                </div>
                                                <div>{load.deliveryDate} 09:00-11:00</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Delivery Number (DEL#):
                                                </div>
                                                <div>DEL67890</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Weight:
                                                </div>
                                                <div>42,000 lbs</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Commodity:
                                                </div>
                                                <div>General Freight</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Dimensions:
                                                </div>
                                                <div>48" x 40" x 60"</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Quantity:
                                                </div>
                                                <div>12 pallets</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Rate:
                                                </div>
                                                <div>{load.rate}</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Equipment Type:
                                                </div>
                                                <div>Dry Van</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  RPM:
                                                </div>
                                                <div>$3.20/mi</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Distance:
                                                </div>
                                                <div>370 miles</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Broker Contact:
                                                </div>
                                                <div>Mike Johnson • 555-789-0123 • mike@acmelogistics.com</div>
                                              </div>
                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Status:
                                                </div>
                                                <div>{load.status}</div>
                                              </div>

                                              <div>
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Booked By:
                                                </div>
                                                <div>{load.dispatcher}</div>
                                              </div>
                                            </div>

                                            <div className="mt-4">
                                              <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                Special Instructions / Notes:
                                              </div>
                                              <div className="whitespace-pre-line">
                                                - Driver must check in at security gate - Lumper fee to be paid by
                                                carrier (reimbursable with receipt) - Hard hat and safety vest required
                                                - Call consignee 1 hour before arrival
                                              </div>
                                            </div>

                                            <div className="mt-4">
                                              <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                Manager Comments:
                                              </div>
                                              <div className="whitespace-pre-line">
                                                {load.comments || "No manager comments"}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          // For non-admin users, show all tabs content
                                          <>
                                            <TabsContent value="details" className="pt-4">
                                              {/* ... existing load details content ... */}
                                              <div className="grid grid-cols-1 gap-y-4 text-sm md:grid-cols-2 md:gap-x-6">
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Load ID / Reference:
                                                  </div>
                                                  <div>{load.id} / REF-12345</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Broker/Customer:
                                                  </div>
                                                  <div>Acme Logistics</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Origin Name & Address:
                                                  </div>
                                                  <div>ABC Warehouse</div>
                                                  <div>123 Shipping Lane, {load.origin}</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Shipper Contact:
                                                  </div>
                                                  <div>John Smith • 555-123-4567</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Pickup Date & Time:
                                                  </div>
                                                  <div>{load.pickupDate} 14:00-16:00</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Pickup Number (PU#):
                                                  </div>
                                                  <div>PU12345</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Destination Name & Address:
                                                  </div>
                                                  <div>XYZ Distribution Center</div>
                                                  <div>456 Receiving Blvd, {load.destination}</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Consignee Contact:
                                                  </div>
                                                  <div>Jane Doe • 555-987-6543</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Delivery Date & Time:
                                                  </div>
                                                  <div>{load.deliveryDate} 09:00-11:00</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Delivery Number (DEL#):
                                                  </div>
                                                  <div>DEL67890</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Weight:
                                                  </div>
                                                  <div>42,000 lbs</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Commodity:
                                                  </div>
                                                  <div>General Freight</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Dimensions:
                                                  </div>
                                                  <div>48" x 40" x 60"</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Quantity:
                                                  </div>
                                                  <div>12 pallets</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Rate:
                                                  </div>
                                                  <div>{load.rate}</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Equipment Type:
                                                  </div>
                                                  <div>Dry Van</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    RPM:
                                                  </div>
                                                  <div>$3.20/mi</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Distance:
                                                  </div>
                                                  <div>370 miles</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Broker Contact:
                                                  </div>
                                                  <div>Mike Johnson • 555-789-0123 • mike@acmelogistics.com</div>
                                                </div>
                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Status:
                                                  </div>
                                                  <div>{load.status}</div>
                                                </div>

                                                <div>
                                                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                    Booked By:
                                                  </div>
                                                  <div>{load.dispatcher}</div>
                                                </div>
                                              </div>

                                              <div className="mt-4">
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Special Instructions / Notes:
                                                </div>
                                                <div className="whitespace-pre-line">
                                                  - Driver must check in at security gate - Lumper fee to be paid by
                                                  carrier (reimbursable with receipt) - Hard hat and safety vest
                                                  required - Call consignee 1 hour before arrival
                                                </div>
                                              </div>

                                              <div className="mt-4">
                                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                                  Manager Comments:
                                                </div>
                                                <div className="whitespace-pre-line">
                                                  {load.comments || "No manager comments"}
                                                </div>
                                              </div>
                                            </TabsContent>
                                            <TabsContent value="communication" className="pt-4">
                                              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                                Communication history will appear here
                                              </div>
                                            </TabsContent>
                                            <TabsContent value="updates" className="pt-4">
                                              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                                Broker updates will appear here
                                              </div>
                                            </TabsContent>
                                          </>
                                        )}
                                      </Tabs>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {selectedLoad && (
        <LoadDetailsDialog
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          load={selectedLoad}
        />
      )}
    </Card>
  )
}
