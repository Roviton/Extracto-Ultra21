"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface TestLoadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TestLoadModal({ isOpen, onClose }: TestLoadModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("🧪 TEST MODAL: Starting submission")
      console.log("🧪 TEST MODAL: User:", user)
      console.log("🧪 TEST MODAL: Customer name:", customerName)

      if (!user) {
        throw new Error("No user found")
      }

      if (!user.companyId) {
        throw new Error("User company information is missing. Cannot create load.")
      }

      console.log("🧪 TEST MODAL: Company ID found:", user.companyId)

      // Call the server action directly
      const response = await fetch("/api/test-load", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          company_id: user.companyId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create test load")
      }

      console.log("🧪 TEST MODAL: Success!", result)
      toast({
        title: "Success",
        description: "Test load created successfully!",
      })

      onClose()
    } catch (error: any) {
      console.error("🧪 TEST MODAL: Error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Load Creation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Test Load"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
