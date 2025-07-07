"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import type { AdminLoad } from "@/hooks/use-admin-loads"
import { useAdminComments, type CommentPriority } from "@/hooks/use-admin-comments"
import { useToast } from "@/components/ui/use-toast"

interface LoadCommentDialogProps {
  load: AdminLoad | null
  isOpen: boolean
  onClose: () => void
}

export function LoadCommentDialog({ load, isOpen, onClose }: LoadCommentDialogProps) {
  const [commentText, setCommentText] = useState("")
  const [priority, setPriority] = useState<CommentPriority>("low")
  const [notifyDispatcher, setNotifyDispatcher] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { addComment, getComments, loading, error } = useAdminComments()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && load) {
      fetchComments()
    }
  }, [isOpen, load])

  const fetchComments = async () => {
    if (!load) return

    setLoadingComments(true)
    try {
      const loadedComments = await getComments(load.id)
      setComments(loadedComments)
    } catch (err) {
      console.error("Error fetching comments:", err)
      // Don't show toast for comment fetching errors to avoid disrupting the UI
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmit = async () => {
    if (!load || !commentText.trim()) return

    setSubmitError(null)

    try {
      await addComment({
        loadId: load.id,
        comment: commentText.trim(),
        priority,
        dispatcherNotified: notifyDispatcher,
      })

      // Reset form
      setCommentText("")
      setPriority("low")
      setNotifyDispatcher(false)

      // Show success toast
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })

      // Refresh comments
      fetchComments()
    } catch (err) {
      console.error("Error adding comment:", err)
      setSubmitError(err instanceof Error ? err.message : "Failed to add comment")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (!load) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Load Comments</DialogTitle>
          <DialogDescription>
            Load #{load.loadNumber} - {load.origin} to {load.destination}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Comments */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Comments</h4>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-1 rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`h-4 w-4 ${getPriorityColor(comment.priority)}`} />
                        <span className="text-sm font-medium">{comment.adminName || "Admin"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                    {comment.dispatcherNotified && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Dispatcher notified</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">No comments yet</div>
              )}
            </div>
          </div>

          {/* Add New Comment */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Add Comment</h4>
            <Textarea
              placeholder="Enter your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as CommentPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notify-dispatcher" className="block">
                  Notify Dispatcher
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="notify-dispatcher" checked={notifyDispatcher} onCheckedChange={setNotifyDispatcher} />
                  <Label htmlFor="notify-dispatcher">{notifyDispatcher ? "Yes" : "No"}</Label>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Error: {submitError}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!commentText.trim() || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
