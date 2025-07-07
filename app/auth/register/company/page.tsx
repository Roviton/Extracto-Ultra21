"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Building2, User, CheckCircle, AlertCircle, Mail } from "lucide-react"

interface CompanyFormData {
  // Company Information
  companyName: string
  businessAddress: string
  businessPhone: string
  dotNumber: string
  mcNumber: string

  // Admin Account
  adminName: string
  adminEmail: string
  adminPhone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: CompanyFormData = {
  companyName: "",
  businessAddress: "",
  businessPhone: "",
  dotNumber: "",
  mcNumber: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  password: "",
  confirmPassword: "",
}

export default function CompanyRegistrationPage() {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false)
  const router = useRouter()

  const clearErrors = () => setErrors({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "companyName":
        return value.trim().length < 2 ? "Company name must be at least 2 characters" : ""

      case "businessAddress":
        return value.trim().length < 10 ? "Please enter a complete business address" : ""

      case "businessPhone":
      case "adminPhone":
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/
        return !phoneRegex.test(value.replace(/\s/g, "")) ? "Please enter a valid phone number" : ""

      case "adminName":
        return value.trim().length < 2 ? "Full name must be at least 2 characters" : ""

      case "adminEmail":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? "Please enter a valid email address" : ""

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

    // Validate all required fields
    const requiredFields = [
      "companyName",
      "businessAddress",
      "businessPhone",
      "adminName",
      "adminEmail",
      "adminPhone",
      "password",
      "confirmPassword",
    ]

    requiredFields.forEach((field) => {
      const value = formData[field as keyof CompanyFormData]
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

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength, text: "Weak", color: "text-red-500" }
    if (strength <= 3) return { strength, text: "Fair", color: "text-yellow-500" }
    if (strength <= 4) return { strength, text: "Good", color: "text-blue-500" }
    return { strength, text: "Strong", color: "text-green-500" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    clearErrors()

    try {
      console.log("🚀 Starting company registration process...")

      // Call our API route instead of direct Supabase calls
      const response = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          dotNumber: formData.dotNumber,
          mcNumber: formData.mcNumber,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPhone: formData.adminPhone,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("❌ Registration failed:", result.error)
        if (result.error.includes("already registered") || result.error.includes("already been registered")) {
          setErrors({ general: "An account with this email already exists. Try signing in instead." })
        } else if (result.error.includes("Invalid email")) {
          setErrors({ adminEmail: "Please enter a valid email address" })
        } else if (result.error.includes("Password")) {
          setErrors({ password: "Password does not meet requirements" })
        } else {
          setErrors({ general: `Registration failed: ${result.error}` })
        }
        setLoading(false)
        return
      }

      console.log("✅ Registration successful:", result)

      // Handle email confirmation flow
      if (result.needsEmailConfirmation) {
        console.log("📧 Email confirmation required")
        setEmailConfirmationSent(true)
        setLoading(false)
        return
      }

      // Success! User is already authenticated
      console.log("🎉 Registration completed successfully!")
      setSuccess(true)

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/dashboard/admin?welcome=true")
      }, 2000)
    } catch (error) {
      console.error("❌ Unexpected registration error:", error)
      setErrors({ general: "An unexpected error occurred. Please try again." })
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <div className="mb-6">
              <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a confirmation email to <strong>{formData.adminEmail}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to complete your registration and access your dashboard.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> If you received a localhost link, please replace "localhost:3000" with
                  "ultra21.com" in the URL.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Ultra21!</h2>
              <p className="text-gray-600">
                Your company account has been created successfully. Redirecting to your dashboard...
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Company</h1>
          <p className="text-gray-600">
            Join thousands of freight companies using Ultra21 to streamline their operations
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Set up your freight company and admin account to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Company Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="ABC Trucking LLC"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className={errors.companyName ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address *</Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="123 Fleet Street, Dallas, TX 75201"
                      value={formData.businessAddress}
                      onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                      className={errors.businessAddress ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
                  </div>

                  <div>
                    <Label htmlFor="businessPhone">Business Phone *</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="+1-555-123-4567"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange("businessPhone", e.target.value)}
                      className={errors.businessPhone ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.businessPhone && <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input
                      id="dotNumber"
                      type="text"
                      placeholder="DOT123456 (optional)"
                      value={formData.dotNumber}
                      onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="mcNumber">MC Number</Label>
                    <Input
                      id="mcNumber"
                      type="text"
                      placeholder="MC789012 (optional)"
                      value={formData.mcNumber}
                      onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Admin Account Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Admin Account</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="adminName">Your Full Name *</Label>
                    <Input
                      id="adminName"
                      type="text"
                      placeholder="John Smith"
                      value={formData.adminName}
                      onChange={(e) => handleInputChange("adminName", e.target.value)}
                      className={errors.adminName ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.adminName && <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="adminEmail">Your Email Address *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="john@abctrucking.com"
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                      className={errors.adminEmail ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="adminPhone">Your Phone Number *</Label>
                    <Input
                      id="adminPhone"
                      type="tel"
                      placeholder="+1-555-123-4567"
                      value={formData.adminPhone}
                      onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                      className={errors.adminPhone ? "border-red-500" : ""}
                      disabled={loading}
                    />
                    {errors.adminPhone && <p className="text-red-500 text-sm mt-1">{errors.adminPhone}</p>}
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
                    {formData.password && (
                      <div className="mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.strength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.strength <= 3
                                    ? "bg-yellow-500"
                                    : passwordStrength.strength <= 4
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                              }`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs ${passwordStrength.color}`}>{passwordStrength.text}</span>
                        </div>
                      </div>
                    )}
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
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-5 w-5" />
                    Create Company Account
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

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
