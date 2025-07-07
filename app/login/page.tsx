"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new professional sign-in page
    router.replace("/auth/signin")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  )
}
