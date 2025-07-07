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
import { AlertCircle, MoreHorizontal, MessageSquare, FileText, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { LoadCommentDialog } from "./load-comment-dialog"
import type { AdminLoad } from "@/hooks/use-admin-loads"

interface AdminLoadTableProps {
  loads: AdminLoad[]
  onRefresh: () => void
}

export function AdminLoadTable({ loads, onRefresh }: AdminLoadTableProps) {
  const [selectedLoad, setSelectedLoad] = useState<AdminLoad | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "assigned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "new":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Get RPM color
  const getRpmColor = (rpm: number) => {
    if (rpm < 2.0) return "text-red-500"
    if (rpm < 3.0) return "text-amber-500"
    return "text-green-500"
  }

  // Handle comment dialog
  const handleOpenCommentDialog = (load: AdminLoad) => {
    setSelectedLoad(load)
    setShowCommentDialog(true)
  }

  const handleCloseCommentDialog = () => {
    setShowCommentDialog(false)
    setSelectedLoad(null)
    onRefresh()
  }

  // Format date safely
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Load ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Dispatcher</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loads.length > 0 ? (
              loads.map((load) => (
                <TableRow
                  key={load.id}
                  className={cn({
                    "bg-red-50 dark:bg-red-900/10": load.needsAttention,
                  })}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{load.loadNumber}</span>
                      {load.needsAttention && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{load.origin}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{load.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">Pickup: {formatDate(load.pickupDate)}</span>
                      <span className="text-xs">Delivery: {formatDate(load.deliveryDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>${load.rate?.toLocaleString()}</span>
                      <span className={cn("text-xs font-medium", getRpmColor(load.rpm))}>
                        ${load.rpm.toFixed(2)}/mi
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{load.dispatcher?.name || "Unassigned"}</TableCell>
                  <TableCell>{load.driver?.name || "Unassigned"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(load.status)}>
                      {load.status.charAt(0).toUpperCase() + load.status.slice(1).replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{load.customer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => handleOpenCommentDialog(load)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {load.adminComments && load.adminComments.length > 0 && (
                        <>
                          <span>{load.adminComments.length}</span>
                          {load.adminComments.some((c) => c.priority === "high") && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenCommentDialog(load)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Add Comment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>Export Data</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No loads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {loads.length} {loads.length === 1 ? "load" : "loads"}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Comment Dialog */}
      <LoadCommentDialog load={selectedLoad} isOpen={showCommentDialog} onClose={handleCloseCommentDialog} />
    </div>
  )
}
