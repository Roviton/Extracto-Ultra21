"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface DriverUpdateInput {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  driver_type?: "company" | "owner_operator" | "lease_operator"
  license_number?: string
  license_state?: string
  license_expiry?: string
  license_type?: string
  truck_number?: string
  trailer_number?: string
  fuel_card_number?: string
  equipment_preferences?: string[]
  notes?: string
  location?: string
  rating?: number
}

export async function getDrivers() {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *
      `)
      .order("name")

    if (error) {
      console.error("Error fetching drivers:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [], error: null }
  } catch (error: any) {
    console.error("Unexpected error fetching drivers:", error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function getDriverById(id: string) {
  try {
    console.log("Fetching driver by ID:", id)

    // Get the complete driver information with all fields
    const { data: driverData, error: driverError } = await supabase.from("drivers").select("*").eq("id", id).single()

    if (driverError) {
      console.error("Error fetching driver by ID:", driverError)
      throw new Error(driverError.message)
    }

    if (!driverData) {
      throw new Error("Driver not found")
    }

    console.log("Raw driver data from database:", driverData)

    // Return the actual database data directly - don't transform unnecessarily
    return driverData
  } catch (error: any) {
    console.error("Unexpected error fetching driver by ID:", error)
    throw error
  }
}

// Helper function to safely handle date values
function sanitizeDateValue(dateValue: string | undefined | null): string | null {
  if (!dateValue || dateValue.trim() === "") {
    return null
  }
  return dateValue
}

// Helper function to safely handle string values
function sanitizeStringValue(stringValue: string | undefined | null): string | null {
  if (!stringValue || stringValue.trim() === "") {
    return null
  }
  return stringValue
}

// Helper function to safely handle number values
function sanitizeNumberValue(numberValue: number | undefined | null): number | null {
  if (numberValue === undefined || numberValue === null || isNaN(numberValue)) {
    return null
  }
  return numberValue
}

export async function updateDriver(updates: DriverUpdateInput) {
  try {
    const { id, first_name, last_name, ...otherUpdates } = updates

    console.log("Updating driver with full data:", updates)

    // Combine first and last name into a single name field
    const name = `${first_name || ""} ${last_name || ""}`.trim()

    // Map all the update fields to database columns with proper sanitization
    const updateData: any = {}

    if (name) {
      updateData.name = name
    }

    // Handle string fields - convert empty strings to null
    if (otherUpdates.email !== undefined) {
      updateData.email = sanitizeStringValue(otherUpdates.email)
    }
    if (otherUpdates.phone !== undefined) {
      updateData.phone = sanitizeStringValue(otherUpdates.phone)
    }
    if (otherUpdates.address_line_1 !== undefined) {
      updateData.address_line_1 = sanitizeStringValue(otherUpdates.address_line_1)
    }
    if (otherUpdates.address_line_2 !== undefined) {
      updateData.address_line_2 = sanitizeStringValue(otherUpdates.address_line_2)
    }
    if (otherUpdates.city !== undefined) {
      updateData.city = sanitizeStringValue(otherUpdates.city)
    }
    if (otherUpdates.state !== undefined) {
      updateData.state = sanitizeStringValue(otherUpdates.state)
    }
    if (otherUpdates.zip_code !== undefined) {
      updateData.zip_code = sanitizeStringValue(otherUpdates.zip_code)
    }
    if (otherUpdates.emergency_contact_name !== undefined) {
      updateData.emergency_contact_name = sanitizeStringValue(otherUpdates.emergency_contact_name)
    }
    if (otherUpdates.emergency_contact_phone !== undefined) {
      updateData.emergency_contact_phone = sanitizeStringValue(otherUpdates.emergency_contact_phone)
    }
    if (otherUpdates.driver_type !== undefined) {
      updateData.driver_type = sanitizeStringValue(otherUpdates.driver_type)
    }
    if (otherUpdates.license_number !== undefined) {
      updateData.license_number = sanitizeStringValue(otherUpdates.license_number)
    }
    if (otherUpdates.license_state !== undefined) {
      updateData.license_state = sanitizeStringValue(otherUpdates.license_state)
    }
    if (otherUpdates.license_type !== undefined) {
      updateData.license_type = sanitizeStringValue(otherUpdates.license_type)
    }
    if (otherUpdates.truck_number !== undefined) {
      updateData.truck_number = sanitizeStringValue(otherUpdates.truck_number)
    }
    if (otherUpdates.trailer_number !== undefined) {
      updateData.trailer_number = sanitizeStringValue(otherUpdates.trailer_number)
    }
    if (otherUpdates.fuel_card_number !== undefined) {
      updateData.fuel_card_number = sanitizeStringValue(otherUpdates.fuel_card_number)
    }
    if (otherUpdates.notes !== undefined) {
      updateData.notes = sanitizeStringValue(otherUpdates.notes)
    }
    if (otherUpdates.location !== undefined) {
      updateData.location = sanitizeStringValue(otherUpdates.location)
    }

    // Handle date fields - convert empty strings to null
    if (otherUpdates.date_of_birth !== undefined) {
      updateData.date_of_birth = sanitizeDateValue(otherUpdates.date_of_birth)
    }
    if (otherUpdates.hire_date !== undefined) {
      updateData.hire_date = sanitizeDateValue(otherUpdates.hire_date)
    }
    if (otherUpdates.license_expiry !== undefined) {
      updateData.license_expiry = sanitizeDateValue(otherUpdates.license_expiry)
    }

    // Handle number fields
    if (otherUpdates.rating !== undefined) {
      updateData.rating = sanitizeNumberValue(otherUpdates.rating)
    }

    // Handle array fields
    if (otherUpdates.equipment_preferences !== undefined) {
      updateData.equipment_preferences =
        otherUpdates.equipment_preferences && otherUpdates.equipment_preferences.length > 0
          ? otherUpdates.equipment_preferences
          : null
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Remove any undefined values (but keep null values)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log("Final update data for database:", updateData)

    const { data, error } = await supabase.from("drivers").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating driver:", error)
      throw new Error(error.message)
    }

    console.log("Driver updated successfully:", data)
    revalidatePath("/dashboard/drivers")
    return data
  } catch (error: any) {
    console.error("Unexpected error updating driver:", error)
    throw error
  }
}

export async function updateDriverStatus(driverId: string, status: string) {
  try {
    const { data, error } = await supabase.from("drivers").update({ status }).eq("id", driverId).select().single()

    if (error) {
      console.error("Error updating driver status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error updating driver status:", error)
    return { success: false, error: error.message }
  }
}

export async function updateDriverMessaging(driverId: string, messagingSettings: Record<string, boolean>) {
  try {
    // For now, just return success since we don't have a messaging table in the simplified schema
    revalidatePath("/dashboard/drivers")
    return { success: true, data: messagingSettings }
  } catch (error: any) {
    console.error("Unexpected error updating driver messaging:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteDriver(driverId: string) {
  try {
    const { error } = await supabase.from("drivers").delete().eq("id", driverId)

    if (error) {
      console.error("Error deleting driver:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error deleting driver:", error)
    return { success: false, error: error.message }
  }
}

export interface CreateDriverData {
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  hireDate?: string
  driverType?: "company" | "owner_operator" | "lease_operator"
  licenseNumber?: string
  licenseState?: string
  licenseExpiration?: string
  equipmentPreferences?: string[]
  fuelCardNumber?: string
  truckNumber?: string
  trailerNumber?: string
  notes?: string
  companyId: string
}

export async function createDriver(driverData: CreateDriverData) {
  try {
    console.log("Creating driver with data:", driverData)

    // Map the form data to our actual database schema with proper column names and sanitization
    const dbDriverData = {
      name: driverData.name,
      email: sanitizeStringValue(driverData.email),
      phone: sanitizeStringValue(driverData.phone),
      date_of_birth: sanitizeDateValue(driverData.dateOfBirth),
      address_line_1: sanitizeStringValue(driverData.addressLine1),
      address_line_2: sanitizeStringValue(driverData.addressLine2),
      city: sanitizeStringValue(driverData.city),
      state: sanitizeStringValue(driverData.state),
      zip_code: sanitizeStringValue(driverData.zipCode),
      emergency_contact_name: sanitizeStringValue(driverData.emergencyContactName),
      emergency_contact_phone: sanitizeStringValue(driverData.emergencyContactPhone),
      hire_date: sanitizeDateValue(driverData.hireDate),
      driver_type: driverData.driverType || "company",
      license_number: sanitizeStringValue(driverData.licenseNumber),
      license_state: sanitizeStringValue(driverData.licenseState),
      license_expiry: sanitizeDateValue(driverData.licenseExpiration),
      equipment_preferences:
        driverData.equipmentPreferences && driverData.equipmentPreferences.length > 0
          ? driverData.equipmentPreferences
          : null,
      fuel_card_number: sanitizeStringValue(driverData.fuelCardNumber),
      truck_number: sanitizeStringValue(driverData.truckNumber),
      trailer_number: sanitizeStringValue(driverData.trailerNumber),
      notes: sanitizeStringValue(driverData.notes),
      company_id: driverData.companyId,
      status: "available" as const,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Mapped driver data for database:", dbDriverData)

    const { data, error } = await supabase.from("drivers").insert(dbDriverData).select().single()

    if (error) {
      console.error("Error creating driver:", error)
      return { success: false, error: error.message }
    }

    console.log("Driver created successfully:", data)
    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error creating driver:", error)
    return { success: false, error: error.message }
  }
}
