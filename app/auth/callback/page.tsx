"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Truck } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Confirming your account...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")
        console.log("URL search params:", searchParams.toString())
        console.log("URL hash:", window.location.hash)

        // Handle the auth callback - this processes the URL hash parameters
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("❌ Session error:", sessionError)
          // Try to exchange the URL hash for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) {
            console.error("❌ Code exchange error:", exchangeError)
            setStatus("error")
            setMessage("Failed to confirm your account. Please try again or contact support.")
            return
          }
        }

        // Get the current session after potential exchange
        const { data: currentSession, error: currentError } = await supabase.auth.getSession()

        if (currentError || !currentSession.session?.user) {
          console.error("❌ No valid session found:", currentError)
          setStatus("error")
          setMessage("No valid session found. Please try signing in again.")
          return
        }

        const user = currentSession.session.user
        console.log("✅ User session found:", user.email)

        // Small delay to ensure database operations are complete
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if user profile exists in database
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select(`
            id, name, email, role, company_id, is_active,
            companies(id, name)
          `)
          .eq("id", user.id)
          .single()

        if (profile && !profileError) {
          // Profile exists, redirect to dashboard
          console.log("✅ User profile found:", profile)
          setStatus("success")
          setMessage("Account confirmed successfully! Redirecting to your dashboard...")

          setTimeout(() => {
            if (profile.role === "admin") {
              router.push("/dashboard/admin")
            } else {
              router.push("/dashboard")
            }
          }, 2000)
        } else {
          console.error("❌ Profile lookup error:", profileError)

          // Try one more time with a longer delay
          await new Promise((resolve) => setTimeout(resolve, 3000))

          const { data: retryProfile, error: retryError } = await supabase
            .from("users")
            .select(`
              id, name, email, role, company_id, is_active,
              companies(id, name)
            `)
            .eq("id", user.id)
            .single()

          if (retryProfile && !retryError) {
            console.log("✅ Profile found on retry:", retryProfile)
            setStatus("success")
            setMessage("Account confirmed successfully! Redirecting to your dashboard...")

            setTimeout(() => {
              if (retryProfile.role === "admin") {
                router.push("/dashboard/admin")
              } else {
                router.push("/dashboard")
              }
            }, 1000)
          } else {
            console.error("❌ Profile still not found:", retryError)
            setStatus("error")
            setMessage(
              "Account confirmed but profile lookup failed. Please try signing in manually or contact support.",
            )
          }
        }
      } catch (error) {
        console.error("❌ Callback processing error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during confirmation. Please try again.")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          {/* Ultra21 Branding */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-black text-gray-900">
                Ultra<span className="text-blue-600 font-extrabold">21</span>
              </div>
              <div className="text-xs text-gray-600 font-medium tracking-wide">Freight Solutions</div>
            </div>
          </div>

          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
            {status === "success" && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === "error" && <XCircle className="h-8 w-8 text-red-600" />}
          </div>

          <CardTitle className="text-xl">
            {status === "loading" && "Confirming Account"}
            {status === "success" && "Success!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={() => router.push("/auth/signin")} className="w-full">
                Go to Sign In
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/register/company")} className="w-full">
                Register Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
