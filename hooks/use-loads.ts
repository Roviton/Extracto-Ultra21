"use client"

import { useState, useCallback } from "react"

export interface Load {
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

// Mock data for loads
const mockLoads: Load[] = [
  {
    id: "1",
    load_number: "L001",
    status: "active",
    pickup_date: "2023-06-01",
    delivery_date: "2023-06-03",
    pickup_location: "Chicago, IL",
    delivery_location: "New York, NY",
    commodity: "Electronics",
    rate: 1500,
  },
  {
    id: "2",
    load_number: "L002",
    status: "delivered",
    pickup_date: "2023-05-28",
    delivery_date: "2023-05-30",
    pickup_location: "Los Angeles, CA",
    delivery_location: "Phoenix, AZ",
    commodity: "Furniture",
    rate: 1200,
  },
]

function useLoads({ viewMode = "active" }: { viewMode?: "active" | "history" | "all" } = {}) {
  const [loads, setLoads] = useState<Load[]>(mockLoads)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshLoads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real implementation, this would fetch from an API
      // For now, we just use our mock data
      setLoads(mockLoads)
    } catch (err) {
      console.error("Error fetching loads:", err)
      setError("Failed to fetch loads")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    loads,
    isLoading,
    error,
    refreshLoads,
  }
}

export default useLoads;
