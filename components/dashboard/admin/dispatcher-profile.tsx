"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ChevronDown,
  Clock,
  Edit,
  FileText,
  Flag,
  MessageSquare,
  MoreHorizontal,
  PlusCircle,
  Star,
  Truck,
  UserCog,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Mock data
const dispatcher = {
  id: "disp-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "(555) 123-4567",
  avatar: "/emergency-dispatcher.png",
  role: "Senior Dispatcher",
  status: "Active",
  joinDate: "March 15, 2022",
  metrics: {
    loadsAssigned: 128,
    avgResponseTime: "8 min",
    onTimeRate: 94.2,
    customerRating: 4.8,
    efficiency: 87.5,
    targetRPM: 2.85,
    currentRPM: 2.92,
    targetLoads: 130,
    targetRevenue: 85000,
    currentRevenue: 78500,
  },
}

const assignedDrivers = [
  { id: "drv-001", name: "Michael Brown", status: "On Duty", loads: 3, avatar: "/professional-driver.png" },
  { id: "drv-002", name: "David Wilson", status: "Off Duty", loads: 0, avatar: "/abstract-geometric-DR.png" },
  { id: "drv-003", name: "Lisa Garcia", status: "On Duty", loads: 2, avatar: "/abstract-geometric-TD.png" },
  { id: "drv-004", name: "Robert Taylor", status: "On Duty", loads: 1, avatar: "/abstract-dw.png" },
  { id: "drv-005", name: "Jennifer Martinez", status: "Off Duty", loads: 0, avatar: "/abstract-geometric-mg.png" },
]

const activeLoads = [
  {
    id: "LD-4392",
    customer: "Acme Logistics",
    status: "In Transit",
    driver: "Michael Brown",
    pickupDate: "2023-05-20",
    deliveryDate: "2023-05-22",
    rate: 2850,
  },
  {
    id: "LD-4401",
    customer: "Global Transport",
    status: "Assigned",
    driver: "Lisa Garcia",
    pickupDate: "2023-05-21",
    deliveryDate: "2023-05-23",
    rate: 3200,
  },
  {
    id: "LD-4415",
    customer: "FastFreight",
    status: "At Pickup",
    driver: "Robert Taylor",
    pickupDate: "2023-05-20",
    deliveryDate: "2023-05-21",
    rate: 1950,
  },
  {
    id: "LD-4422",
    customer: "Summit Supply",
    status: "Pending Assignment",
    driver: null,
    pickupDate: "2023-05-22",
    deliveryDate: "2023-05-24",
    rate: 2750,
  },
  {
    id: "LD-4430",
    customer: "Velocity Logistics",
    status: "In Transit",
    driver: "Lisa Garcia",
    pickupDate: "2023-05-19",
    deliveryDate: "2023-05-21",
    rate: 3100,
  },
]

const activityLog = [
  { id: 1, type: "message", description: "Sent update to broker for load LD-4392", time: "Today, 10:23 AM" },
  { id: 2, type: "issue", description: "Flagged delay for load LD-4401 due to traffic", time: "Today, 9:15 AM" },
  { id: 3, type: "assignment", description: "Assigned load LD-4415 to Robert Taylor", time: "Yesterday, 4:30 PM" },
  { id: 4, type: "message", description: "Sent pickup instructions to Michael Brown", time: "Yesterday, 2:45 PM" },
  { id: 5, type: "update", description: "Updated delivery time for load LD-4430", time: "Yesterday, 11:20 AM" },
  { id: 6, type: "message", description: "Sent broker update for load LD-4430", time: "2 days ago, 3:15 PM" },
  {
    id: 7,
    type: "issue",
    description: "Resolved detention issue at pickup for load LD-4392",
    time: "2 days ago, 1:30 PM",
  },
  { id: 8, type: "assignment", description: "Assigned load LD-4430 to Lisa Garcia", time: "3 days ago, 10:45 AM" },
]

const performanceData = [
  { month: "Jan", loads: 112, responseTime: 12, onTimeRate: 91, rating: 4.6, rpm: 2.75 },
  { month: "Feb", loads: 118, responseTime: 10, onTimeRate: 92, rating: 4.7, rpm: 2.78 },
  { month: "Mar", loads: 125, responseTime: 9, onTimeRate: 93, rating: 4.7, rpm: 2.82 },
  { month: "Apr", loads: 122, responseTime: 8, onTimeRate: 94, rating: 4.8, rpm: 2.88 },
  { month: "May", loads: 128, responseTime: 8, onTimeRate: 94, rating: 4.8, rpm: 2.92 },
]

