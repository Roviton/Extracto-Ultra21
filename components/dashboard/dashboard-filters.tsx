"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronDown, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DashboardFiltersProps {
  onNewLoad: () => void
}

export function DashboardFilters({ onNewLoad }: DashboardFiltersProps) {
  const [date, setDate] = useState<Date>()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Status
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>New</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Assigned</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Accepted</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>In Progress</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Completed</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Refused</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Driver
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Driver</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>All Drivers</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>John Smith</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Sarah Johnson</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Mike Williams</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Tom Davis</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Customer
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Customer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>All Customers</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Acme Logistics</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Global Transport Inc.</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>FastFreight Co.</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Prime Shipping LLC</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-8 justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {date ? format(date, "PPP") : "Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-8">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button size="sm" className="h-8" onClick={onNewLoad}>
          + New Load
        </Button>
      </div>
    </div>
  )
}
