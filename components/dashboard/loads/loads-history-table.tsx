"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  UserCircle,
  Truck,
  MapPinIcon,
  DollarSign,
  FileTextIcon,
  MessageSquare,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, parseISO } from "date-fns"
import React from "react"

interface Load {
  id: string
  load_number?: string
  reference_number?: string
  customer?: { name?: string }
  pickup_city?: string
  pickup_state?: string
  pickup_date?: string
  delivery_city?: string
  delivery_state?: string
  delivery_date?: string
  status?: "completed" | "cancelled" | "refused" | "other_archived" | string
  rate?: number
  manager_comments?: string
  dispatcher_notes?: string
  load_drivers?: Array<{
    driver?: { name?: string; avatar_url?: string }
  }>
  pickup_address?: string
  pickup_time?: string
  delivery_address?: string
  delivery_time?: string
  commodity?: string
  weight?: number
  equipment_type?: { name?: string }
  created_at?: string
  updated_at?: string
  completed_at?: string
}

interface LoadsHistoryTableProps {
  loads: Load[]
  onViewDetails: (load: Load) => void
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A"
  try {
    return format(parseISO(dateString), "MM/dd/yyyy")
  } catch (e) {
    return dateString
  }
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "N/A"
  try {
    return format(parseISO(dateString), "MM/dd/yyyy HH:mm")
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "N/A"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

const getStatusBadgeVariant = (status?: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "completed":
      return "default"
    case "cancelled":
    case "refused":
      return "destructive"
    case "other_archived":
      return "secondary"
    default:
      return "outline"
  }
}

const getStatusDisplayName = (status?: string) => {
  if (!status) return "Unknown"
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function LoadsHistoryTable({ loads, onViewDetails }: LoadsHistoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const getComments = (load: Load) => {
    return load.manager_comments || load.dispatcher_notes || "No comments"
  }

  const getPrimaryDriverName = (load: Load) => {
    const primaryDriverAssignment = load.load_drivers?.find((ld) => ld.driver)
    return primaryDriverAssignment?.driver?.name || "N/A"
  }
  const getPrimaryDriverAvatar = (load: Load) => {
    const primaryDriverAssignment = load.load_drivers?.find((ld) => ld.driver)
    return primaryDriverAssignment?.driver?.avatar_url
  }

  const headerCells = [
    <TableHead key="h-expand" className="w-[50px]">
      {null}
    </TableHead>,
    <TableHead key="h-load-no">Load #</TableHead>,
    <TableHead key="h-customer">Customer</TableHead>,
    <TableHead key="h-origin">Origin</TableHead>,
    <TableHead key="h-destination">Destination</TableHead>,
    <TableHead key="h-date">Completed/Cancelled Date</TableHead>,
    <TableHead key="h-status">Status</TableHead>,
    <TableHead key="h-driver">Driver</TableHead>,
    <TableHead key="h-rate">Rate</TableHead>,
    <TableHead key="h-comments">Comments</TableHead>,
    <TableHead key="h-actions" className="w-[50px]">
      {null}
    </TableHead>,
  ]

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>{headerCells}</TableRow>
          </TableHeader>
          <TableBody>
            {loads.length === 0 && (
              <TableRow key="empty-row">
                <TableCell colSpan={headerCells.length} className="h-24 text-center">
                  No historical loads found matching your criteria.
                </TableCell>
              </TableRow>
            )}
            {loads.map((load) => (
              <React.Fragment key={load.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toggleRow(load.id)} className="h-8 w-8">
                      {expandedRow === load.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{load.load_number || "N/A"}</TableCell>
                  <TableCell>{load.customer?.name || "N/A"}</TableCell>
                  <TableCell>
                    {load.pickup_city || "N/A"}, {load.pickup_state || "N/A"}
                  </TableCell>
                  <TableCell>
                    {load.delivery_city || "N/A"}, {load.delivery_state || "N/A"}
                  </TableCell>
                  <TableCell>{formatDate(load.completed_at || load.updated_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(load.status)}>{getStatusDisplayName(load.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            getPrimaryDriverAvatar(load) || "/placeholder.svg?width=24&height=24&query=driver+avatar"
                          }
                          alt={getPrimaryDriverName(load)}
                        />
                        <AvatarFallback>{getPrimaryDriverName(load)?.substring(0, 1) || "D"}</AvatarFallback>
                      </Avatar>
                      <span>{getPrimaryDriverName(load)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(load.rate)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={getComments(load)}>
                    {getComments(load)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(load)} title="View Full Details">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedRow === load.id && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={headerCells.length} className="p-0">
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-lg">Load Details Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              <p>
                                <FileTextIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Load #:</strong> {load.load_number || "N/A"}
                              </p>
                              <p>
                                <FileTextIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Reference #:</strong> {load.reference_number || "N/A"}
                              </p>
                              <p>
                                <UserCircle className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Customer:</strong> {load.customer?.name || "N/A"}
                              </p>
                              <p>
                                <DollarSign className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Rate:</strong> {formatCurrency(load.rate)}
                              </p>

                              <p className="col-span-2">
                                <MapPinIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Origin:</strong>{" "}
                                {load.pickup_address || `${load.pickup_city}, ${load.pickup_state}`}
                              </p>
                              <p>
                                <CalendarDays className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Pickup Date:</strong> {formatDate(load.pickup_date)} {load.pickup_time || ""}
                              </p>

                              <p className="col-span-2">
                                <MapPinIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Destination:</strong>{" "}
                                {load.delivery_address || `${load.delivery_city}, ${load.delivery_state}`}
                              </p>
                              <p>
                                <CalendarDays className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Delivery Date:</strong> {formatDate(load.delivery_date)}{" "}
                                {load.delivery_time || ""}
                              </p>

                              <p>
                                <Truck className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Commodity:</strong> {load.commodity || "N/A"}
                              </p>
                              <p>
                                <Truck className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Weight:</strong> {load.weight ? `${load.weight} lbs` : "N/A"}
                              </p>
                              <p>
                                <Truck className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Equipment:</strong> {load.equipment_type?.name || "N/A"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Status & Notes</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <p>
                                <strong>Final Status:</strong>{" "}
                                <Badge variant={getStatusBadgeVariant(load.status)}>
                                  {getStatusDisplayName(load.status)}
                                </Badge>
                              </p>
                              <p>
                                <CalendarDays className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Created:</strong> {formatDateTime(load.created_at)}
                              </p>
                              <p>
                                <CalendarDays className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                <strong>Last Updated:</strong> {formatDateTime(load.updated_at)}
                              </p>
                              {load.completed_at && (
                                <p>
                                  <CalendarDays className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                  <strong>Completed/Archived:</strong> {formatDateTime(load.completed_at)}
                                </p>
                              )}
                            </div>
                            <div className="pt-2 border-t">
                              <p className="font-semibold">
                                <MessageSquare className="inline mr-2 h-4 w-4 text-muted-foreground" />
                                Comments/Notes:
                              </p>
                              <ScrollArea className="h-24 mt-1">
                                <p className="whitespace-pre-wrap text-xs">{getComments(load)}</p>
                              </ScrollArea>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 text-sm text-muted-foreground">Total historical loads: {loads.length}</div>
      </CardContent>
    </Card>
  )
}
