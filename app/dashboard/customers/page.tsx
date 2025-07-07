"use client"

import { useState } from "react"
import { CustomersTable } from "@/components/dashboard/customers/customers-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddCustomerModal } from "@/components/dashboard/customers/add-customer-modal"

export default function CustomersPage() {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <Button onClick={() => setShowAddCustomerModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <CustomersTable />
        </div>
      </div>

      <AddCustomerModal isOpen={showAddCustomerModal} onClose={() => setShowAddCustomerModal(false)} />
    </div>
  )
}
