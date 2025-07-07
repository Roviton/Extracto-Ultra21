"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the driver interface
interface Driver {
  id: string
  name: string
  avatar?: string
  status: "available" | "booked" | "out_of_service" | "on_vacation"
  location?: string
  lastDelivery?: string
  rating?: number
  phone?: string
  email?: string
}

type Load = {
  id: string
  load_number: string
  reference_number?: string
  customer?: any
  pickup_city?: string
  pickup_state?: string
  delivery_city?: string
  delivery_state?: string
  pickup_date: string
  delivery_date: string
  status: string
  driver?: {
    name: string
    avatar: string
  }
}

interface AssignDriverModalProps {
  isOpen: boolean
  onClose: () => void
  load: Load
  onAssign?: (loadId: string, driverId: string) => void
}

export function AssignDriverModal({ isOpen, onClose, load, onAssign }: AssignDriverModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [messageTab, setMessageTab] = useState<string>("ai-generated")
  const [messageText, setMessageText] = useState<string>("")
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<any>(null)
  const { toast } = useToast()

  // Fetch drivers and current assignment from the database
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      setLoading(true)
      try {
        console.log("Fetching drivers and current assignment...")

        // Fetch available drivers - only show drivers with "available" or "booked" status
        const { data: driversData, error: driversError } = await supabase
          .from("drivers")
          .select("*")
          .eq("is_active", true)
          .in("status", ["available", "booked"]) // Allow both available and booked drivers
          .order("name")

        if (driversError) {
          console.error("Error fetching drivers:", driversError)
          throw driversError
        }

        // Fetch current driver assignment for this load
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("load_drivers")
          .select(`
            *,
            driver:drivers(*)
          `)
          .eq("load_id", load.id)
          .eq("is_primary", true)
          .maybeSingle()

        if (assignmentError && assignmentError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error fetching current assignment:", assignmentError)
          throw assignmentError
        }

        console.log("Fetched data:", { drivers: driversData, assignment: assignmentData })

        if (driversData && driversData.length > 0) {
          setDrivers(
            driversData.map((driver) => ({
              id: driver.id,
              name: driver.name,
              avatar: driver.avatar_url || "/placeholder.svg",
              status: driver.status,
              location: driver.location || "Unknown",
              lastDelivery: driver.last_delivery || "N/A",
              rating: driver.rating || 4.5,
              phone: driver.phone,
              email: driver.email,
            })),
          )
        } else {
          console.log("No drivers found in database")
          setDrivers([])
        }

        // Set current assignment if exists
        setCurrentAssignment(assignmentData)
        if (assignmentData?.driver) {
          setSelectedDriver(assignmentData.driver.id)
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
        toast({
          title: "Error loading data",
          description: "Failed to load drivers and assignment information. Please try again.",
          variant: "destructive",
        })
        setDrivers([])
        setCurrentAssignment(null)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchData()

      // Generate default message
      const pickupDate = load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : "N/A"
      const deliveryDate = load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "N/A"
      const origin = load.pickup_city && load.pickup_state ? `${load.pickup_city}, ${load.pickup_state}` : "origin"
      const destination =
        load.delivery_city && load.delivery_state ? `${load.delivery_city}, ${load.delivery_state}` : "destination"

      setMessageText(
        `Hello, you have been assigned to load ${load.load_number || load.id} from ${origin} to ${destination}. Pickup is scheduled for ${pickupDate} and delivery for ${deliveryDate}. Please confirm if you accept this assignment.`,
      )
    }
  }, [isOpen, load, toast])

  const handleAssign = async () => {
    if (!selectedDriver) {
      toast({
        title: "Error",
        description: "Please select a driver",
        variant: "destructive",
      })
      return
    }

    // Check if this is the same driver already assigned
    if (currentAssignment?.driver?.id === selectedDriver) {
      toast({
        title: "No Change",
        description: "This driver is already assigned to this load",
      })
      return
    }

    setAssigning(true)
    try {
      console.log("Assigning driver:", { loadId: load.id, driverId: selectedDriver })

      // Call the onAssign callback if provided
      if (onAssign) {
        await onAssign(load.id, selectedDriver)

        // Send notification message (this would be implemented in a real system)
        console.log("Sending notification:", messageText)

        toast({
          title: "Driver Assigned",
          description: "Driver has been successfully assigned to this load.",
        })

        // Reset form and close modal
        setSelectedDriver("")
        setMessageText("")
        onClose()
      } else {
        // Fallback: direct database call (this should be avoided in favor of the hook)
        throw new Error("Assignment function not provided")
      }
    } catch (error: any) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign driver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const selectedDriverInfo = drivers.find((d) => d.id === selectedDriver)
  const isReassignment = currentAssignment && currentAssignment.driver

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isReassignment ? "Reassign Driver" : "Assign Driver"} to Load {load.load_number || load.id}
          </DialogTitle>
          <DialogDescription>
            {isReassignment
              ? `Currently assigned to ${currentAssignment.driver.name}. Select a new driver to reassign this load.`
              : `Select a driver to assign to this load from ${load.pickup_city || "origin"} to ${load.delivery_city || "destination"}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Current Assignment Alert */}
          {isReassignment && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This load is currently assigned to <strong>{currentAssignment.driver.name}</strong>. Selecting a new
                driver will reassign the load.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Load Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span> {load.customer?.name || "Unknown Customer"}
              </div>
              <div>
                <span className="text-muted-foreground">Reference:</span> {load.reference_number || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Origin:</span> {load.pickup_city || "N/A"},{" "}
                {load.pickup_state || ""}
              </div>
              <div>
                <span className="text-muted-foreground">Destination:</span> {load.delivery_city || "N/A"},{" "}
                {load.delivery_state || ""}
              </div>
              <div>
                <span className="text-muted-foreground">Pickup:</span>{" "}
                {load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Delivery:</span>{" "}
                {load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select Driver</h3>
            <Select value={selectedDriver} onValueChange={setSelectedDriver} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading drivers..." : "Select a driver"} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading drivers...
                    </div>
                  </SelectItem>
                ) : drivers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No drivers available
                  </SelectItem>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                          <AvatarFallback>
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{driver.name}</span>
                        <Badge variant={driver.status === "available" ? "outline" : "secondary"} className="ml-auto">
                          {driver.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedDriverInfo && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Driver Information</h3>
              <div className="rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedDriverInfo.avatar || "/placeholder.svg"} alt={selectedDriverInfo.name} />
                    <AvatarFallback>
                      {selectedDriverInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-medium">{selectedDriverInfo.name}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {selectedDriverInfo.phone && <p>Phone: {selectedDriverInfo.phone}</p>}
                      {selectedDriverInfo.email && <p>Email: {selectedDriverInfo.email}</p>}
                      <p>Location: {selectedDriverInfo.location || "Unknown"}</p>
                      <p>Last delivery: {selectedDriverInfo.lastDelivery || "N/A"}</p>
                      <p>Rating: {selectedDriverInfo.rating || "N/A"}/5.0</p>
                    </div>
                  </div>
                  <Badge variant={selectedDriverInfo.status === "available" ? "outline" : "secondary"}>
                    {selectedDriverInfo.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notification Message</h3>
            <Tabs defaultValue="ai-generated" value={messageTab} onValueChange={setMessageTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-generated">AI Generated</TabsTrigger>
                <TabsTrigger value="custom">Custom Message</TabsTrigger>
              </TabsList>
              <TabsContent value="ai-generated" className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  This message was automatically generated based on the load details. You can edit it if needed.
                </p>
                <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
              </TabsContent>
              <TabsContent value="custom" className="space-y-2">
                <p className="text-xs text-muted-foreground">Write a custom message to send to the driver.</p>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="Enter your custom message here..."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedDriver || loading || assigning}>
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isReassignment ? "Reassigning..." : "Assigning..."}
              </>
            ) : (
              <>{isReassignment ? "Reassign Driver" : "Assign & Notify"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
