"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

// Sample driver RPM data
const driverRPMData = [
  {
    id: "D-1001",
    name: "John Smith",
    avatar: "/javascript-code.png",
    totalMiles: 12450,
    totalRevenue: 39840,
    averageRPM: 3.2,
    loadsCompleted: 24,
    belowThresholdLoads: 2,
    belowThresholdPercentage: 8.3,
    notes: "Consistently performs well on long-haul routes.",
  },
  {
    id: "D-1002",
    name: "Sarah Johnson",
    avatar: "/stylized-letters-sj.png",
    totalMiles: 9870,
    totalRevenue: 32571,
    averageRPM: 3.3,
    loadsCompleted: 19,
    belowThresholdLoads: 1,
    belowThresholdPercentage: 5.3,
    notes: "",
  },
  {
    id: "D-1003",
    name: "Mike Williams",
    avatar: "/intertwined-letters.png",
    totalMiles: 15600,
    totalRevenue: 43680,
    averageRPM: 2.8,
    loadsCompleted: 28,
    belowThresholdLoads: 9,
    belowThresholdPercentage: 32.1,
    notes: "Needs coaching on route selection and load negotiation.",
  },
  {
    id: "D-1004",
    name: "Tom Davis",
    avatar: "/abstract-geometric-TD.png",
    totalMiles: 6400,
    totalRevenue: 19200,
    averageRPM: 3.0,
    loadsCompleted: 12,
    belowThresholdLoads: 3,
    belowThresholdPercentage: 25.0,
    notes: "",
  },
  {
    id: "D-1005",
    name: "Lisa Brown",
    avatar: "/stylized-letter-lb.png",
    totalMiles: 10250,
    totalRevenue: 35875,
    averageRPM: 3.5,
    loadsCompleted: 20,
    belowThresholdLoads: 0,
    belowThresholdPercentage: 0,
    notes: "Excellent performance. Consider for premium routes.",
  },
]

export function DriverRPMReport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [driverNotes, setDriverNotes] = useState<Record<string, string>>(
    driverRPMData.reduce((acc, driver) => ({ ...acc, [driver.id]: driver.notes }), {}),
  )
  const { toast } = useToast()

  const filteredData = (driverRPMData || []).filter(
    (driver) =>
      driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    toast({
      title: "Report Export Started",
      description: `Your ${format.toUpperCase()} report is being generated and will download shortly.`,
    })
  }

  const handleNoteChange = (driverId: string, note: string) => {
    setDriverNotes((prev) => ({ ...prev, [driverId]: note }))
  }

  const handleNoteSave = (driverId: string) => {
    toast({
      title: "Notes Saved",
      description: "Driver notes have been updated successfully.",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("xlsx")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>PDF (.pdf)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Total Miles</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
              <TableHead className="text-right">Average RPM</TableHead>
              <TableHead className="text-right">Loads Completed</TableHead>
              <TableHead className="text-right">Below Threshold %</TableHead>
              <TableHead>Manager Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((driver) => (
                <TableRow
                  key={driver.id}
                  className={cn(
                    driver.belowThresholdPercentage > 20
                      ? "bg-red-50/30 dark:bg-red-950/10"
                      : driver.belowThresholdPercentage === 0
                        ? "bg-green-50/30 dark:bg-green-950/10"
                        : undefined,
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        <AvatarFallback>
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">{driver.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(driver.totalMiles)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(driver.totalRevenue)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        driver.averageRPM < 3.0
                          ? "text-red-600 dark:text-red-400"
                          : driver.averageRPM >= 3.3
                            ? "text-green-600 dark:text-green-400"
                            : undefined,
                      )}
                    >
                      ${driver.averageRPM.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{driver.loadsCompleted}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        driver.belowThresholdPercentage > 20
                          ? "destructive"
                          : driver.belowThresholdPercentage === 0
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {driver.belowThresholdPercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Add notes..."
                        value={driverNotes[driver.id] || ""}
                        onChange={(e) => handleNoteChange(driver.id, e.target.value)}
                        className="min-h-[60px] text-xs"
                      />
                      <Button size="sm" variant="outline" className="ml-auto" onClick={() => handleNoteSave(driver.id)}>
                        Save
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
