"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function AuthTest() {
  const { user, isLoading } = useAuth()
  const [testResult, setTestResult] = useState<string>("")

  const runTest = () => {
    console.log("🧪 Running auth test...")
    console.log("User object:", user)
    console.log("Is loading:", isLoading)

    if (!user) {
      setTestResult("❌ No user found")
      return
    }

    if (!user.companyId) {
      setTestResult("❌ User missing companyId")
      return
    }

    setTestResult(`✅ User has companyId: ${user.companyId}`)
  }

  return (
    <div className="p-4 border border-red-500 bg-red-50 rounded-lg mb-4">
      <h3 className="font-bold text-red-800">Auth Debug Test</h3>
      <div className="mt-2 space-y-2">
        <p>
          <strong>User:</strong> {user ? user.email : "None"}
        </p>
        <p>
          <strong>Company ID:</strong> {user?.companyId || "Missing"}
        </p>
        <p>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </p>
        <Button onClick={runTest} size="sm">
          Run Test
        </Button>
        {testResult && <p className="mt-2 font-mono text-sm">{testResult}</p>}
      </div>
    </div>
  )
}
