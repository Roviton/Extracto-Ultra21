"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, ArrowUpDown, MessageSquare, FileText, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface DispatcherPerformanceTableProps {
  timeRange: string
}

export function DispatcherPerformanceTable({ timeRange }: DispatcherPerformanceTableProps) {
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // This would come from your API in a real application
  const dispatchers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
      loadsAssigned: 32,
      loadsCompleted: 28,
      responseTime: "8 min",
      onTimeRate: 96.4,
      customerRating: 4.8,
      efficiencyScore: 94,
      status: "excellent",
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/microphone-concert-stage.png",
      loadsAssigned: 27,
      loadsCompleted: 25,
      responseTime: "12 min",
      onTimeRate: 92.0,
      customerRating: 4.6,
      efficiencyScore: 88,
      status: "good",
    },
    {
      id: 3,
      name: "Jessica Williams",
      avatar: "/intertwined-letters.png",
      loadsAssigned: 19,
      loadsCompleted: 15,
      responseTime: "22 min",
      onTimeRate: 78.9,
      customerRating: 3.9,
      efficiencyScore: 65,
      status: "needs-improvement",
    },
    {
      id: 4,
      name: "David Rodriguez",
      avatar: "/abstract-geometric-DR.png",
      loadsAssigned: 24,
      loadsCompleted: 22,
      responseTime: "10 min",
      onTimeRate: 91.7,
      customerRating: 4.5,
      efficiencyScore: 86,
      status: "good",
    },
    {
      id: 5,
      name: "Emily Taylor",
      avatar: "/et-phone-home.png",
      loadsAssigned: 18,
      loadsCompleted: 12,
      responseTime: "25 min",
      onTimeRate: 66.7,
      customerRating: 3.2,
      efficiencyScore: 58,
      status: "critical",
    },
  ]

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-500">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-500">Good</Badge>
      case "needs-improvement":
        return <Badge className="bg-yellow-500">Needs Improvement</Badge>
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 font-medium"
              >
                Dispatcher
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("loadsAssigned")}
                className="flex items-center gap-1 font-medium"
              >
                Loads Assigned
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("responseTime")}
                className="flex items-center gap-1 font-medium"
              >
                Avg. Response
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("onTimeRate")}
                className="flex items-center gap-1 font-medium"
              >
                On-Time Rate
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("customerRating")}
                className="flex items-center gap-1 font-medium"
              >
                Customer Rating
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("efficiencyScore")}
                className="flex items-center gap-1 font-medium"
              >
                Efficiency
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dispatchers.map((dispatcher) => (
            <TableRow key={dispatcher.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
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
                    <div className="text-sm text-muted-foreground">ID: {dispatcher.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {dispatcher.loadsAssigned}
                <div className="text-xs text-muted-foreground">{dispatcher.loadsCompleted} completed</div>
              </TableCell>
              <TableCell className="text-right">{dispatcher.responseTime}</TableCell>
              <TableCell className="text-right">{dispatcher.onTimeRate}%</TableCell>
              <TableCell className="text-right">{dispatcher.customerRating}/5.0</TableCell>
              <TableCell>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-right">{dispatcher.efficiencyScore}%</div>
                  <Progress value={dispatcher.efficiencyScore} className="h-2 w-16" />
                </div>
              </TableCell>
              <TableCell className="text-right">{getStatusBadge(dispatcher.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>View Full Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Send Feedback</span>
                    </DropdownMenuItem>
                    {(dispatcher.status === "needs-improvement" || dispatcher.status === "critical") && (
                      <DropdownMenuItem>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Schedule Coaching</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
