"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface AccountantProfileProps {
  user: any
  isEditing: boolean
}

export function AccountantProfile({ user, isEditing }: AccountantProfileProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Accountant Dashboard</CardTitle>
        <CardDescription>Financial management and reporting tools</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <DollarSign className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-xl font-medium mb-2">Accountant Profile</h3>
        <p className="text-muted-foreground">
          Financial management tools and reporting features will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}
