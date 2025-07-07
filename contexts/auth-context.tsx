"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "dispatcher"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isDispatcher: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users for MVP testing
const sampleUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as UserRole,
    avatar: "/stylized-letters-sj.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "John Dispatcher",
    email: "dispatcher@example.com",
    role: "dispatcher" as UserRole,
    avatar: "/javascript-code.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Sarah Dispatcher",
    email: "dispatcher2@example.com",
    role: "dispatcher" as UserRole,
    avatar: "/emergency-dispatcher.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
]

// Simplified permission mapping for MVP
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "*", // All permissions
  ],
  dispatcher: [
    "view:loads",
    "create:loads",
    "edit:loads",
    "assign:drivers",
    "view:drivers",
    "view:customers",
    "comment:loads",
    "view:basic_reports",
    "edit:personal_profile",
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 AuthProvider: Checking for existing session...")

    // Check for Supabase session first
    const checkSupabaseSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("📦 Found Supabase session:", session.user.id)

        // Get user profile from database
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile && !error) {
          const authenticatedUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar_url || undefined,
            companyId: profile.company_id,
          }

          console.log("✅ Supabase user authenticated:", authenticatedUser.role)
          setUser(authenticatedUser)
          setIsLoading(false)
          return
        } else {
          console.log("⚠️ Supabase session exists but no profile found, signing out...")
          await supabase.auth.signOut()
        }
      }

      // Fallback to localStorage for demo users
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log("📦 Found stored demo user:", parsedUser)

          if (parsedUser && parsedUser.companyId && ["admin", "dispatcher"].includes(parsedUser.role)) {
            console.log("✅ Valid demo user found:", parsedUser.role)
            setUser(parsedUser)
          } else {
            console.log("❌ Invalid stored user, clearing...")
            localStorage.removeItem("user")
          }
        } catch (e) {
          console.error("❌ Failed to parse stored user:", e)
          localStorage.removeItem("user")
        }
      }

      setIsLoading(false)
    }

    checkSupabaseSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        // Get user profile from database
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile && !error) {
          const authenticatedUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar_url || undefined,
            companyId: profile.company_id,
          }

          console.log("✅ User signed in:", authenticatedUser.role)
          setUser(authenticatedUser)
          localStorage.removeItem("user") // Clear demo user if any
        } else {
          console.log("⚠️ User signed in but no profile found, signing out...")
          await supabase.auth.signOut()
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out")
        setUser(null)
        localStorage.removeItem("user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    console.log("🔐 Login attempt for:", email)
    setIsLoading(true)

    try {
      // Try sample users first for MVP demo
      const foundSampleUser = sampleUsers.find((u) => u.email === email)
      if (foundSampleUser && password === "password") {
        console.log("✅ Found sample user:", foundSampleUser)
        setUser(foundSampleUser)
        localStorage.setItem("user", JSON.stringify(foundSampleUser))
        setIsLoading(false)
        return
      }

      // Real Supabase authentication for production users
      console.log("🔍 Attempting Supabase authentication...")
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Supabase auth error:", authError)
        throw new Error("Invalid email or password")
      }

      if (!authData.user) {
        throw new Error("Authentication failed")
      }

      console.log("✅ Supabase Auth successful, fetching profile...")

      // Enhanced debugging for profile lookup
      console.log("🔍 Auth user details:", {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at,
        created_at: authData.user.created_at,
      })

      // Get user profile from database with company info
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(`
        id, name, email, role, company_id, phone, avatar_url, is_active,
        companies(id, name, dot_number, mc_number)
      `)
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error("❌ Profile query failed:", {
          error: profileError,
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
        })
      } else if (!profile) {
        console.error("❌ Profile query returned null/undefined")
      } else {
        console.log("✅ Profile query successful:", {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          company_id: profile.company_id,
          is_active: profile.is_active,
        })
      }

      if (profileError || !profile) {
        console.error("❌ Profile lookup error:", profileError)

        // Check if this is a newly registered user who hasn't completed the profile setup
        if (authData.user.email_confirmed_at) {
          // User confirmed email but profile doesn't exist - this might be a registration in progress
          throw new Error("Account setup incomplete. Please contact support or try registering again.")
        } else {
          // User exists in auth but no profile and email not confirmed
          throw new Error("Please check your email to confirm your account before signing in.")
        }
      }

      if (!profile.company_id) {
        throw new Error("User account is not associated with a company. Please contact support.")
      }

      if (!["admin", "dispatcher"].includes(profile.role)) {
        throw new Error("Invalid user role for this system. Please contact support.")
      }

      if (!profile.is_active) {
        throw new Error("Your account has been deactivated. Please contact your administrator.")
      }

      console.log("✅ Profile found:", profile.email, "Role:", profile.role)

      const authenticatedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url || undefined,
        companyId: profile.company_id,
      }

      console.log("✅ Real user authenticated:", authenticatedUser.role)
      setUser(authenticatedUser)
      localStorage.removeItem("user") // Clear any demo user data
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    console.log("🚪 Logging out...")
    setUser(null)
    localStorage.removeItem("user")
    await supabase.auth.signOut()

    // Redirect to the official sign-in page
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin"
    }
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    const userPermissions = rolePermissions[user.role]
    if (userPermissions.includes("*")) return true
    return userPermissions.includes(permission)
  }

  const isAdmin = () => user?.role === "admin"
  const isDispatcher = () => user?.role === "dispatcher"

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, isAdmin, isDispatcher }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
