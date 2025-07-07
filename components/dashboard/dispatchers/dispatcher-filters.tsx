"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Download, Filter } from "lucide-react"

interface DispatcherFiltersProps {
  timeRange: string
  setTimeRange: (range: string) => void
}

export function DispatcherFilters({ timeRange, setTimeRange }: DispatcherFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{timeRange === "day" ? "Today" : timeRange === "week" ? "This Week" : "This Month"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Time Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={timeRange} onValueChange={setTimeRange}>
            <DropdownMenuRadioItem value="day">Today</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="all">
            <DropdownMenuRadioItem value="all">All Dispatchers</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="active">Active Only</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="critical">Critical Issues</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="top">Top Performers</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Download className="h-3.5 w-3.5" />
        <span>Export</span>
      </Button>
    </div>
  )
}
