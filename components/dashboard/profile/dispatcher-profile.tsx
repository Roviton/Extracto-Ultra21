"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2, Clock, Truck, XCircle } from "lucide-react"

interface DispatcherProfileProps {
  user: any
  isEditing: boolean
}

export function DispatcherProfile({ user, isEditing }: DispatcherProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for dispatcher profile
  const dispatcherData = {
    activeLoads: 5,
    completedLoads: 128,
    assignedDrivers: 8,
    performanceRating: 4.8,
    responseTime: "5 min",
    shiftsThisWeek: 4,
    hoursThisWeek: 32,
    recentActivity: [
      { action: "Assigned load #12345 to Driver Mike", time: "2 hours ago", status: "success" },
      { action: "Updated ETA for load #54321", time: "4 hours ago", status: "success" },
      { action: "Reported delay for load #98765", time: "Yesterday", status: "warning" },
      { action: "Rejected load #45678 (capacity issues)", time: "Yesterday", status: "error" },
    ],
    preferences: {
      notifications: true,
      emailAlerts: true,
      smsAlerts: false,
      darkMode: true,
      compactView: false,
    },
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Dispatcher Dashboard</CardTitle>
        <CardDescription>Manage your dispatcher profile, view statistics, and set preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Truck className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Active Loads</p>
                  <h3 className="text-2xl font-bold">{dispatcherData.activeLoads}</h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">{dispatcherData.completedLoads}</h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Clock className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <h3 className="text-2xl font-bold">{dispatcherData.responseTime}</h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <h3 className="text-2xl font-bold">{dispatcherData.performanceRating}</h3>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={user.name} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="Chicago, IL" disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  defaultValue="Experienced dispatcher with 5+ years in freight logistics. Specialized in time-sensitive deliveries and refrigerated transport."
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <div className="space-y-4">
                {dispatcherData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 pb-3 border-b last:border-0">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about load updates</p>
                  </div>
                  <Switch id="notifications" checked={dispatcherData.preferences.notifications} disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summary and urgent alerts via email</p>
                  </div>
                  <Switch id="emailAlerts" checked={dispatcherData.preferences.emailAlerts} disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsAlerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch id="smsAlerts" checked={dispatcherData.preferences.smsAlerts} disabled={!isEditing} />
                </div>
              </div>

              <h3 className="text-lg font-medium pt-4">Display Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                  </div>
                  <Switch id="darkMode" checked={dispatcherData.preferences.darkMode} disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactView">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Show more information in less space</p>
                  </div>
                  <Switch id="compactView" checked={dispatcherData.preferences.compactView} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
