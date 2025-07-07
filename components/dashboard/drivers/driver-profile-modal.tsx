"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getDriverById, updateDriver, type DriverUpdateInput } from "@/actions/driver-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Truck, Phone, Mail, MapPin, User, CreditCard } from "lucide-react"

interface DriverProfileModalProps {
  isOpen: boolean
  onClose: () => void
  driverId: string | null
}

interface DriverData {
  id: string
  name: string
  email?: string
  phone?: string
  license_number?: string
  notes?: string
  status: string
  avatar_url?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  driver_type?: string
  license_state?: string
  license_expiry?: string
  license_type?: string
  equipment_preferences?: string[]
  fuel_card_number?: string
  truck_number?: string
  trailer_number?: string
  rating?: number
  location?: string
  company_id?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export function DriverProfileModal({ isOpen, onClose, driverId }: DriverProfileModalProps) {
  const [driver, setDriver] = useState<DriverData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<DriverUpdateInput>({} as DriverUpdateInput)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && driverId) {
      loadDriverData()
    } else if (!isOpen) {
      // Reset state when modal closes
      setDriver(null)
      setEditData({} as DriverUpdateInput)
      setIsEditing(false)
    }
  }, [isOpen, driverId])

  const loadDriverData = async () => {
    if (!driverId) return

    setIsLoading(true)
    try {
      console.log("Loading driver data for ID:", driverId)
      const driverData = await getDriverById(driverId)
      console.log("Received driver data:", driverData)

      if (driverData) {
        setDriver(driverData)
        // Set up comprehensive edit data
        const nameParts = (driverData.name || "").split(" ")
        setEditData({
          id: driverData.id,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          email: driverData.email || "",
          phone: driverData.phone || "",
          date_of_birth: driverData.date_of_birth || "",
          address_line_1: driverData.address_line_1 || "",
          address_line_2: driverData.address_line_2 || "",
          city: driverData.city || "",
          state: driverData.state || "",
          zip_code: driverData.zip_code || "",
          emergency_contact_name: driverData.emergency_contact_name || "",
          emergency_contact_phone: driverData.emergency_contact_phone || "",
          hire_date: driverData.hire_date || "",
          driver_type: (driverData.driver_type as "company" | "owner_operator" | "lease_operator") || "company",
          license_number: driverData.license_number || "",
          license_state: driverData.license_state || "",
          license_expiry: driverData.license_expiry || "",
          license_type: driverData.license_type || "",
          truck_number: driverData.truck_number || "",
          trailer_number: driverData.trailer_number || "",
          fuel_card_number: driverData.fuel_card_number || "",
          equipment_preferences: driverData.equipment_preferences || [],
          notes: driverData.notes || "",
          location: driverData.location || "",
          rating: driverData.rating || 0,
        })
      }
    } catch (error: any) {
      console.error("Error loading driver:", error)
      toast({
        title: "Error loading driver",
        description: error.message || "Failed to load driver data",
        variant: "destructive",
      })
      onClose() // Close modal on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editData.id) return

    setIsLoading(true)
    try {
      console.log("Saving driver data:", editData)
      await updateDriver(editData)
      await loadDriverData() // Reload data
      setIsEditing(false)
      toast({
        title: "Driver updated",
        description: "Driver information has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error saving driver:", error)
      toast({
        title: "Error updating driver",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof DriverUpdateInput, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: "outline" as const, label: "Available", color: "text-green-600" },
      booked: { variant: "default" as const, label: "Booked", color: "text-blue-600" },
      out_of_service: { variant: "secondary" as const, label: "Out of Service", color: "text-red-600" },
      on_vacation: { variant: "secondary" as const, label: "On Vacation", color: "text-yellow-600" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  const formatDriverType = (type?: string) => {
    if (!type) return "Not provided"
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (!driver && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={driver?.avatar_url || "/placeholder.svg"} alt={driver?.name || "Driver"} />
                <AvatarFallback className="text-lg">
                  {driver?.name
                    ? driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "DR"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{driver?.name || "Unknown Driver"}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  {driver?.status && getStatusBadge(driver.status)}
                  {driver?.driver_type && <Badge variant="secondary">{formatDriverType(driver.driver_type)}</Badge>}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Driver</Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading driver information...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {driver?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{driver.phone}</span>
                      </div>
                    )}
                    {driver?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{driver.email}</span>
                      </div>
                    )}
                    {(driver?.address_line_1 || driver?.city || driver?.state) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          {driver.address_line_1 && <div>{driver.address_line_1}</div>}
                          {driver.address_line_2 && <div>{driver.address_line_2}</div>}
                          {(driver.city || driver.state || driver.zip_code) && (
                            <div className="text-muted-foreground">
                              {[driver.city, driver.state, driver.zip_code].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Professional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver?.license_number && (
                      <div className="text-sm">
                        <span className="font-medium">CDL:</span> {driver.license_number}
                      </div>
                    )}
                    {driver?.license_state && (
                      <div className="text-sm">
                        <span className="font-medium">License State:</span> {driver.license_state}
                      </div>
                    )}
                    {driver?.license_expiry && (
                      <div className="text-sm">
                        <span className="font-medium">License Expires:</span> {formatDate(driver.license_expiry)}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> {driver?.status || "Unknown"}
                    </div>
                    {driver?.driver_type && (
                      <div className="text-sm">
                        <span className="font-medium">Driver Type:</span> {formatDriverType(driver.driver_type)}
                      </div>
                    )}
                    {driver?.hire_date && (
                      <div className="text-sm">
                        <span className="font-medium">Hire Date:</span> {formatDate(driver.hire_date)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Equipment & Emergency Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipment Information */}
                {(driver?.truck_number ||
                  driver?.trailer_number ||
                  driver?.fuel_card_number ||
                  (driver?.equipment_preferences && driver.equipment_preferences.length > 0)) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Equipment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {driver?.truck_number && (
                        <div className="text-sm">
                          <span className="font-medium">Truck Number:</span> {driver.truck_number}
                        </div>
                      )}
                      {driver?.trailer_number && (
                        <div className="text-sm">
                          <span className="font-medium">Trailer Number:</span> {driver.trailer_number}
                        </div>
                      )}
                      {driver?.fuel_card_number && (
                        <div className="text-sm">
                          <span className="font-medium">Fuel Card:</span> {driver.fuel_card_number}
                        </div>
                      )}
                      {driver?.equipment_preferences && driver.equipment_preferences.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Equipment Preferences:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {driver.equipment_preferences.map((pref, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contact */}
                {(driver?.emergency_contact_name || driver?.emergency_contact_phone) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {driver?.emergency_contact_name && (
                        <div className="text-sm">
                          <span className="font-medium">Name:</span> {driver.emergency_contact_name}
                        </div>
                      )}
                      {driver?.emergency_contact_phone && (
                        <div className="text-sm">
                          <span className="font-medium">Phone:</span> {driver.emergency_contact_phone}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>On-Time Delivery</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Load Acceptance Rate</span>
                        <span>90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_first_name">First Name</Label>
                            <Input
                              id="edit_first_name"
                              value={editData.first_name || ""}
                              onChange={(e) => handleInputChange("first_name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_last_name">Last Name</Label>
                            <Input
                              id="edit_last_name"
                              value={editData.last_name || ""}
                              onChange={(e) => handleInputChange("last_name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                              id="edit_email"
                              type="email"
                              value={editData.email || ""}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_phone">Phone</Label>
                            <Input
                              id="edit_phone"
                              value={editData.phone || ""}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                            <Input
                              id="edit_date_of_birth"
                              type="date"
                              value={editData.date_of_birth || ""}
                              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_hire_date">Hire Date</Label>
                            <Input
                              id="edit_hire_date"
                              type="date"
                              value={editData.hire_date || ""}
                              onChange={(e) => handleInputChange("hire_date", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Address Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_address_line_1">Address Line 1</Label>
                            <Input
                              id="edit_address_line_1"
                              value={editData.address_line_1 || ""}
                              onChange={(e) => handleInputChange("address_line_1", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_address_line_2">Address Line 2</Label>
                            <Input
                              id="edit_address_line_2"
                              value={editData.address_line_2 || ""}
                              onChange={(e) => handleInputChange("address_line_2", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_city">City</Label>
                            <Input
                              id="edit_city"
                              value={editData.city || ""}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_state">State</Label>
                            <Input
                              id="edit_state"
                              value={editData.state || ""}
                              onChange={(e) => handleInputChange("state", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_zip_code">ZIP Code</Label>
                            <Input
                              id="edit_zip_code"
                              value={editData.zip_code || ""}
                              onChange={(e) => handleInputChange("zip_code", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_location">Current Location</Label>
                            <Input
                              id="edit_location"
                              value={editData.location || ""}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_driver_type">Driver Type</Label>
                            <Select
                              value={editData.driver_type || "company"}
                              onValueChange={(value) => handleInputChange("driver_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select driver type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="owner_operator">Owner Operator</SelectItem>
                                <SelectItem value="lease_operator">Lease Operator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_license_number">CDL Number</Label>
                            <Input
                              id="edit_license_number"
                              value={editData.license_number || ""}
                              onChange={(e) => handleInputChange("license_number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_license_state">License State</Label>
                            <Input
                              id="edit_license_state"
                              value={editData.license_state || ""}
                              onChange={(e) => handleInputChange("license_state", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_license_expiry">License Expiry</Label>
                            <Input
                              id="edit_license_expiry"
                              type="date"
                              value={editData.license_expiry || ""}
                              onChange={(e) => handleInputChange("license_expiry", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_license_type">License Type</Label>
                            <Input
                              id="edit_license_type"
                              value={editData.license_type || ""}
                              onChange={(e) => handleInputChange("license_type", e.target.value)}
                              placeholder="e.g., Class A CDL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_rating">Rating (1-5)</Label>
                            <Input
                              id="edit_rating"
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={editData.rating || ""}
                              onChange={(e) => handleInputChange("rating", Number.parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Equipment Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Equipment Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_truck_number">Truck Number</Label>
                            <Input
                              id="edit_truck_number"
                              value={editData.truck_number || ""}
                              onChange={(e) => handleInputChange("truck_number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_trailer_number">Trailer Number</Label>
                            <Input
                              id="edit_trailer_number"
                              value={editData.trailer_number || ""}
                              onChange={(e) => handleInputChange("trailer_number", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_fuel_card_number">Fuel Card Number</Label>
                            <Input
                              id="edit_fuel_card_number"
                              value={editData.fuel_card_number || ""}
                              onChange={(e) => handleInputChange("fuel_card_number", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_emergency_contact_name">Emergency Contact Name</Label>
                            <Input
                              id="edit_emergency_contact_name"
                              value={editData.emergency_contact_name || ""}
                              onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_emergency_contact_phone">Emergency Contact Phone</Label>
                            <Input
                              id="edit_emergency_contact_phone"
                              value={editData.emergency_contact_phone || ""}
                              onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                        <div className="space-y-2">
                          <Label htmlFor="edit_notes">Notes</Label>
                          <Textarea
                            id="edit_notes"
                            value={editData.notes || ""}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Enter any additional notes about the driver"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="text-sm">{driver?.name || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-sm">{driver?.email || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p className="text-sm">{driver?.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                          <p className="text-sm">{formatDate(driver?.date_of_birth)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
                          <p className="text-sm">{formatDate(driver?.hire_date)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Driver Type</Label>
                          <p className="text-sm">{formatDriverType(driver?.driver_type)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">CDL Number</Label>
                          <p className="text-sm">{driver?.license_number || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">License State</Label>
                          <p className="text-sm">{driver?.license_state || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">License Expiry</Label>
                          <p className="text-sm">{formatDate(driver?.license_expiry)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                          <p className="text-sm">
                            {driver?.emergency_contact_name || "Not provided"}
                            {driver?.emergency_contact_phone && (
                              <span className="block text-muted-foreground">{driver.emergency_contact_phone}</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                          <p className="text-sm">{driver?.location || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                          <p className="text-sm">{driver?.rating ? `${driver.rating}/5.0` : "Not rated"}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        <p className="text-sm">{driver?.notes || "No notes"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
