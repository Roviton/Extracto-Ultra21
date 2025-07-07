"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    // This component is now just a redirect wrapper
    // The actual dashboard is implemented directly in app/dashboard/admin/page.tsx
    router.refresh()
  }, [router])

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading Admin Dashboard...</h2>
        <p className="text-muted-foreground">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  )
}