const adminNotes = [
  {
    id: 1,
    author: "Admin",
    date: "May 15, 2023",
    content:
      "Sarah has shown consistent improvement in response times over the last quarter. Her broker communication is excellent.",
  },
  {
    id: 2,
    author: "Manager",
    date: "April 3, 2023",
    content:
      "Discussed strategies for improving on-time delivery rates. Sarah is implementing new driver coordination techniques.",
  },
]

export function DispatcherProfile({ dispatcherId }: { dispatcherId: string }) {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("monthly")
  const [noteContent, setNoteContent] = useState("")
  const [showReassignDialog, setShowReassignDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <h1 className="text-2xl font-bold">Dispatcher Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Flag className="mr-2 h-4 w-4" />
                Performance Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initiate Performance Review</DialogTitle>
                <DialogDescription>
                  This will start a formal performance review process for Sarah Johnson.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Review Type</h4>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select review type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Review</SelectItem>
                      <SelectItem value="quarterly">Quarterly Review</SelectItem>
                      <SelectItem value="performance">Performance Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Reviewer</h4>
                  <Select defaultValue="admin">
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (You)</SelectItem>
                      <SelectItem value="manager">Operations Manager</SelectItem>
                      <SelectItem value="hr">HR Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <Textarea placeholder="Add initial notes for the review..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button onClick={() => {}}>Start Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dispatcher Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowReassignDialog(true)}>
                <UserCog className="mr-2 h-4 w-4" />
                Reassign Drivers
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile & Permissions
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                Flag for Attention
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dispatcher Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <CardTitle>{dispatcher.name}</CardTitle>
                <CardDescription>{dispatcher.role}</CardDescription>
              </div>
              <Badge variant={dispatcher.status === "Active" ? "default" : "secondary"}>{dispatcher.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center py-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={dispatcher.avatar || "/placeholder.svg"} alt={dispatcher.name} />
                  <AvatarFallback>
                    {dispatcher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{dispatcher.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{dispatcher.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{dispatcher.joinDate}</span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Performance Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Loads Assigned</div>
                      <div className="text-lg font-bold">{dispatcher.metrics.loadsAssigned}</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Response Time</div>
                      <div className="text-lg font-bold">{dispatcher.metrics.avgResponseTime}</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-xs text-muted-foreground">On-Time Rate</div>
                      <div className="text-lg font-bold">{dispatcher.metrics.onTimeRate}%</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Customer Rating</div>
                      <div className="text-lg font-bold flex items-center">
                        {dispatcher.metrics.customerRating}
                        <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Achievement Card */}
        <Card>
          <CardHeader>
            <CardTitle>Target Achievement</CardTitle>
            <CardDescription>Monthly performance against targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Rate Per Mile</span>
                <span className="text-sm font-medium">
                  ${dispatcher.metrics.currentRPM} / ${dispatcher.metrics.targetRPM}
                </span>
              </div>
              <Progress value={(dispatcher.metrics.currentRPM / dispatcher.metrics.targetRPM) * 100} className="h-2" />
              <div className="text-xs text-right text-green-600">
                +${(dispatcher.metrics.currentRPM - dispatcher.metrics.targetRPM).toFixed(2)} above target
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Load Volume</span>
                <span className="text-sm font-medium">
                  {dispatcher.metrics.loadsAssigned} / {dispatcher.metrics.targetLoads}
                </span>
              </div>
              <Progress
                value={(dispatcher.metrics.loadsAssigned / dispatcher.metrics.targetLoads) * 100}
                className="h-2"
              />
              <div className="text-xs text-right text-amber-600">
                {dispatcher.metrics.targetLoads - dispatcher.metrics.loadsAssigned} loads to target
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-sm font-medium">
                  ${(dispatcher.metrics.currentRevenue / 1000).toFixed(1)}k / $
                  {(dispatcher.metrics.targetRevenue / 1000).toFixed(1)}k
                </span>
              </div>
              <Progress
                value={(dispatcher.metrics.currentRevenue / dispatcher.metrics.targetRevenue) * 100}
                className="h-2"
              />
              <div className="text-xs text-right text-amber-600">
                ${(dispatcher.metrics.targetRevenue - dispatcher.metrics.currentRevenue).toLocaleString()} to target
              </div>
            </div>

            <div className="pt-4">
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium mb-2">Overall Target Achievement</h4>
                <div className="flex items-center justify-between">
                  <Progress value={92} className="h-3 flex-1 mr-4" />
                  <span className="text-lg font-bold">92%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sarah is on track to meet or exceed most targets this month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Drivers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Assigned Drivers</CardTitle>
              <CardDescription>{assignedDrivers.length} drivers currently assigned</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowReassignDialog(true)}>
              <UserCog className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Active Loads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                          <AvatarFallback>
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{driver.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.status === "On Duty" ? "default" : "secondary"}>{driver.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{driver.loads}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loads" className="mt-6">
        <TabsList>
          <TabsTrigger value="loads">Current Loads</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="notes">Admin Notes</TabsTrigger>
        </TabsList>

        {/* Current Loads Tab */}
        <TabsContent value="loads" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Active Load Assignments</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>{activeLoads.length} loads currently being managed by this dispatcher</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoads.map((load) => (
                    <TableRow key={load.id}>
                      <TableCell className="font-medium">{load.id}</TableCell>
                      <TableCell>{load.customer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            load.status === "In Transit"
                              ? "default"
                              : load.status === "Assigned"
                                ? "secondary"
                                : load.status === "At Pickup"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {load.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{load.driver || "—"}</TableCell>
                      <TableCell>{new Date(load.pickupDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(load.deliveryDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${load.rate.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Message Driver</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Trends</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Historical performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Loads Assigned</h3>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      loads: {
                        label: "Loads",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="loads" stroke="var(--color-loads)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Response Time (minutes)</h3>
                  <div className="h-[200px]">
                    <ChartContainer
                      config={{
                        responseTime: {
                          label: "Response Time",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="responseTime"
                            stroke="var(--color-responseTime)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">On-Time Rate (%)</h3>
                  <div className="h-[200px]">
                    <ChartContainer
                      config={{
                        onTimeRate: {
                          label: "On-Time Rate",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <XAxis dataKey="month" />
                          <YAxis domain={[85, 100]} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="onTimeRate" stroke="var(--color-onTimeRate)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Customer Rating</h3>
                  <div className="h-[200px]">
                    <ChartContainer
                      config={{
                        rating: {
                          label: "Rating",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <XAxis dataKey="month" />
                          <YAxis domain={[4, 5]} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="rating" stroke="var(--color-rating)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Rate Per Mile ($)</h3>
                  <div className="h-[200px]">
                    <ChartContainer
                      config={{
                        rpm: {
                          label: "RPM",
                          color: "hsl(var(--chart-5))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <XAxis dataKey="month" />
                          <YAxis domain={[2.5, 3]} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="rpm" stroke="var(--color-rpm)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">Performance Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Sarah has shown consistent improvement across all key metrics over the past 5 months. Response time
                  has decreased by 33% while maintaining a high on-time delivery rate. Customer ratings have improved,
                  and she has consistently exceeded the target RPM.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication & Activity Log</CardTitle>
              <CardDescription>Recent dispatcher activities and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3">
                      <div className="mt-0.5">
                        {activity.type === "message" ? (
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        ) : activity.type === "issue" ? (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : activity.type === "assignment" ? (
                          <Truck className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Summary:</span> 24 messages sent, 3 issues flagged, 5 loads assigned in
                  the past week
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Full Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Admin Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes & Feedback</CardTitle>
              <CardDescription>Internal notes about this dispatcher's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{note.author}</div>
                      <div className="text-sm text-muted-foreground">{note.date}</div>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Add New Note</h3>
                  <Textarea
                    placeholder="Add internal notes or feedback about this dispatcher..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Driver Reassignment Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reassign Drivers</DialogTitle>
            <DialogDescription>Reassign drivers from Sarah Johnson to another dispatcher.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Loads</TableHead>
                  <TableHead>Reassign To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                          <AvatarFallback>
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{driver.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.status === "On Duty" ? "default" : "secondary"}>{driver.status}</Badge>
                    </TableCell>
                    <TableCell>{driver.loads}</TableCell>
                    <TableCell>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select dispatcher" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john">John Smith</SelectItem>
                          <SelectItem value="maria">Maria Rodriguez</SelectItem>
                          <SelectItem value="alex">Alex Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowReassignDialog(false)}>Confirm Reassignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
