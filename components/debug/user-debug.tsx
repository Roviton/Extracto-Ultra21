"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserDebug() {
  const { user } = useAuth()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="py-2">
        <CardTitle className="text-sm text-yellow-800">Debug: User Info</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-xs font-mono">
          <p className="mb-1">
            <strong>User:</strong> {user ? user.name : "Not logged in"}
          </p>
          <p className="mb-1">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="mb-1">
            <strong>Role:</strong> {user?.role}
          </p>
          <p className="mb-1">
            <strong>Company ID:</strong> {user?.companyId || "Missing!"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
