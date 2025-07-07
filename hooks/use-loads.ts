"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Load {
  id: string
  load_number?: string | null
  reference_number?: string | null
  customer?: any | null
  pickup_city?: string | null
  pickup_state?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  pickup_address?: string | null
  pickup_location?: string | null
  pickup_number?: string | null
  pickup_contact_name?: string | null
  pickup_contact_phone?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_address?: string | null
  delivery_location?: string | null
  delivery_number?: string | null
  delivery_contact_name?: string | null
  delivery_contact_phone?: string | null
  status: string
  rate?: number | string | null
  commodity?: string | null
  weight?: number | null
  miles?: number | null
  load_drivers?: any[] | null
  rate_confirmation_pdf_url?: string | null
  rate_confirmation_pdf_id?: string | null
  equipment_type?: string | null
  pieces?: number | null
  special_instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
  appointment_number?: string | null
  notes?: string | null
  comments?: string | null
  pickup_zip?: string | null
  delivery_zip?: string | null
  assigned_by?: string | null
  company_id?: string | null
}

export default function useLoads({ viewMode = "active" }: { viewMode?: "active" | "history" | "all" } = {}) {
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchLoads = useCallback(async () => {
    if (!user?.companyId) {
      console.log("No company ID found, clearing loads")
      setLoads([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching loads for company:", user.companyId)

      let query = supabase
        .from("loads")
        .select(`
          *,
          customer:customers(*),
          load_drivers(
            *,
            driver:drivers(*)
          )
        `)
        .eq("company_id", user.companyId) // CRITICAL: Filter by company_id

      // Apply view mode filter
      if (viewMode === "active") {
        query = query.in("status", ["new", "assigned", "accepted", "in_progress"])
      } else if (viewMode === "history") {
        query = query.in("status", ["completed", "cancelled", "archived"])
      } else if (viewMode === "all") {
        // No filter for 'all' mode
      }

      query = query.order("created_at", { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      console.log(`✅ Fetched ${data?.length || 0} loads for company ${user.companyId}`)
      setLoads(data || [])
    } catch (err: any) {
      console.error("Error fetching loads:", err)
      setError(err.message || "Failed to fetch loads")
      setLoads([])
    } finally {
      setLoading(false)
    }
  }, [user?.companyId, viewMode])

  const updateLoadStatus = useCallback(
    async (loadId: string, status: string) => {
      try {
        const { error: updateError } = await supabase
          .from("loads")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", loadId)
          .eq("company_id", user?.companyId) // Ensure company isolation

        if (updateError) {
          throw updateError
        }

        // Update local state
        setLoads((prevLoads) =>
          prevLoads.map((load) =>
            load.id === loadId ? { ...load, status, updated_at: new Date().toISOString() } : load,
          ),
        )

        return true
      } catch (err: any) {
        console.error("Error updating load status:", err)
        throw err
      }
    },
    [user?.companyId],
  )

  const assignDriver = async (loadId: string, driverId: string) => {
    try {
      console.log("Assigning driver:", { loadId, driverId, assignedBy: user?.id, companyId: user?.companyId })

      // First, check if the driver exists and belongs to the same company
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("id, name, status, is_active, company_id")
        .eq("id", driverId)
        .eq("company_id", user?.companyId) // Ensure driver belongs to same company
        .single()

      if (driverError) {
        console.error("Error fetching driver:", driverError)
        throw new Error(`Error fetching driver: ${driverError.message}`)
      }

      if (!driverData.is_active) {
        throw new Error("Driver is not active and cannot be assigned")
      }

      console.log("Driver data:", driverData)

      // Try the simplified assignment function with company isolation
      const { error: assignError } = await supabase.rpc("assign_driver_to_load_simple", {
        p_load_id: loadId,
        p_driver_id: driverId,
        p_assigned_by: user?.id || null,
      })

      if (assignError) {
        console.error("Error in simplified RPC call:", assignError)
        throw new Error(`Error assigning driver: ${assignError.message}`)
      }

      // Refresh the loads data to reflect the changes
      await fetchLoads()

      return true
    } catch (error: any) {
      console.error("Error in assignDriver:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchLoads()
  }, [fetchLoads])

  return {
    loads: loads || [],
    loading: loading || false,
    error: error || null,
    updateLoadStatus,
    assignDriver,
    refetch: fetchLoads,
  }
}
