"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { createLoad } from "@/actions/load-actions"
import { DetailedUserDebug } from "@/components/debug/detailed-user-debug"

const LoadsClientPage = () => {
  const { onOpen } = useModal()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()

  const handleCreateNewLoad = () => {
    console.log("🚛 Create New Load clicked")
    console.log("👤 Current user:", user)
    console.log("⏳ Is loading:", isLoading)

    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Authentication is still loading...",
        variant: "default",
      })
      return
    }

    if (!user) {
      console.error("❌ No user found")
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a load.",
        variant: "destructive",
      })
      return
    }

    console.log("🏢 User companyId:", user.companyId)

    if (!user.companyId) {
      console.error("❌ User missing companyId")
      console.log("🔍 Full user object:", JSON.stringify(user, null, 2))
      toast({
        title: "Authentication Error",
        description: "User company information is missing. Cannot create load.",
        variant: "destructive",
      })
      return
    }

    console.log("✅ All checks passed, opening modal with companyId:", user.companyId)

    onOpen("enhancedNewLoad", {
      onSubmit: async (formData: any) => {
        try {
          console.log("📝 Submitting load with data:", formData)
          console.log("🏢 Using company_id:", user.companyId)

          await createLoad({ ...formData, company_id: user.companyId })

          toast({
            title: "Load Created",
            description: "New load has been successfully created.",
          })
        } catch (err: any) {
          console.error("❌ Failed to create load:", err)
          toast({
            title: "Error Creating Load",
            description: err.message || "Failed to create load.",
            variant: "destructive",
          })
          throw err
        }
      },
    })
  }

  return (
    <div>
      <DetailedUserDebug />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Loads Management</h1>
        <Button onClick={handleCreateNewLoad} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Create New Load"}
        </Button>
      </div>
      <div>Loads Content</div>
    </div>
  )
}

export default LoadsClientPage
