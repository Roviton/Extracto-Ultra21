"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing connection to Supabase...")

      // Test 1: Check if we can connect to Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from("_supabase_health_check")
        .select("*")
        .limit(1)

      // If health check fails, try a simpler approach
      if (healthError) {
        // Test 2: Try to get the current user (this will work even if no user is logged in)
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError && userError.message !== "Invalid JWT") {
          throw new Error(`Auth connection failed: ${userError.message}`)
        }

        // If we get here, the connection is working
        setConnectionDetails({
          url: supabase.supabaseUrl,
          authConnected: true,
          user: userData?.user || null,
        })

        setStatus("success")
        setMessage("Successfully connected to Supabase! Auth service is working.")
      } else {
        // Health check passed
        setConnectionDetails({
          url: supabase.supabaseUrl,
          healthCheck: true,
          authConnected: true,
        })

        setStatus("success")
        setMessage("Successfully connected to Supabase! All services are working.")
      }
    } catch (error) {
      console.error("Supabase connection error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to connect to Supabase")
    }
  }

  const checkEnvironmentVariables = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return {
      hasUrl: !!url,
      hasKey: !!key,
      urlFormat: url ? url.includes("supabase.co") : false,
      keyFormat: key ? key.startsWith("eyJ") : false,
    }
  }

  const envCheck = checkEnvironmentVariables()

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test the connection to your Supabase project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Variables Check */}
          <div>
            <h3 className="font-medium mb-2">Environment Variables Check</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {envCheck.hasUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>NEXT_PUBLIC_SUPABASE_URL: {envCheck.hasUrl ? "✓ Set" : "✗ Missing"}</span>
              </div>
              <div className="flex items-center gap-2">
                {envCheck.hasKey ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envCheck.hasKey ? "✓ Set" : "✗ Missing"}</span>
              </div>
              {envCheck.hasUrl && (
                <div className="flex items-center gap-2">
                  {envCheck.urlFormat ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>URL Format: {envCheck.urlFormat ? "✓ Valid" : "✗ Invalid"}</span>
                </div>
              )}
              {envCheck.hasKey && (
                <div className="flex items-center gap-2">
                  {envCheck.keyFormat ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Key Format: {envCheck.keyFormat ? "✓ Valid JWT" : "✗ Invalid format"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Connection Test Results */}
          {status === "idle" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Ready to Test</AlertTitle>
              <AlertDescription>Click the button below to test your Supabase connection.</AlertDescription>
            </Alert>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>{message}</p>
            </div>
          )}

          {status === "success" && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
                {connectionDetails && (
                  <div className="mt-2 space-y-1">
                    <p>
                      <strong>Project URL:</strong> {connectionDetails.url}
                    </p>
                    <p>
                      <strong>Auth Service:</strong> {connectionDetails.authConnected ? "✓ Connected" : "✗ Failed"}
                    </p>
                    {connectionDetails.user && (
                      <p>
                        <strong>Current User:</strong> {connectionDetails.user.email || "Anonymous"}
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                {message}
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <strong>Common fixes:</strong>
                  </p>
                  <ul className="list-disc pl-5">
                    <li>Check your environment variables are correctly set</li>
                    <li>Ensure your Supabase project is active (not paused)</li>
                    <li>Verify the URL includes https:// and ends with .supabase.co</li>
                    <li>Make sure you're using the anon key, not the service_role key</li>
                    <li>Try restarting your development server</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={testConnection}
            disabled={status === "loading" || !envCheck.hasUrl || !envCheck.hasKey}
            className="w-full"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
