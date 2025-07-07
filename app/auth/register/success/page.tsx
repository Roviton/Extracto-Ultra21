"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, CheckCircle, ArrowRight, Users, Building2 } from "lucide-react"
import Link from "next/link"

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyName = searchParams.get("company") || "Your Company"

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3 transform group-hover:scale-105 transition duration-200">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-3xl font-black text-gray-900">
                Ultra<span className="text-blue-600 font-extrabold">21</span>
              </div>
              <div className="text-xs text-gray-600 font-medium tracking-wide">Freight Solutions</div>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">Welcome to Ultra21!</CardTitle>
            <CardDescription className="text-lg">Your company account has been successfully created</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{companyName} is now ready to go!</h2>
              <p className="text-gray-600">
                You can now start managing your freight operations with Ultra21's powerful dispatch system.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                Next Steps
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Explore Your Dashboard</p>
                    <p className="text-blue-700 text-sm">
                      Get familiar with load management, driver tracking, and reporting features
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Add Your Drivers</p>
                    <p className="text-blue-700 text-sm">Set up your driver profiles and equipment information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Invite Your Team</p>
                    <p className="text-blue-700 text-sm">Add dispatchers and other team members to your account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Create Your First Load</p>
                    <p className="text-blue-700 text-sm">Start dispatching loads and managing your operations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 h-12">
                <Link href="/dashboard">
                  <Building2 className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 h-12">
                <Link href="/dashboard/drivers">
                  <Users className="mr-2 h-5 w-5" />
                  Add Drivers
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>You'll be automatically redirected to your dashboard in a few seconds</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
