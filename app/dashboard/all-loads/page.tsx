import type { Metadata } from "next"
import { AllLoadsTable } from "@/components/dashboard/all-loads/all-loads-table"

export const metadata: Metadata = {
  title: "All Loads | Freight Dispatch",
  description: "View and manage all loads across dispatchers",
}

export default function AllLoadsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Loads</h1>
          <p className="text-muted-foreground">View and manage all loads across dispatchers</p>
        </div>
      </div>
      <AllLoadsTable />
    </div>
  )
}
