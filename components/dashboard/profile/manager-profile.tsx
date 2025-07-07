"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface ManagerProfileProps {
  user: any
  isEditing: boolean
}

export function ManagerProfile({ user, isEditing }: ManagerProfileProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Manager Dashboard</CardTitle>
        <CardDescription>Team management and performance tracking</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <BarChart3 className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-xl font-medium mb-2">Manager Profile</h3>
        <p className="text-muted-foreground">
          Manager profile with team performance metrics will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}
