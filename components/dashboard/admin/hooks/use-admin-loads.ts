"use client"

import { useState, useEffect } from "react"
import type { AdminLoad } from "../types/admin-load"

export function useAdminLoads(filters: any) {
  const [loads, setLoads] = useState<AdminLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  const mockLoads: AdminLoad[] = [
    {
      id: "1",
      loadNumber: "L-2025-001",
      origin: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      pickupDate: "2025-01-15",
      deliveryDate: "2025-01-16",
      status: "new",
      rate: 1850,
      distance: 370,
      rpm: 5.0,
      needsAttention: false,
      dispatcher: {
        id: "d1",
        name: "John Smith",
        avatar: "/javascript-code.png",
      },
      customer: {
        id: "c1",
        name: "Acme Logistics",
        contact: "Mike Johnson",
      },
      adminComments: [],
      createdAt: "2025-01-14T10:00:00Z",
      updatedAt: "2025-01-14T10:00:00Z",
    },
    {
      id: "2",
      loadNumber: "L-2025-002",
      origin: "Chicago, IL",
      destination: "Indianapolis, IN",
      pickupDate: "2025-01-15",
      deliveryDate: "2025-01-15",
      status: "assigned",
      rate: 950,
      distance: 180,
      rpm: 5.28,
      needsAttention: false,
      dispatcher: {
        id: "d2",
        name: "Sarah Johnson",
        avatar: "/stylized-letters-sj.png",
      },
      driver: {
        id: "dr1",
        name: "Mike Williams",
        avatar: "/intertwined-letters.png",
      },
      customer: {
        id: "c2",
        name: "Global Transport Inc.",
        contact: "Lisa Chen",
      },
      adminComments: [
        {
          id: "ac1",
          text: "Good rate for this route. Driver has excellent performance record.",
          priority: "low",
          author: "Admin User",
          createdAt: "2025-01-14T11:00:00Z",
          notifyDispatcher: false,
        },
      ],
      createdAt: "2025-01-14T09:00:00Z",
      updatedAt: "2025-01-14T11:00:00Z",
    },
    {
      id: "3",
      loadNumber: "L-2025-003",
      origin: "Dallas, TX",
      destination: "Houston, TX",
      pickupDate: "2025-01-16",
      deliveryDate: "2025-01-16",
      status: "in_progress",
      rate: 750,
      distance: 240,
      rpm: 3.13,
      needsAttention: false,
      dispatcher: {
        id: "d1",
        name: "John Smith",
        avatar: "/javascript-code.png",
      },
      driver: {
        id: "dr2",
        name: "Sarah Davis",
        avatar: "/stylized-letters-sj.png",
      },
      customer: {
        id: "c3",
        name: "FastFreight Co.",
        contact: "Tom Wilson",
      },
      adminComments: [],
      createdAt: "2025-01-14T08:00:00Z",
      updatedAt: "2025-01-14T14:00:00Z",
    },
    {
      id: "4",
      loadNumber: "L-2025-004",
      origin: "Miami, FL",
      destination: "Orlando, FL",
      pickupDate: "2025-01-17",
      deliveryDate: "2025-01-18",
      status: "new",
      rate: 650,
      distance: 235,
      rpm: 2.77,
      needsAttention: true,
      dispatcher: {
        id: "d3",
        name: "Emily Davis",
        avatar: "/abstract-geometric-mg.png",
      },
      customer: {
        id: "c4",
        name: "Prime Shipping LLC",
        contact: "David Brown",
      },
      adminComments: [
        {
          id: "ac2",
          text: "Rate is below our target threshold. Consider negotiating higher rate or declining.",
          priority: "high",
          author: "Admin User",
          createdAt: "2025-01-14T12:00:00Z",
          notifyDispatcher: true,
        },
      ],
      createdAt: "2025-01-14T07:00:00Z",
      updatedAt: "2025-01-14T12:00:00Z",
    },
    {
      id: "5",
      loadNumber: "L-2025-005",
      origin: "Seattle, WA",
      destination: "Portland, OR",
      pickupDate: "2025-01-18",
      deliveryDate: "2025-01-19",
      status: "completed",
      rate: 580,
      distance: 174,
      rpm: 3.33,
      needsAttention: false,
      dispatcher: {
        id: "d2",
        name: "Sarah Johnson",
        avatar: "/stylized-letters-sj.png",
      },
      driver: {
        id: "dr3",
        name: "Tom Davis",
        avatar: "/abstract-geometric-TD.png",
      },
      customer: {
        id: "c1",
        name: "Acme Logistics",
        contact: "Mike Johnson",
      },
      adminComments: [
        {
          id: "ac3",
          text: "Completed on time with good customer feedback. Solid performance.",
          priority: "low",
          author: "Admin User",
          createdAt: "2025-01-14T16:00:00Z",
          notifyDispatcher: false,
        },
      ],
      createdAt: "2025-01-13T15:00:00Z",
      updatedAt: "2025-01-14T16:00:00Z",
    },
  ]

  const refreshLoads = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Apply filters to mock data
      let filteredLoads = [...mockLoads]

      // Apply date range filter
      if (filters.dateRange.from) {
        filteredLoads = filteredLoads.filter((load) => new Date(load.pickupDate) >= filters.dateRange.from)
      }

      if (filters.dateRange.to) {
        filteredLoads = filteredLoads.filter((load) => new Date(load.pickupDate) <= filters.dateRange.to)
      }

      // Apply dispatcher filter
      if (filters.dispatchers.length > 0) {
        filteredLoads = filteredLoads.filter(
          (load) => load.dispatcher && filters.dispatchers.includes(load.dispatcher.name),
        )
      }

      // Apply status filter
      if (filters.statuses.length > 0) {
        filteredLoads = filteredLoads.filter((load) => filters.statuses.includes(load.status))
      }

      // Apply rate range filter
      if (filters.rateRange.min > 0 || filters.rateRange.max < 10) {
        filteredLoads = filteredLoads.filter(
          (load) => load.rpm && load.rpm >= filters.rateRange.min && load.rpm <= filters.rateRange.max,
        )
      }

      // Apply needs attention filter
      if (filters.needsAttention) {
        filteredLoads = filteredLoads.filter(
          (load) => load.needsAttention || load.rpm < 2.5 || load.adminComments?.some((c) => c.priority === "high"),
        )
      }

      setLoads(filteredLoads)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshLoads()
  }, [filters])

  return {
    loads,
    loading,
    error,
    refreshLoads,
  }
}
