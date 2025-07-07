"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, PencilLine, Check, X } from "lucide-react"

interface LoadCommentManagerProps {
  loadId: string
  comment: string
  onCommentUpdate: (comment: string) => void
}

export function LoadCommentManager({ loadId, comment, onCommentUpdate }: LoadCommentManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment)

  const handleSave = () => {
    onCommentUpdate(editedComment)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedComment(comment)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
          placeholder="Add a comment for the dispatcher..."
          className="min-h-[80px] text-sm"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} className="h-8 px-2">
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {comment ? (
        <>
          <div className="flex-1 line-clamp-1 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground inline mr-1" />
            {comment}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-6 w-6">
            <PencilLine className="h-3.5 w-3.5" />
            <span className="sr-only">Edit comment</span>
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 px-2 text-xs">
          <PencilLine className="h-3.5 w-3.5 mr-1" />
          Add comment
        </Button>
      )}
    </div>
  )
}
