"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SupabaseTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)
    setResults([])

    const testResults: any[] = []

    try {
      // Test 1: Check companies table
      try {
        const { data, error } = await supabase.from("companies").select("id, name").limit(5)
        testResults.push({
          name: "Companies Table Query",
          success: !error,
          message: error ? error.message : `Found ${data?.length || 0} companies`,
          data: data?.slice(0, 3),
        })
      } catch (err: any) {
        testResults.push({
          name: "Companies Table Query",
          success: false,
          message: err.message,
        })
      }

      // Test 2: Check users table
      try {
        const { data, error } = await supabase.from("users").select("id, name, email").limit(5)
        testResults.push({
          name: "Users Table Query",
          success: !error,
          message: error ? error.message : `Found ${data?.length || 0} users`,
          data: data?.slice(0, 3),
        })
      } catch (err: any) {
        testResults.push({
          name: "Users Table Query",
          success: false,
          message: err.message,
        })
      }

      // Test 3: Check loads table
      try {
        const { data, error } = await supabase.from("loads").select("id, load_number, status").limit(5)
        testResults.push({
          name: "Loads Table Query",
          success: !error,
          message: error ? error.message : `Found ${data?.length || 0} loads`,
          data: data?.slice(0, 3),
        })
      } catch (err: any) {
        testResults.push({
          name: "Loads Table Query",
          success: false,
          message: err.message,
        })
      }

      // Test 4: Check drivers table
      try {
        const { data, error } = await supabase.from("drivers").select("id, name, status").limit(5)
        testResults.push({
          name: "Drivers Table Query",
          success: !error,
          message: error ? error.message : `Found ${data?.length || 0} drivers`,
          data: data?.slice(0, 3),
        })
      } catch (err: any) {
        testResults.push({
          name: "Drivers Table Query",
          success: false,
          message: err.message,
        })
      }

      // Test 5: Check customers table
      try {
        const { data, error } = await supabase.from("customers").select("id, name").limit(5)
        testResults.push({
          name: "Customers Table Query",
          success: !error,
          message: error ? error.message : `Found ${data?.length || 0} customers`,
          data: data?.slice(0, 3),
        })
      } catch (err: any) {
        testResults.push({
          name: "Customers Table Query",
          success: false,
          message: err.message,
        })
      }

      setResults(testResults)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Query Tests</CardTitle>
        <CardDescription>Test database connectivity and table access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Database Tests"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm">{result.message}</div>
                    {result.data && result.data.length > 0 && (
                      <div className="mt-2 text-xs">
                        <strong>Sample data:</strong>
                        <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
