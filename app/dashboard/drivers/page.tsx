"use client"

import { useState } from "react"
import { DriversTable } from "@/components/dashboard/drivers/drivers-table"
import { Button } from "@/components/ui/button"
import { UserPlus, RefreshCw } from "lucide-react"
import { AddDriverModal } from "@/components/dashboard/drivers/add-driver-modal"
import { ErrorBoundary } from "@/components/error-boundary"

// Use proper UUID for default company
const DEFAULT_COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export default function DriversPage() {
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet drivers, track performance, and handle documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDriverModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <ErrorBoundary>
            <DriversTable key={refreshKey} />
          </ErrorBoundary>
        </div>
      </div>

      <AddDriverModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        companyId={DEFAULT_COMPANY_ID}
      />
    </div>
  )
}
