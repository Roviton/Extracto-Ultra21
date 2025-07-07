"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { invitationService } from "@/lib/invitation-service"

interface DispatcherFormData {
  firstName: string
  lastName: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: DispatcherFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

export default function DispatcherRegistrationPage() {
  const [formData, setFormData] = useState<DispatcherFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  // Validate invitation token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrors({ general: "Invalid invitation link. Please contact your administrator." })
        setValidatingToken(false)
        return
      }

      try {
        const result = await invitationService.validateInvitation(token)

        if (!result.valid) {
          setErrors({ general: result.error || "Invalid invitation" })
        } else {
          setInvitationData(result.data)
        }
      } catch (error) {
        console.error("Error validating invitation:", error)
        setErrors({ general: "Failed to validate invitation. Please try again." })
      } finally {
        setValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length < 2 ? "Must be at least 2 characters" : ""

      case "phone":
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/
        return !phoneRegex.test(value.replace(/\s/g, "")) ? "Please enter a valid phone number" : ""

      case "password":
        if (value.length < 8) return "Password must be at least 8 characters"
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain uppercase, lowercase, and numbers"
        }
        return ""

      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : ""

      default:
        return ""
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear general errors when user starts typing
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }

    // Real-time validation
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    // Also validate confirm password when password changes
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const requiredFields = ["firstName", "lastName", "phone", "password", "confirmPassword"]

    requiredFields.forEach((field) => {
      const value = formData[field as keyof DispatcherFormData]
      if (!value.trim()) {
        newErrors[field] = "This field is required"
      } else {
        const error = validateField(field, value)
        if (error) newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !invitationData) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      console.log("🚀 Starting dispatcher registration process...")

      // Step 1: Create Supabase Auth user
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            phone: formData.phone,
            role: invitationData.role,
            company_id: invitationData.company_id,
          },
        },
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        if (authError.message.includes("already registered")) {
          setErrors({ general: "An account with this email already exists. Try signing in instead." })
        } else {
          setErrors({ general: `Registration failed: ${authError.message}` })
        }
        setLoading(false)
        return
      }

      if (!authData.user) {
        setErrors({ general: "Failed to create user account. Please try again." })
        setLoading(false)
        return
      }

      console.log("✅ Auth user created:", authData.user.id)

      // Step 2: Create user profile
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          company_id: invitationData.company_id,
          email: invitationData.email,
          name: fullName,
          role: invitationData.role,
          phone: formData.phone,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (userError) {
        console.error("❌ User profile creation error:", userError)
        setErrors({ general: `Failed to create user profile: ${userError.message}` })
        setLoading(false)
        return
      }

      console.log("✅ User profile created:", userProfile.id)

      // Step 3: Mark invitation as used
      await invitationService.markInvitationUsed(token!, authData.user.id)

      // Step 4: Success!
      console.log("🎉 Dispatcher registration completed successfully!")
      setSuccess(true)

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        if (invitationData.role === "admin") {
          router.push("/dashboard/admin?welcome=true")
        } else {
          router.push("/dashboard?welcome=true")
        }
      }, 2000)
    } catch (error) {
      console.error("❌ Unexpected registration error:", error)
      setErrors({ general: "An unexpected error occurred. Please try again." })
      setLoading(false)
    }
  }

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Invitation</h2>
            <p className="text-gray-600">Please wait while we verify your invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Ultra21!</h2>
            <p className="text-gray-600 mb-4">Your dispatcher account has been created successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state (invalid token)
  if (errors.general && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-6">{errors.general}</p>
            <Link href="/auth/signin">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
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
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Your Team</h1>
          <p className="text-gray-600">
            You've been invited to join <strong>{invitationData?.companies?.name}</strong> as a{" "}
            <strong>{invitationData?.role}</strong>
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Complete Your Registration</CardTitle>
            <CardDescription className="text-center">
              Create your account to start managing freight operations
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Invitation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Invitation Details</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p>
                    <strong>Email:</strong> {invitationData?.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {invitationData?.role}
                  </p>
                  <p>
                    <strong>Company:</strong> {invitationData?.companies?.name}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1-555-123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">8+ characters with uppercase, lowercase, and numbers</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
