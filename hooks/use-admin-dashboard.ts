"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { startOfMonth, endOfMonth } from "date-fns"

export type DashboardData = {
  totalLoads: number
  averageRPM: number
  needsAttention: number
  monthlyRevenue: number
  lowRateLoads: any[]
  pendingComments: any[]
  delayedLoads: any[]
  dispatcherPerformance: any[]
}

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchDashboardData = async () => {
    if (!user?.companyId) {
      console.log("No company ID found, clearing dashboard data")
      setDashboardData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching admin dashboard data for company:", user.companyId)

      // Get total loads count for this company only
      const { count: totalLoads, error: loadsError } = await supabase
        .from("loads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", user.companyId) // CRITICAL: Filter by company

      if (loadsError) throw new Error(`Error fetching total loads: ${loadsError.message}`)

      // Get loads with rate and distance for RPM calculation (company filtered)
      const { data: loadsWithRates, error: rpmError } = await supabase
        .from("loads")
        .select("rate, distance")
        .eq("company_id", user.companyId) // CRITICAL: Filter by company
        .not("rate", "is", null)
        .not("distance", "is", null)

      if (rpmError) throw new Error(`Error fetching loads for RPM: ${rpmError.message}`)

      // Calculate average RPM
      const averageRPM =
        loadsWithRates.length > 0
          ? loadsWithRates.reduce((sum, load) => sum + load.rate / (load.distance || 1), 0) / loadsWithRates.length
          : 0

      // Get loads needing attention (with admin comments or low rates)
      // FIXED: Join with loads table to filter by company_id instead of directly on admin_comments
      let commentsCount = 0
      try {
        const { count, error: commentsError } = await supabase
          .from("admin_comments")
          .select("id", { count: "exact", head: true })
          .eq("dispatcher_notified", false)
          .in("load_id", supabase.from("loads").select("id").eq("company_id", user.companyId))

        if (!commentsError) {
          commentsCount = count || 0
        } else {
          console.warn("Could not fetch comments count, defaulting to 0:", commentsError)
        }
      } catch (commentsErr) {
        console.warn("Error in comments query, defaulting count to 0:", commentsErr)
      }

      // Get low rate loads for attention required section - company filtered
      // Use a simpler query to avoid RLS recursion
      const { data: lowRateLoads, error: lowRateLoadsError } = await supabase
        .from("loads")
        .select(
          `
    id, 
    load_number, 
    rate, 
    distance,
    dispatcher_id,
    customer_id
  `,
        )
        .eq("company_id", user.companyId)
        .not("rate", "is", null)
        .not("distance", "is", null)
        .limit(5)

      // Filter low rate loads in JavaScript to avoid complex SQL
      const filteredLowRateLoads =
        lowRateLoads?.filter((load) => load.rate && load.distance && load.rate / load.distance < 2.0) || []

      if (lowRateLoadsError) throw new Error(`Error fetching low rate loads details: ${lowRateLoadsError.message}`)

      const needsAttention = commentsCount + (filteredLowRateLoads?.length || 0)

      // Get monthly revenue - company filtered
      const now = new Date()
      const monthStart = startOfMonth(now).toISOString()
      const monthEnd = endOfMonth(now).toISOString()

      const { data: monthlyRevenueData, error: revenueError } = await supabase
        .from("loads")
        .select("rate")
        .eq("company_id", user.companyId) // CRITICAL: Filter by company
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd)
        .not("rate", "is", null)

      if (revenueError) throw new Error(`Error fetching monthly revenue: ${revenueError.message}`)

      const monthlyRevenue = monthlyRevenueData.reduce((sum, load) => sum + (load.rate || 0), 0)

      // Get low rate loads for attention required section - company filtered
      // FIXED: Join with loads table to filter by company_id
      let pendingComments = []
      try {
        const { data: commentsData, error: pendingCommentsError } = await supabase
          .from("admin_comments")
          .select(
            `
            id,
            load_id,
            loads!inner(load_number, company_id),
            users!admin_id(name),
            priority,
            created_at
          `,
          )
          .eq("dispatcher_notified", false)
          .eq("loads.company_id", user.companyId) // Filter by company through loads table
          .limit(5)

        if (!pendingCommentsError && commentsData) {
          pendingComments = commentsData.map((comment) => ({
            id: comment.id,
            load_id: comment.load_id,
            load_number: comment.loads?.load_number,
            admin_name: comment.users?.name,
            priority: comment.priority,
            created_at: comment.created_at,
          }))
        }
      } catch (commentsErr) {
        console.warn("Error fetching pending comments, defaulting to empty array:", commentsErr)
      }

      // Get delayed loads - company filtered
      const { data: delayedLoads, error: delayedLoadsError } = await supabase
        .from("loads")
        .select("id, load_number, delivery_date, status, customers(name)")
        .eq("company_id", user.companyId) // CRITICAL: Filter by company
        .lt("delivery_date", new Date().toISOString())
        .not("status", "in", "(completed,cancelled)")
        .limit(5)

      if (delayedLoadsError) throw new Error(`Error fetching delayed loads: ${delayedLoadsError.message}`)

      // Get dispatcher performance - simplified to avoid recursion
      const { data: dispatchers, error: dispatcherError } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "dispatcher")
        .eq("company_id", user.companyId)
        .limit(5)

      if (dispatcherError) throw new Error(`Error fetching dispatchers: ${dispatcherError.message}`)

      // Get loads for each dispatcher separately
      const processedDispatcherPerformance = []
      for (const dispatcher of dispatchers || []) {
        const { data: dispatcherLoads } = await supabase
          .from("loads")
          .select("id, rate, distance, status")
          .eq("dispatcher_id", dispatcher.id)
          .eq("company_id", user.companyId)

        const loads = dispatcherLoads || []
        const totalLoads = loads.length
        const completedLoads = loads.filter((load) => load.status === "completed").length
        const totalRPM = loads.reduce(
          (sum, load) => sum + (load.rate && load.distance ? load.rate / load.distance : 0),
          0,
        )
        const avgRPM = totalLoads > 0 ? totalRPM / totalLoads : 0
        const completionRate = totalLoads > 0 ? (completedLoads / totalLoads) * 100 : 0

        processedDispatcherPerformance.push({
          id: dispatcher.id,
          name: dispatcher.name,
          totalLoads,
          completedLoads,
          avgRPM,
          completionRate,
        })
      }

      processedDispatcherPerformance.sort((a, b) => b.avgRPM - a.avgRPM)

      console.log(`✅ Fetched dashboard data for company ${user.companyId}:`, {
        totalLoads: totalLoads || 0,
        averageRPM,
        needsAttention,
        monthlyRevenue,
      })

      setDashboardData({
        totalLoads: totalLoads || 0,
        averageRPM,
        needsAttention,
        monthlyRevenue,
        lowRateLoads: filteredLowRateLoads,
        pendingComments,
        delayedLoads,
        dispatcherPerformance: processedDispatcherPerformance,
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up real-time subscriptions with company filtering
    const loadsSubscription = supabase
      .channel("loads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loads",
          filter: `company_id=eq.${user?.companyId}`, // Filter real-time updates by company
        },
        () => {
          fetchDashboardData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(loadsSubscription)
    }
  }, [user?.companyId])

  return { dashboardData, loading, error, refetch: fetchDashboardData }
}
