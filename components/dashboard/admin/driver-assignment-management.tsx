"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserCheck, Truck, ArrowRightLeft, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

interface Driver {
  id: string
  name: string
  phone?: string
  email?: string
  status: string
  avatar_url?: string
}

interface Dispatcher {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface DriverAssignment {
  id: string
  driver_id: string
  dispatcher_id: string
  assigned_at: string
  driver: Driver
  dispatcher: Dispatcher
}

export function DriverAssignmentManagement() {
  const [assignments, setAssignments] = useState<DriverAssignment[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [selectedDispatcher, setSelectedDispatcher] = useState<string>("")
  const [assignLoading, setAssignLoading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.companyId) {
      loadData()
    }
  }, [user?.companyId])

  const loadData = async () => {
    if (!user?.companyId) return

    setLoading(true)
    try {
      // Load driver assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("driver_assignments")
        .select(`
          *,
          driver:drivers(*),
          dispatcher:users(*)
        `)
        .eq("driver.company_id", user.companyId)

      if (assignmentsError) {
        console.error("Error loading assignments:", assignmentsError)
      } else {
        setAssignments(assignmentsData || [])
      }

      // Load all drivers
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("*")
        .eq("company_id", user.companyId)
        .eq("is_active", true)
        .order("name")

      if (driversError) {
        console.error("Error loading drivers:", driversError)
      } else {
        setDrivers(driversData || [])
      }

      // Load all dispatchers
      const { data: dispatchersData, error: dispatchersError } = await supabase
        .from("users")
        .select("*")
        .eq("company_id", user.companyId)
        .eq("role", "dispatcher")
        .eq("is_active", true)
        .order("name")

      if (dispatchersError) {
        console.error("Error loading dispatchers:", dispatchersError)
      } else {
        setDispatchers(dispatchersData || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load driver assignments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = async () => {
    if (!selectedDriver || !selectedDispatcher || !user?.id) {
      toast({
        title: "Error",
        description: "Please select both a driver and dispatcher",
        variant: "destructive",
      })
      return
    }

    setAssignLoading(true)
    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from("driver_assignments")
        .select("id")
        .eq("driver_id", selectedDriver)
        .eq("dispatcher_id", selectedDispatcher)
        .maybeSingle()

      if (existingAssignment) {
        toast({
          title: "Assignment Exists",
          description: "This driver is already assigned to the selected dispatcher",
          variant: "destructive",
        })
        setAssignLoading(false)
        return
      }

      // Create new assignment
      const { error } = await supabase.from("driver_assignments").insert({
        driver_id: selectedDriver,
        dispatcher_id: selectedDispatcher,
        assigned_by: user.id,
      })

      if (error) {
        console.error("Error creating assignment:", error)
        toast({
          title: "Error",
          description: "Failed to assign driver",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Driver Assigned",
          description: "Driver has been successfully assigned to dispatcher",
        })

        // Reset form and close dialog
        setSelectedDriver("")
        setSelectedDispatcher("")
        setShowAssignDialog(false)

        // Reload data
        loadData()
      }
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      })
    } finally {
      setAssignLoading(false)
    }
  }

  const handleUnassignDriver = async (assignmentId: string, driverName: string, dispatcherName: string) => {
    try {
      const { error } = await supabase.from("driver_assignments").delete().eq("id", assignmentId)

      if (error) {
        console.error("Error removing assignment:", error)
        toast({
          title: "Error",
          description: "Failed to remove driver assignment",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Assignment Removed",
          description: `${driverName} has been unassigned from ${dispatcherName}`,
        })
        loadData()
      }
    } catch (error) {
      console.error("Error removing assignment:", error)
      toast({
        title: "Error",
        description: "Failed to remove driver assignment",
        variant: "destructive",
      })
    }
  }

  const getUnassignedDrivers = () => {
    const assignedDriverIds = assignments.map((a) => a.driver_id)
    return drivers.filter((driver) => !assignedDriverIds.includes(driver.id))
  }

  const getDriversByDispatcher = () => {
    const dispatcherDrivers: { [key: string]: DriverAssignment[] } = {}

    assignments.forEach((assignment) => {
      const dispatcherId = assignment.dispatcher_id
      if (!dispatcherDrivers[dispatcherId]) {
        dispatcherDrivers[dispatcherId] = []
      }
      dispatcherDrivers[dispatcherId].push(assignment)
    })

    return dispatcherDrivers
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const unassignedDrivers = getUnassignedDrivers()
  const driversByDispatcher = getDriversByDispatcher()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Driver Assignments
              </CardTitle>
              <CardDescription>Manage which dispatchers are responsible for which drivers</CardDescription>
            </div>

            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Driver to Dispatcher</DialogTitle>
                  <DialogDescription>Select a driver and dispatcher to create an assignment</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Driver</label>
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={driver.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {driver.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {driver.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Dispatcher</label>
                    <Select value={selectedDispatcher} onValueChange={setSelectedDispatcher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dispatcher" />
                      </SelectTrigger>
                      <SelectContent>
                        {dispatchers.map((dispatcher) => (
                          <SelectItem key={dispatcher.id} value={dispatcher.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={dispatcher.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {dispatcher.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {dispatcher.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={assignLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignDriver} disabled={assignLoading}>
                    {assignLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Assign Driver
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Unassigned Drivers */}
      {unassignedDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Unassigned Drivers ({unassignedDrivers.length})
            </CardTitle>
            <CardDescription>These drivers are not assigned to any dispatcher</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={driver.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.phone}</p>
                  </div>
                  <Badge variant="outline">{driver.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispatcher Assignments */}
      <div className="grid gap-6">
        {dispatchers.map((dispatcher) => {
          const assignedDrivers = driversByDispatcher[dispatcher.id] || []

          return (
            <Card key={dispatcher.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={dispatcher.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {dispatcher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {dispatcher.name}
                  <Badge variant="secondary">{assignedDrivers.length} drivers</Badge>
                </CardTitle>
                <CardDescription>{dispatcher.email}</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedDrivers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No drivers assigned</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedDrivers.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={assignment.driver.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {assignment.driver.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {assignment.driver.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {assignment.driver.phone && <p>{assignment.driver.phone}</p>}
                              {assignment.driver.email && <p>{assignment.driver.email}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.driver.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUnassignDriver(assignment.id, assignment.driver.name, dispatcher.name)
                              }
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
