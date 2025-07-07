"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

export type AdminLoad = {
  id: string
  loadNumber: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: string
  rate: number
  distance: number
  rpm: number
  dispatcher?: {
    id: string
    name: string
  }
  driver?: {
    id: string
    name: string
  }
  customer?: {
    id: string
    name: string
    contact?: string
  }
  adminComments?: {
    id: string
    comment: string // Changed from 'text' to 'comment'
    priority: string
    createdAt: string
  }[]
  needsAttention?: boolean
}

export type LoadFilters = {
  search?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
  dispatchers?: string[]
  statuses?: string[]
  rateRange?: {
    min: number
    max: number
  }
  customers?: string[]
  needsAttention?: boolean
}

export function useAdminLoads(filters: LoadFilters = {}) {
  const [loads, setLoads] = useState<AdminLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, let's check if the admin_comments table exists
      const { data: tableInfo, error: tableError } = await supabase.from("admin_comments").select("*").limit(1)

      if (tableError) {
        console.log("Admin comments table might not exist, proceeding without it")
      }

      // Let's query the loads table without joining admin_comments for now
      let query = supabase
        .from("loads")
        .select(
          `
          id,
          load_number,
          pickup_city,
          pickup_state,
          delivery_city,
          delivery_state,
          pickup_date,
          delivery_date,
          rate,
          distance,
          status,
          users!dispatcher_id(id, name),
          customers(id, name, contact_name),
          load_drivers(
            drivers(id, name)
          )
        `,
        )
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters.search) {
        query = query.or(
          `load_number.ilike.%${filters.search}%,pickup_city.ilike.%${filters.search}%,delivery_city.ilike.%${filters.search}%`,
        )
      }

      if (filters.dateRange?.from) {
        query = query.gte("pickup_date", filters.dateRange.from.toISOString())
      }

      if (filters.dateRange?.to) {
        query = query.lte("pickup_date", filters.dateRange.to.toISOString())
      }

      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in("status", filters.statuses)
      }

      const { data, error: loadsError } = await query

      if (loadsError) throw new Error(`Error fetching loads: ${loadsError.message}`)

      // Process the data
      const processedLoads: AdminLoad[] = data
        .map((load) => {
          // Calculate RPM
          const rpm = load.rate && load.distance ? load.rate / load.distance : 0

          // Check if load needs attention based on RPM
          const isLowRate = rpm < 2.0
          const needsAttention = isLowRate

          // Format the data
          return {
            id: load.id,
            loadNumber: load.load_number,
            origin: `${load.pickup_city || ""}, ${load.pickup_state || ""}`,
            destination: `${load.delivery_city || ""}, ${load.delivery_state || ""}`,
            pickupDate: load.pickup_date,
            deliveryDate: load.delivery_date,
            status: load.status,
            rate: load.rate || 0,
            distance: load.distance || 0,
            rpm,
            dispatcher: load.users
              ? {
                  id: load.users.id,
                  name: load.users.name,
                }
              : undefined,
            driver:
              load.load_drivers && load.load_drivers[0]?.drivers
                ? {
                    id: load.load_drivers[0].drivers.id,
                    name: load.load_drivers[0].drivers.name,
                  }
                : undefined,
            customer: load.customers
              ? {
                  id: load.customers.id,
                  name: load.customers.name,
                  contact: load.customers.contact_name,
                }
              : undefined,
            // We'll fetch comments separately or handle them differently
            adminComments: [],
            needsAttention,
          }
        })
        // Apply dispatcher filter in JS if needed
        .filter((load) => {
          if (filters.dispatchers && filters.dispatchers.length > 0) {
            return load.dispatcher && filters.dispatchers.includes(load.dispatcher.name)
          }
          return true
        })
        // Apply rate range filter
        .filter((load) => {
          if (filters.rateRange) {
            return load.rpm >= filters.rateRange.min && load.rpm <= filters.rateRange.max
          }
          return true
        })
        // Apply needs attention filter
        .filter((load) => {
          if (filters.needsAttention) {
            return load.needsAttention
          }
          return true
        })

      setLoads(processedLoads)
    } catch (err) {
      console.error("Error fetching loads:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoads()

    // Set up real-time subscription
    const loadsSubscription = supabase
      .channel("admin-loads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loads",
        },
        () => {
          fetchLoads()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(loadsSubscription)
    }
  }, [filters])

  return { loads, loading, error, refreshLoads: fetchLoads }
}
