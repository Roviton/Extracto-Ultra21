"use client"

import type React from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createDriver, type CreateDriverData } from "@/actions/driver-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Truck, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase-client"

interface AddDriverModalProps {
  isOpen: boolean
  onClose: () => void
  companyId?: string
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const EQUIPMENT_TYPES = [
  "Dry Van",
  "Refrigerated",
  "Flatbed",
  "Step Deck",
  "Lowboy",
  "Tanker",
  "Auto Hauler",
  "Container",
  "Box Truck",
  "Other",
]

// Default test UUID that matches our test company
const DEFAULT_COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Generate a new UUID (fallback for older browsers)
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback UUID generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function AddDriverModal({ isOpen, onClose, companyId }: AddDriverModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(companyId || DEFAULT_COMPANY_ID)
  const [formData, setFormData] = useState<CreateDriverData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    hireDate: "",
    driverType: "company",
    licenseNumber: "",
    licenseState: "",
    licenseExpiration: "",
    equipmentPreferences: [],
    fuelCardNumber: "",
    truckNumber: "",
    trailerNumber: "",
    notes: "",
    companyId: DEFAULT_COMPANY_ID,
  })

  const { toast } = useToast()

  // Get the current user's company ID when the component mounts
  useEffect(() => {
    async function getUserCompanyId() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase.from("users").select("company_id").eq("id", user.id).single()

          if (data && data.company_id && isValidUUID(data.company_id)) {
            setCurrentCompanyId(data.company_id)
            setFormData((prev) => ({ ...prev, companyId: data.company_id }))
          } else {
            // Use default company ID if user doesn't have a valid company_id
            console.log("Using default company ID")
            setCurrentCompanyId(DEFAULT_COMPANY_ID)
            setFormData((prev) => ({ ...prev, companyId: DEFAULT_COMPANY_ID }))
          }
        } else {
          // No user logged in, use default company ID
          setCurrentCompanyId(DEFAULT_COMPANY_ID)
          setFormData((prev) => ({ ...prev, companyId: DEFAULT_COMPANY_ID }))
        }
      } catch (error) {
        console.error("Error fetching user company ID:", error)
        // Keep using the default company ID
        setCurrentCompanyId(DEFAULT_COMPANY_ID)
        setFormData((prev) => ({ ...prev, companyId: DEFAULT_COMPANY_ID }))
      }
    }

    if (isOpen) {
      getUserCompanyId()
    }
  }, [isOpen])

  const handleInputChange = (field: keyof CreateDriverData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEquipmentPreferenceChange = (equipment: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      equipmentPreferences: checked
        ? [...(prev.equipmentPreferences || []), equipment]
        : (prev.equipmentPreferences || []).filter((e) => e !== equipment),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate that we have a proper UUID for company ID
      if (!isValidUUID(currentCompanyId)) {
        throw new Error("Invalid company ID format. Please contact support.")
      }

      // Ensure we have a valid company ID
      const driverData = {
        ...formData,
        companyId: currentCompanyId,
      }

      console.log("Submitting driver data with company ID:", currentCompanyId)

      const result = await createDriver(driverData)

      if (result.success) {
        toast({
          title: "Driver added successfully",
          description: `${formData.name} has been added to your fleet`,
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          zipCode: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          hireDate: "",
          driverType: "company",
          licenseNumber: "",
          licenseState: "",
          licenseExpiration: "",
          equipmentPreferences: [],
          fuelCardNumber: "",
          truckNumber: "",
          trailerNumber: "",
          notes: "",
          companyId: currentCompanyId,
        })

        onClose()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error adding driver",
        description: error.message || "Failed to add driver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Driver
          </DialogTitle>
          <DialogDescription>
            Enter comprehensive driver information. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Basic personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john.smith@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => handleInputChange("hireDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="90210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Information</CardTitle>
                  <CardDescription>CDL information and professional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverType">Driver Type *</Label>
                    <Select
                      value={formData.driverType}
                      onValueChange={(value: any) => handleInputChange("driverType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company Driver</SelectItem>
                        <SelectItem value="owner_operator">Owner Operator</SelectItem>
                        <SelectItem value="lease_operator">Lease Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">CDL Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        placeholder="CDL123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseState">CDL State</Label>
                      <Select
                        value={formData.licenseState}
                        onValueChange={(value) => handleInputChange("licenseState", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiration">CDL Expiration Date</Label>
                    <Input
                      id="licenseExpiration"
                      type="date"
                      value={formData.licenseExpiration}
                      onChange={(e) => handleInputChange("licenseExpiration", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Equipment Preferences</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {EQUIPMENT_TYPES.map((equipment) => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment}
                            checked={(formData.equipmentPreferences || []).includes(equipment)}
                            onCheckedChange={(checked) =>
                              handleEquipmentPreferenceChange(equipment, checked as boolean)
                            }
                          />
                          <Label htmlFor={equipment} className="text-sm">
                            {equipment}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Equipment Assignment
                  </CardTitle>
                  <CardDescription>Assign trucks, trailers, and fuel cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="truckNumber">Truck Number</Label>
                      <Input
                        id="truckNumber"
                        value={formData.truckNumber}
                        onChange={(e) => handleInputChange("truckNumber", e.target.value)}
                        placeholder="T-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trailerNumber">Trailer Number</Label>
                      <Input
                        id="trailerNumber"
                        value={formData.trailerNumber}
                        onChange={(e) => handleInputChange("trailerNumber", e.target.value)}
                        placeholder="TR-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelCardNumber">Fuel Card Number</Label>
                    <Input
                      id="fuelCardNumber"
                      value={formData.fuelCardNumber}
                      onChange={(e) => handleInputChange("fuelCardNumber", e.target.value)}
                      placeholder="1234567890123456"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>Notes and additional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any additional notes about this driver..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding Driver..." : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
