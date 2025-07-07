"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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

// Mock user for minimal implementation
const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440010",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  avatar: "/stylized-letters-sj.png",
  companyId: "550e8400-e29b-41d4-a716-446655440000",
}

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
  const [user, setUser] = useState<User | null>(mockUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    console.log("Mock login:", email)
    setUser(mockUser)
  }

  const logout = () => {
    console.log("Mock logout")
    setUser(null)
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
