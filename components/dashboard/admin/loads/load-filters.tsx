"use client"

import { useEffect, useState } from "react"
import { Search, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase-client"
import type { LoadFilters as LoadFiltersType } from "@/hooks/use-admin-loads"

interface LoadFiltersProps {
  filters: LoadFiltersType
  onFiltersChange: (filters: LoadFiltersType) => void
}

export function LoadFilters({ filters, onFiltersChange }: LoadFiltersProps) {
  const [dispatchers, setDispatchers] = useState<{ id: string; name: string }[]>([])
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFilterData() {
      setLoading(true)
      try {
        // Fetch dispatchers
        const { data: dispatchersData } = await supabase
          .from("users")
          .select("id, name")
          .eq("role", "dispatcher")
          .order("name")

        if (dispatchersData) {
          setDispatchers(dispatchersData)
        }

        // Fetch customers
        const { data: customersData } = await supabase.from("customers").select("id, name").order("name")

        if (customersData) {
          setCustomers(customersData)
        }

        // Fetch unique statuses
        const { data: statusesData } = await supabase.from("loads").select("status").order("status")

        if (statusesData) {
          const uniqueStatuses = [...new Set(statusesData.map((item) => item.status))].filter(Boolean)
          setStatuses(uniqueStatuses)
        }
      } catch (error) {
        console.error("Error fetching filter data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [])

  const handleSearch = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, statuses: [] })
    } else {
      onFiltersChange({ ...filters, statuses: [value] })
    }
  }

  const handleDispatcherChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, dispatchers: [] })
    } else {
      const dispatcher = dispatchers.find((d) => d.id === value)
      if (dispatcher) {
        onFiltersChange({ ...filters, dispatchers: [dispatcher.name] })
      }
    }
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({ ...filters, dateRange: range })
  }

  const handleRpmRangeChange = (values: number[]) => {
    onFiltersChange({ ...filters, rateRange: { min: values[0], max: values[1] } })
  }

  const toggleNeedsAttention = () => {
    onFiltersChange({ ...filters, needsAttention: !filters.needsAttention })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      dateRange: { from: undefined, to: undefined },
      dispatchers: [],
      statuses: [],
      rateRange: { min: 0, max: 10 },
      customers: [],
      needsAttention: false,
    })
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.dateRange?.from ||
    !!filters.dateRange?.to ||
    (filters.dispatchers && filters.dispatchers.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    filters.rateRange?.min !== 0 ||
    filters.rateRange?.max !== 10 ||
    filters.needsAttention

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loads, dispatchers, drivers..."
            className="flex-1"
            value={filters.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={handleStatusChange} value={filters.statuses?.[0] || "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleDispatcherChange}
            value={
              filters.dispatchers && filters.dispatchers.length > 0
                ? dispatchers.find((d) => d.name === filters.dispatchers?.[0])?.id || "all"
                : "all"
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dispatcher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dispatchers</SelectItem>
              {dispatchers.map((dispatcher) => (
                <SelectItem key={dispatcher.id} value={dispatcher.id}>
                  {dispatcher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            date={{
              from: filters.dateRange?.from,
              to: filters.dateRange?.to,
            }}
            onSelect={handleDateRangeChange}
          />
          <Button variant={filters.needsAttention ? "default" : "outline"} onClick={toggleNeedsAttention}>
            Needs Attention
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            RPM Range: ${filters.rateRange?.min.toFixed(2) || "0.00"} - ${filters.rateRange?.max.toFixed(2) || "10.00"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ ...filters, rateRange: { min: 0, max: 10 } })}
          >
            Reset
          </Button>
        </div>
        <Slider
          defaultValue={[0, 10]}
          max={10}
          min={0}
          step={0.1}
          value={[filters.rateRange?.min || 0, filters.rateRange?.max || 10]}
          onValueChange={handleRpmRangeChange}
        />
      </div>

      <div className="flex items-center justify-between">
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.search}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, search: "" })} />
              </Badge>
            )}
            {filters.dateRange?.from && (
              <Badge variant="secondary" className="flex items-center gap-1">
                From: {filters.dateRange.from.toLocaleDateString()}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, from: undefined },
                    })
                  }
                />
              </Badge>
            )}
            {filters.dateRange?.to && (
              <Badge variant="secondary" className="flex items-center gap-1">
                To: {filters.dateRange.to.toLocaleDateString()}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, to: undefined },
                    })
                  }
                />
              </Badge>
            )}
            {filters.dispatchers &&
              filters.dispatchers.map((dispatcher) => (
                <Badge key={dispatcher} variant="secondary" className="flex items-center gap-1">
                  Dispatcher: {dispatcher}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        dispatchers: filters.dispatchers?.filter((d) => d !== dispatcher),
                      })
                    }
                  />
                </Badge>
              ))}
            {filters.statuses &&
              filters.statuses.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  Status: {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        statuses: filters.statuses?.filter((s) => s !== status),
                      })
                    }
                  />
                </Badge>
              ))}
            {(filters.rateRange?.min !== 0 || filters.rateRange?.max !== 10) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                RPM: ${filters.rateRange?.min.toFixed(2)} - ${filters.rateRange?.max.toFixed(2)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, rateRange: { min: 0, max: 10 } })}
                />
              </Badge>
            )}
            {filters.needsAttention && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Needs Attention
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, needsAttention: false })}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}
        <Button variant="outline" size="sm" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
