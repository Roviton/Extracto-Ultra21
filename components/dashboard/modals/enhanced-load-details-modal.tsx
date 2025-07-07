"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusTimeline } from "@/components/dashboard/status-timeline"
import { MapPin, Package, Truck, FileText, User, Building, Phone, Mail } from "lucide-react"

interface EnhancedLoadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  load: any
}

export function EnhancedLoadDetailsModal({ isOpen, onClose, load }: EnhancedLoadDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!load) return null

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Format currency for display
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New", variant: "secondary" as const },
      assigned: { label: "Assigned", variant: "default" as const },
      accepted: { label: "Accepted", variant: "default" as const },
      refused: { label: "Refused", variant: "destructive" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Generate timeline steps based on load status
  const getTimelineSteps = () => {
    const now = new Date().toISOString()
    const steps = [
      {
        id: "created",
        title: "Load Created",
        description: "Load was created in the system",
        timestamp: load.created_at || now,
        status: "completed" as const,
      },
      {
        id: "assigned",
        title: "Driver Assigned",
        description:
          load.load_drivers?.length > 0
            ? `Driver ${load.load_drivers[0]?.driver?.name || "Unknown"} assigned`
            : "Waiting for driver assignment",
        timestamp: load.load_drivers?.length > 0 ? load.load_drivers[0]?.assigned_at || now : undefined,
        status: load.load_drivers?.length > 0 ? ("completed" as const) : ("pending" as const),
      },
      {
        id: "accepted",
        title: "Load Accepted",
        description: "Driver accepted the load",
        timestamp:
          load.status === "accepted" || load.status === "in_progress" || load.status === "completed" ? now : undefined,
        status:
          load.status === "accepted" || load.status === "in_progress" || load.status === "completed"
            ? ("completed" as const)
            : ("pending" as const),
      },
      {
        id: "in_transit",
        title: "In Transit",
        description: "Load is being transported",
        timestamp: load.status === "in_progress" || load.status === "completed" ? now : undefined,
        status:
          load.status === "in_progress"
            ? ("current" as const)
            : load.status === "completed"
              ? ("completed" as const)
              : ("pending" as const),
      },
      {
        id: "delivered",
        title: "Delivered",
        description: "Load has been delivered",
        timestamp: load.status === "completed" ? now : undefined,
        status: load.status === "completed" ? ("completed" as const) : ("pending" as const),
      },
    ]

    // Find the current step if none is marked as current
    if (!steps.some((step) => step.status === "current")) {
      // Find the first pending step and mark it as current
      const firstPendingIndex = steps.findIndex((step) => step.status === "pending")
      if (firstPendingIndex > 0) {
        steps[firstPendingIndex].status = "current"
      }
    }

    return steps
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Load Details: {load.load_number || `LOAD-${load.id?.slice(-6)}`}</span>
            {getStatusBadge(load.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Pickup Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="font-medium">Location</div>
                    <div>
                      {load.pickup_address || "N/A"}
                      <div>
                        {load.pickup_city || "N/A"}, {load.pickup_state || "N/A"} {load.pickup_zip || ""}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div>{formatDate(load.pickup_date)}</div>
                    <div className="text-sm text-muted-foreground">{load.pickup_time || "Time not specified"}</div>
                  </div>
                  {load.pickup_contact && (
                    <div>
                      <div className="font-medium">Contact</div>
                      <div>{load.pickup_contact}</div>
                      <div className="text-sm text-muted-foreground">{load.pickup_phone || "No phone provided"}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="font-medium">Location</div>
                    <div>
                      {load.delivery_address || "N/A"}
                      <div>
                        {load.delivery_city || "N/A"}, {load.delivery_state || "N/A"} {load.delivery_zip || ""}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div>{formatDate(load.delivery_date)}</div>
                    <div className="text-sm text-muted-foreground">{load.delivery_time || "Time not specified"}</div>
                  </div>
                  {load.delivery_contact && (
                    <div>
                      <div className="font-medium">Contact</div>
                      <div>{load.delivery_contact}</div>
                      <div className="text-sm text-muted-foreground">{load.delivery_phone || "No phone provided"}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Load Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Load Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm font-medium">Commodity</div>
                      <div>{load.commodity || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Equipment</div>
                      <div>{load.equipment_type || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Weight</div>
                      <div>{load.weight ? `${load.weight} lbs` : "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Pieces</div>
                      <div>{load.pieces || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Rate</div>
                      <div className="font-medium">{formatCurrency(load.rate)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Reference #</div>
                      <div>{load.reference_number || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Driver Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Driver Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {load.load_drivers && load.load_drivers.length > 0 ? (
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>{load.load_drivers[0]?.driver?.name?.charAt(0) || "D"}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-medium">{load.load_drivers[0]?.driver?.name || "Unknown Driver"}</div>
                        <div className="text-sm text-muted-foreground">
                          {load.load_drivers[0]?.driver?.phone || "No phone provided"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {load.load_drivers[0]?.driver?.email || "No email provided"}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {load.load_drivers[0]?.is_primary ? "Primary Driver" : "Secondary Driver"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No driver assigned</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Load Status Timeline</CardTitle>
                <CardDescription>Track the progress of this load</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusTimeline steps={getTimelineSteps()} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {load.customer ? (
                    <>
                      <div>
                        <div className="font-medium">Company</div>
                        <div>
                          {typeof load.customer === "string"
                            ? load.customer
                            : load.customer.name || load.customer.company_name || "Unknown Customer"}
                        </div>
                      </div>
                      {typeof load.customer === "object" && (
                        <>
                          {load.customer.contact_name && (
                            <div>
                              <div className="font-medium">Contact</div>
                              <div>{load.customer.contact_name}</div>
                            </div>
                          )}
                          <div className="flex space-x-4">
                            {load.customer.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{load.customer.phone}</span>
                              </div>
                            )}
                            {load.customer.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{load.customer.email}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground">No customer information available</div>
                  )}
                </CardContent>
              </Card>

              {/* Dispatcher Information */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Dispatcher Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {load.dispatcher ? (
                    <>
                      <div>
                        <div className="font-medium">Name</div>
                        <div>
                          {typeof load.dispatcher === "string"
                            ? load.dispatcher
                            : load.dispatcher.name || "Unknown Dispatcher"}
                        </div>
                      </div>
                      {typeof load.dispatcher === "object" && (
                        <>
                          <div className="flex space-x-4">
                            {load.dispatcher.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{load.dispatcher.phone}</span>
                              </div>
                            )}
                            {load.dispatcher.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{load.dispatcher.email}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground">No dispatcher information available</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Created At</div>
                    <div>{load.created_at ? new Date(load.created_at).toLocaleString() : "N/A"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Updated At</div>
                    <div>{load.updated_at ? new Date(load.updated_at).toLocaleString() : "N/A"}</div>
                  </div>
                </div>
                {load.notes && (
                  <div>
                    <div className="font-medium">Notes</div>
                    <div className="whitespace-pre-wrap">{load.notes}</div>
                  </div>
                )}
                {load.special_instructions && (
                  <div>
                    <div className="font-medium">Special Instructions</div>
                    <div className="whitespace-pre-wrap">{load.special_instructions}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Load Documents</CardTitle>
                <CardDescription>View and manage documents for this load</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2">No documents available for this load</p>
                  <p className="text-sm">Upload BOL, POD, and other documents</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
