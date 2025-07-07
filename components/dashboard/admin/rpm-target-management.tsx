"use client"

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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, TrendingUp, Calendar, DollarSign, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"
import { format } from "date-fns"

interface RPMTarget {
  id: string
  target_rpm: number
  period_start: string
  period_end: string
  created_at: string
  created_by: string
  users?: {
    name: string
  }
}

interface RPMTargetForm {
  targetRpm: string
  periodStart: string
  periodEnd: string
}

export function RPMTargetManagement() {
  const [targets, setTargets] = useState<RPMTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [showTargetDialog, setShowTargetDialog] = useState(false)
  const [editingTarget, setEditingTarget] = useState<RPMTarget | null>(null)
  const [targetForm, setTargetForm] = useState<RPMTargetForm>({
    targetRpm: "",
    periodStart: "",
    periodEnd: "",
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.companyId) {
      loadTargets()
    }
  }, [user?.companyId])

  const loadTargets = async () => {
    if (!user?.companyId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("rpm_targets")
        .select(`
          *,
          users!created_by(name)
        `)
        .eq("company_id", user.companyId)
        .order("period_start", { ascending: false })

      if (error) {
        console.error("Error loading RPM targets:", error)
        toast({
          title: "Error",
          description: "Failed to load RPM targets",
          variant: "destructive",
        })
      } else {
        setTargets(data || [])
      }
    } catch (error) {
      console.error("Error loading RPM targets:", error)
      toast({
        title: "Error",
        description: "Failed to load RPM targets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate target RPM
    const rpm = Number.parseFloat(targetForm.targetRpm)
    if (!targetForm.targetRpm.trim()) {
      newErrors.targetRpm = "Target RPM is required"
    } else if (isNaN(rpm) || rpm <= 0) {
      newErrors.targetRpm = "Target RPM must be a positive number"
    } else if (rpm > 100) {
      newErrors.targetRpm = "Target RPM seems unusually high"
    }

    // Validate dates
    if (!targetForm.periodStart) {
      newErrors.periodStart = "Start date is required"
    }

    if (!targetForm.periodEnd) {
      newErrors.periodEnd = "End date is required"
    }

    if (targetForm.periodStart && targetForm.periodEnd) {
      const startDate = new Date(targetForm.periodStart)
      const endDate = new Date(targetForm.periodEnd)

      if (endDate <= startDate) {
        newErrors.periodEnd = "End date must be after start date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveTarget = async () => {
    if (!validateForm() || !user?.companyId || !user?.id) {
      return
    }

    setSaveLoading(true)
    try {
      const targetData = {
        company_id: user.companyId,
        target_rpm: Number.parseFloat(targetForm.targetRpm),
        period_start: targetForm.periodStart,
        period_end: targetForm.periodEnd,
        created_by: user.id,
      }

      let result
      if (editingTarget) {
        // Update existing target
        result = await supabase
          .from("rpm_targets")
          .update({
            ...targetData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTarget.id)
          .select()
      } else {
        // Create new target
        result = await supabase.from("rpm_targets").insert(targetData).select()
      }

      if (result.error) {
        console.error("Error saving RPM target:", result.error)
        toast({
          title: "Error",
          description: "Failed to save RPM target",
          variant: "destructive",
        })
      } else {
        toast({
          title: editingTarget ? "Target Updated" : "Target Created",
          description: `RPM target has been ${editingTarget ? "updated" : "created"} successfully`,
        })

        // Reset form and close dialog
        setTargetForm({ targetRpm: "", periodStart: "", periodEnd: "" })
        setEditingTarget(null)
        setShowTargetDialog(false)
        setErrors({})

        // Reload targets
        loadTargets()
      }
    } catch (error) {
      console.error("Error saving RPM target:", error)
      toast({
        title: "Error",
        description: "Failed to save RPM target",
        variant: "destructive",
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleEditTarget = (target: RPMTarget) => {
    setEditingTarget(target)
    setTargetForm({
      targetRpm: target.target_rpm.toString(),
      periodStart: target.period_start,
      periodEnd: target.period_end,
    })
    setShowTargetDialog(true)
  }

  const handleDeleteTarget = async (targetId: string) => {
    try {
      const { error } = await supabase.from("rpm_targets").delete().eq("id", targetId)

      if (error) {
        console.error("Error deleting RPM target:", error)
        toast({
          title: "Error",
          description: "Failed to delete RPM target",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Target Deleted",
          description: "RPM target has been deleted successfully",
        })
        loadTargets()
      }
    } catch (error) {
      console.error("Error deleting RPM target:", error)
      toast({
        title: "Error",
        description: "Failed to delete RPM target",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setTargetForm({ targetRpm: "", periodStart: "", periodEnd: "" })
    setEditingTarget(null)
    setErrors({})
  }

  const isTargetActive = (target: RPMTarget): boolean => {
    const now = new Date()
    const start = new Date(target.period_start)
    const end = new Date(target.period_end)
    return now >= start && now <= end
  }

  const getTargetStatus = (target: RPMTarget) => {
    const now = new Date()
    const start = new Date(target.period_start)
    const end = new Date(target.period_end)

    if (now < start) {
      return { status: "upcoming", label: "Upcoming", variant: "secondary" as const }
    } else if (now > end) {
      return { status: "expired", label: "Expired", variant: "outline" as const }
    } else {
      return { status: "active", label: "Active", variant: "default" as const }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              RPM Targets
            </CardTitle>
            <CardDescription>Set revenue per mile targets to track load profitability</CardDescription>
          </div>

          <Dialog
            open={showTargetDialog}
            onOpenChange={(open) => {
              setShowTargetDialog(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Set Target
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTarget ? "Edit RPM Target" : "Set RPM Target"}</DialogTitle>
                <DialogDescription>Define revenue per mile targets for load performance tracking</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetRpm">Target RPM ($)</Label>
                  <Input
                    id="targetRpm"
                    type="number"
                    step="0.01"
                    placeholder="3.50"
                    value={targetForm.targetRpm}
                    onChange={(e) => {
                      setTargetForm((prev) => ({ ...prev, targetRpm: e.target.value }))
                      if (errors.targetRpm) {
                        setErrors((prev) => ({ ...prev, targetRpm: "" }))
                      }
                    }}
                    className={errors.targetRpm ? "border-red-500" : ""}
                    disabled={saveLoading}
                  />
                  {errors.targetRpm && <p className="text-red-500 text-sm mt-1">{errors.targetRpm}</p>}
                </div>

                <div>
                  <Label htmlFor="periodStart">Period Start</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={targetForm.periodStart}
                    onChange={(e) => {
                      setTargetForm((prev) => ({ ...prev, periodStart: e.target.value }))
                      if (errors.periodStart) {
                        setErrors((prev) => ({ ...prev, periodStart: "" }))
                      }
                    }}
                    className={errors.periodStart ? "border-red-500" : ""}
                    disabled={saveLoading}
                  />
                  {errors.periodStart && <p className="text-red-500 text-sm mt-1">{errors.periodStart}</p>}
                </div>

                <div>
                  <Label htmlFor="periodEnd">Period End</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={targetForm.periodEnd}
                    onChange={(e) => {
                      setTargetForm((prev) => ({ ...prev, periodEnd: e.target.value }))
                      if (errors.periodEnd) {
                        setErrors((prev) => ({ ...prev, periodEnd: "" }))
                      }
                    }}
                    className={errors.periodEnd ? "border-red-500" : ""}
                    disabled={saveLoading}
                  />
                  {errors.periodEnd && <p className="text-red-500 text-sm mt-1">{errors.periodEnd}</p>}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTargetDialog(false)} disabled={saveLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTarget} disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      {editingTarget ? "Update Target" : "Set Target"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : targets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RPM targets set</h3>
            <p className="text-gray-500 mb-4">Set revenue per mile targets to track load profitability</p>
            <Button onClick={() => setShowTargetDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Set First Target
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Target Alert */}
            {targets.some(isTargetActive) && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Active Target:</strong> ${targets.find(isTargetActive)?.target_rpm.toFixed(2)}/mile (until{" "}
                  {format(new Date(targets.find(isTargetActive)!.period_end), "MMM d, yyyy")})
                </AlertDescription>
              </Alert>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target RPM</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((target) => {
                  const status = getTargetStatus(target)

                  return (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />${target.target_rpm.toFixed(2)}/mile
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{format(new Date(target.period_start), "MMM d, yyyy")}</div>
                            <div className="text-muted-foreground">
                              to {format(new Date(target.period_end), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{target.users?.name || "Unknown"}</TableCell>
                      <TableCell>{format(new Date(target.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTarget(target)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTarget(target.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
