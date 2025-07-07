"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"
import { Activity, AlertCircle, CheckCircle, Clock, Users } from "lucide-react"

type Dispatcher = {
  id: string
  name: string
  email: string
  avatar_url?: string
  total_loads: number
  completed_loads: number
  active_loads: number
  completion_rate: number
  last_activity: string
}

type AssignmentHistory = {
  id: string
  load_id: string
  load_reference: string
  driver_id: string
  driver_name: string
  assigned_by: string
  dispatcher_name: string
  assigned_at: string
  assignment_type: string
  reason?: string
}

export function DispatcherMonitoring() {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      try {
        // Fetch dispatchers with performance metrics
        const { data: dispatcherData, error: dispatcherError } = await supabase
          .from("users")
          .select("id, name, email, avatar_url")
          .eq("role", "dispatcher")

        if (dispatcherError) throw dispatcherError

        // For each dispatcher, fetch their performance metrics
        const dispatchersWithMetrics = await Promise.all(
          dispatcherData.map(async (dispatcher) => {
            // Get total loads assigned by this dispatcher
            const { count: totalLoads } = await supabase
              .from("load_drivers")
              .select("*", { count: "exact", head: true })
              .eq("assigned_by", dispatcher.id)

            // Get completed loads
            const { count: completedLoads } = await supabase
              .from("load_drivers")
              .select("*", { count: "exact", head: true })
              .eq("assigned_by", dispatcher.id)
              .eq("status", "completed")

            // Get active loads
            const { count: activeLoads } = await supabase
              .from("load_drivers")
              .select("*", { count: "exact", head: true })
              .eq("assigned_by", dispatcher.id)
              .in("status", ["assigned", "in_progress"])

            // Get last activity
            const { data: lastActivity } = await supabase
              .from("load_drivers")
              .select("created_at")
              .eq("assigned_by", dispatcher.id)
              .order("created_at", { ascending: false })
              .limit(1)

            const completionRate = totalLoads > 0 ? (completedLoads / totalLoads) * 100 : 0

            return {
              ...dispatcher,
              total_loads: totalLoads || 0,
              completed_loads: completedLoads || 0,
              active_loads: activeLoads || 0,
              completion_rate: completionRate,
              last_activity: lastActivity?.[0]?.created_at || "Never",
            }
          }),
        )

        setDispatchers(dispatchersWithMetrics)

        // Fetch assignment history
        const { data: historyData, error: historyError } = await supabase
          .from("assignment_history")
          .select(`
            id, 
            load_id,
            loads(reference_number),
            driver_id,
            drivers(name),
            assigned_by,
            users(name),
            assigned_at,
            assignment_type,
            reason
          `)
          .order("assigned_at", { ascending: false })
          .limit(50)

        if (historyError) throw historyError

        const formattedHistory = historyData.map((item) => ({
          id: item.id,
          load_id: item.load_id,
          load_reference: item.loads?.reference_number || "Unknown",
          driver_id: item.driver_id,
          driver_name: item.drivers?.name || "Unknown",
          assigned_by: item.assigned_by,
          dispatcher_name: item.users?.name || "Unknown",
          assigned_at: item.assigned_at,
          assignment_type: item.assignment_type,
          reason: item.reason,
        }))

        setAssignmentHistory(formattedHistory)
      } catch (error) {
        console.error("Error fetching monitoring data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  function getCompletionRateColor(rate: number) {
    if (rate >= 80) return "bg-green-500"
    if (rate >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  function getAssignmentTypeColor(type: string) {
    switch (type) {
      case "initial":
        return "bg-blue-500"
      case "reassignment":
        return "bg-yellow-500"
      case "unassignment":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="overview">Dispatcher Overview</TabsTrigger>
        <TabsTrigger value="history">Assignment History</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dispatchers.length > 0 ? (
            dispatchers.map((dispatcher) => (
              <Card key={dispatcher.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={dispatcher.avatar_url || ""} alt={dispatcher.name} />
                        <AvatarFallback>{dispatcher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{dispatcher.name}</CardTitle>
                        <CardDescription className="text-xs">{dispatcher.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={dispatcher.active_loads > 0 ? "default" : "outline"}>
                      {dispatcher.active_loads > 0 ? "Active" : "Idle"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">{dispatcher.completion_rate.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={dispatcher.completion_rate}
                        className={getCompletionRateColor(dispatcher.completion_rate)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Total</span>
                        <p className="font-medium">{dispatcher.total_loads}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Completed</span>
                        <p className="font-medium">{dispatcher.completed_loads}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Active</span>
                        <p className="font-medium">{dispatcher.active_loads}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Last activity: {formatDate(dispatcher.last_activity)}
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-center">No Dispatchers Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No dispatchers are currently registered in the system.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Assignment History</CardTitle>
            <CardDescription>Recent driver assignments and changes made by dispatchers</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentHistory.length > 0 ? (
              <div className="space-y-4">
                {assignmentHistory.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                    <div className={`rounded-full p-2 ${getAssignmentTypeColor(item.assignment_type)}`}>
                      {item.assignment_type === "initial" && <CheckCircle className="h-4 w-4 text-white" />}
                      {item.assignment_type === "reassignment" && <Activity className="h-4 w-4 text-white" />}
                      {item.assignment_type === "unassignment" && <AlertCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Load #{item.load_reference} - {item.driver_name}
                        </p>
                        <Badge variant="outline">{item.assignment_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assigned by {item.dispatcher_name} on {formatDate(item.assigned_at)}
                      </p>
                      {item.reason && <p className="text-sm mt-1 bg-muted p-2 rounded-md">Reason: {item.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No assignment history found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
