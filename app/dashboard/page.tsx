"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import useLoads from "@/hooks/use-loads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { ModalProvider } from "@/components/modal-provider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useModal } from "@/hooks/use-modal"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")

  const {
    loads = [],
    loading = false,
    error = null,
    updateLoadStatus,
    assignDriver,
    refetch: refetchLoads,
  } = useLoads({
    viewMode: statusFilter,
  }) || {}

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { onOpen } = useModal()

  useEffect(() => {
    if (!authLoading) {
      if (user?.role === "admin") {
        if (pathname !== "/dashboard/admin") {
          router.push("/dashboard/admin")
        }
      }
      // Dispatchers stay on /dashboard - no redirect needed
    }
  }, [user, authLoading, router, pathname])

  const handleCreateNewLoad = () => {
    console.log("Dashboard: Create button clicked")
    console.log("Dashboard: User:", user)
    console.log("Dashboard: User companyId:", user?.companyId)

    if (!user) {
      console.log("Dashboard: No user found")
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive",
      })
      return
    }

    if (!user.companyId) {
      console.log("Dashboard: No companyId found")
      toast({
        title: "Authentication Error",
        description: "User company information is missing. Cannot create load.",
        variant: "destructive",
      })
      return
    }

    console.log("Dashboard: All checks passed, opening modal")
    onOpen("enhancedNewLoad", {})
  }

  const handleAssignDriver = async (loadId, driverId) => {
    try {
      await assignDriver(loadId, driverId)
      toast({
        title: "Success",
        description: "Driver assigned successfully",
      })
      if (refetchLoads) refetchLoads()
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      })
    }
  }

  const filteredLoads = (loads || []).filter((load) => {
    if (!searchTerm) return true
    const lowerSearchTerm = searchTerm.toLowerCase()
    const customerName =
      typeof load?.customer === "object" && load?.customer !== null
        ? load.customer.name || ""
        : String(load?.customer || "")

    return (
      load?.load_number?.toLowerCase().includes(lowerSearchTerm) ||
      load?.reference_number?.toLowerCase().includes(lowerSearchTerm) ||
      customerName?.toLowerCase().includes(lowerSearchTerm) ||
      load?.pickup_city?.toLowerCase().includes(lowerSearchTerm) ||
      load?.delivery_city?.toLowerCase().includes(lowerSearchTerm)
    )
  })

  if (error && !loading && loads.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>Error loading dashboard data: {error}</p>
              <Button onClick={() => (refetchLoads ? refetchLoads() : window.location.reload())} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your dispatch operations.</p>
        </div>
        <Button onClick={handleCreateNewLoad} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New Load
        </Button>
      </div>

      <DashboardStats loads={loads || []} loading={loading || false} />

      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "active" && "Active Loads"}
              {statusFilter === "history" && "Load History"}
              {statusFilter === "all" && "All Loads"}
            </CardTitle>
            <CardDescription>Manage your loads - assign drivers, update status, and track progress.</CardDescription>
            <div className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="Search loads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="lg:col-span-1"
                />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="lg:col-span-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Loads</SelectItem>
                    <SelectItem value="all">All Loads</SelectItem>
                    <SelectItem value="history">Load History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && loads.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <LoadsDataTable
                loads={filteredLoads || []}
                loading={loading || false}
                error={error || null}
                onUpdateStatus={updateLoadStatus}
                onAssignDriver={handleAssignDriver}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ModalProvider />
    </div>
  )
}
