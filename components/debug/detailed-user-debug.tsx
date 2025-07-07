"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DetailedUserDebug() {
  const { user, isLoading } = useAuth()

  const checkLocalStorage = () => {
    const storedUser = localStorage.getItem("user")
    console.log("Raw localStorage user:", storedUser)
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        console.log("Parsed localStorage user:", parsed)
      } catch (e) {
        console.error("Error parsing stored user:", e)
      }
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mb-4 border-red-200 bg-red-50">
      <CardHeader className="py-2">
        <CardTitle className="text-sm text-red-800">🚨 DETAILED DEBUG: User Authentication</CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-2">
        <div className="text-xs font-mono">
          <p>
            <strong>Loading:</strong> {isLoading ? "YES" : "NO"}
          </p>
          <p>
            <strong>User Object Exists:</strong> {user ? "YES" : "NO"}
          </p>
          {user && (
            <>
              <p>
                <strong>User ID:</strong> {user.id || "MISSING"}
              </p>
              <p>
                <strong>Name:</strong> {user.name || "MISSING"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "MISSING"}
              </p>
              <p>
                <strong>Role:</strong> {user.role || "MISSING"}
              </p>
              <p>
                <strong>CompanyId (camelCase):</strong> {user.companyId || "❌ MISSING"}
              </p>
              <p>
                <strong>company_id (snake_case):</strong> {(user as any).company_id || "❌ MISSING"}
              </p>
            </>
          )}
        </div>
        <Button onClick={checkLocalStorage} size="sm" variant="outline">
          Check localStorage
        </Button>
        <div className="text-xs">
          <strong>Full User Object:</strong>
          <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
