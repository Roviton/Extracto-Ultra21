"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Mail, Copy, Trash2, Clock, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { invitationService } from "@/lib/invitation-service"
import { format } from "date-fns"

interface InviteFormData {
  email: string
  role: "dispatcher" | "admin"
}

export function InvitationManagement() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteFormData>({ email: "", role: "dispatcher" })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { user } = useAuth()
  const { toast } = useToast()

  // Load invitations on component mount
  useEffect(() => {
    if (user?.companyId) {
      loadInvitations()
    }
  }, [user?.companyId])

  const loadInvitations = async () => {
    if (!user?.companyId) return

    setLoading(true)
    try {
      const result = await invitationService.getCompanyInvitations(user.companyId)
      if (result.success) {
        setInvitations(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load invitations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading invitations:", error)
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: { [key: string]: string } = {}

    if (!inviteForm.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(inviteForm.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!inviteForm.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    if (!user?.companyId || !user?.id) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      })
      return
    }

    setInviteLoading(true)

    try {
      const result = await invitationService.createInvitation({
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        companyId: user.companyId,
        createdBy: user.id,
      })

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${inviteForm.email}`,
        })

        // Reset form and close dialog
        setInviteForm({ email: "", role: "dispatcher" })
        setShowInviteDialog(false)
        setErrors({})

        // Reload invitations
        loadInvitations()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    } finally {
      setInviteLoading(false)
    }
  }

  const copyInvitationLink = async (token: string) => {
    const invitationUrl = invitationService.generateInvitationUrl(token)

    try {
      await navigator.clipboard.writeText(invitationUrl)
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const revokeInvitation = async (invitationId: string, email: string) => {
    try {
      const result = await invitationService.revokeInvitation(invitationId)

      if (result.success) {
        toast({
          title: "Invitation Revoked",
          description: `Invitation for ${email} has been revoked`,
        })
        loadInvitations()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to revoke invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error revoking invitation:", error)
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive",
      })
    }
  }

  const getInvitationStatus = (invitation: any) => {
    if (invitation.used_at) {
      return { status: "used", label: "Used", variant: "default" as const }
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { status: "expired", label: "Expired", variant: "destructive" as const }
    }

    return { status: "pending", label: "Pending", variant: "secondary" as const }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Team Invitations
            </CardTitle>
            <CardDescription>Invite dispatchers and admins to join your company</CardDescription>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>Send an invitation to join your freight company</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="dispatcher@example.com"
                    value={inviteForm.email}
                    onChange={(e) => {
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }))
                      }
                    }}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={inviteLoading}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: "dispatcher" | "admin") => {
                      setInviteForm((prev) => ({ ...prev, role: value }))
                      if (errors.role) {
                        setErrors((prev) => ({ ...prev, role: "" }))
                      }
                    }}
                    disabled={inviteLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations sent</h3>
            <p className="text-gray-500 mb-4">Start by inviting team members to join your company</p>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Send First Invitation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation)

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.status === "used" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {status.status === "expired" && <AlertCircle className="mr-1 h-3 w-3" />}
                          {status.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(invitation.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(invitation.expires_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {status.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => copyInvitationLink(invitation.token)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                          {status.status !== "used" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeInvitation(invitation.id, invitation.email)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
