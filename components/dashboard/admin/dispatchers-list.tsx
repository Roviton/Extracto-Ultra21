"use client"

import Link from "next/link"
import { ArrowUpDown, ChevronDown, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data
const dispatchers = [
  {
    id: "disp-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "/emergency-dispatcher.png",
    status: "Active",
    drivers: 5,
    loads: 128,
    onTimeRate: 94.2,
    targetAchievement: 92,
    attention: false,
  },
  {
    id: "disp-002",
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "/abstract-geometric-DR.png",
    status: "Active",
    drivers: 4,
    loads: 112,
    onTimeRate: 91.5,
    targetAchievement: 88,
    attention: false,
  },
  {
    id: "disp-003",
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    avatar: "/abstract-geometric-TD.png",
    status: "Active",
    drivers: 6,
    loads: 145,
    onTimeRate: 95.8,
    targetAchievement: 97,
    attention: false,
  },
  {
    id: "disp-004",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/abstract-dw.png",
    status: "Active",
    drivers: 3,
    loads: 98,
    onTimeRate: 89.3,
    targetAchievement: 82,
    attention: true,
  },
  {
    id: "disp-005",
    name: "Jessica Williams",
    email: "jessica.williams@example.com",
    avatar: "/abstract-geometric-mg.png",
    status: "On Leave",
    drivers: 0,
    loads: 0,
    onTimeRate: 93.7,
    targetAchievement: 0,
    attention: false,
  },
]

export function DispatchersList() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dispatcher Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Dispatcher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Dispatchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatchers.filter((d) => d.status === "Active").length}</div>
            <p className="text-xs text-muted-foreground">
              {dispatchers.length} total ({dispatchers.filter((d) => d.status !== "Active").length} inactive)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. On-Time Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dispatchers.filter((d) => d.status === "Active").reduce((acc, d) => acc + d.onTimeRate, 0) /
                dispatchers.filter((d) => d.status === "Active").length
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Target Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dispatchers.filter((d) => d.status === "Active").reduce((acc, d) => acc + d.targetAchievement, 0) /
                dispatchers.filter((d) => d.status === "Active").length
              ).toFixed(0)}
              %
            </div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatchers.filter((d) => d.attention).length}</div>
            <p className="text-xs text-muted-foreground">Dispatchers below target thresholds</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Dispatchers</CardTitle>
              <CardDescription>Manage and monitor your dispatch team</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search dispatchers..." className="pl-8 w-full sm:w-[250px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    View
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Active Dispatchers</DropdownMenuItem>
                  <DropdownMenuItem>All Dispatchers</DropdownMenuItem>
                  <DropdownMenuItem>Attention Required</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sort by Performance</DropdownMenuItem>
                  <DropdownMenuItem>Sort by Load Volume</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispatcher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Drivers
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Loads
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    On-Time Rate
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Target Achievement
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatchers.map((dispatcher) => (
                <TableRow
                  key={dispatcher.id}
                  className={dispatcher.attention ? "bg-amber-50 dark:bg-amber-950/20" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={dispatcher.avatar || "/placeholder.svg"} alt={dispatcher.name} />
                        <AvatarFallback>
                          {dispatcher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{dispatcher.name}</div>
                        <div className="text-xs text-muted-foreground">{dispatcher.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dispatcher.status === "Active" ? "default" : "secondary"}>
                      {dispatcher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dispatcher.drivers}</TableCell>
                  <TableCell>{dispatcher.loads}</TableCell>
                  <TableCell>{dispatcher.onTimeRate}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={dispatcher.targetAchievement} className="h-2 w-[60px]" />
                      <span>{dispatcher.targetAchievement}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/dispatchers/${dispatcher.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>Manage Drivers</DropdownMenuItem>
                          <DropdownMenuItem>Set Targets</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
