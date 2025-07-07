"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface APIKeyStatus {
  openai: boolean
  anthropic: boolean
  errors: Record<string, string>
}

export function APIKeyStatus() {
  const [status, setStatus] = useState<APIKeyStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAPIKeys() {
      try {
        const response = await fetch("/api/ai/test-keys")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to check API keys:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAPIKeys()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking API Keys...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Status</CardTitle>
        <CardDescription>Current status of your AI service API keys</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">OpenAI</span>
          <Badge variant={status?.openai ? "default" : "destructive"} className="flex items-center gap-1">
            {status?.openai ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Failed
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Anthropic</span>
          <Badge variant={status?.anthropic ? "default" : "destructive"} className="flex items-center gap-1">
            {status?.anthropic ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Failed
              </>
            )}
          </Badge>
        </div>

        {status?.errors && Object.keys(status.errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
            {Object.entries(status.errors).map(([provider, error]) => (
              <p key={provider} className="text-sm text-red-600">
                <strong>{provider}:</strong> {error}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
