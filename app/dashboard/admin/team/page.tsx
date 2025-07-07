"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvitationManagement } from "@/components/dashboard/admin/invitation-management"
import { DriverAssignmentManagement } from "@/components/dashboard/admin/driver-assignment-management"
import { RPMTargetManagement } from "@/components/dashboard/admin/rpm-target-management"
import { Users, UserCheck, Target } from "lucide-react"

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">Manage your team members, driver assignments, and performance targets</p>
      </div>

      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Driver Assignments
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            RPM Targets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-6">
          <InvitationManagement />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <DriverAssignmentManagement />
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <RPMTargetManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
