"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface AdminProfileProps {
  user: any
  isEditing: boolean
}

export function AdminProfile({ user, isEditing }: AdminProfileProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Administrator Dashboard</CardTitle>
        <CardDescription>System administration tools and settings</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <Shield className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-xl font-medium mb-2">Admin Profile</h3>
        <p className="text-muted-foreground">
          Full administrator profile with system management tools will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}
