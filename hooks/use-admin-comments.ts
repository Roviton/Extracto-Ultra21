"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"

export type CommentPriority = "low" | "medium" | "high"

interface CommentData {
  loadId: string
  comment: string
  priority: CommentPriority
  dispatcherNotified: boolean
}

export function useAdminComments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addComment = async (data: CommentData) => {
    setLoading(true)
    setError(null)

    try {
      // Get the current user
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error("Authentication error. Please log in again.")
      }

      // Check if we have a valid user
      const userId = authData?.user?.id

      if (!userId) {
        console.error("No user ID available")
        throw new Error("User not authenticated. Please log in.")
      }

      // Check if the admin_comments table exists first
      const { data: tableInfo, error: tableError } = await supabase.from("admin_comments").select("*").limit(1)

      if (tableError) {
        console.log("Admin comments table doesn't exist, creating a mock comment")
        // If the table doesn't exist, we'll just log the comment
        console.log("Mock comment created:", data)
        return { id: "mock-id", ...data }
      }

      // Prepare the comment data
      const commentData = {
        load_id: data.loadId,
        comment: data.comment,
        priority: data.priority,
        dispatcher_notified: data.dispatcherNotified,
        admin_id: userId, // Use the actual user ID from auth
      }

      console.log("Inserting comment with data:", commentData)

      // If the table exists, try to insert the comment
      const { data: result, error: insertError } = await supabase.from("admin_comments").insert(commentData).select()

      if (insertError) {
        console.error("Insert error:", insertError)
        throw new Error(`Error adding comment: ${insertError.message}`)
      }

      return result
    } catch (err) {
      console.error("Error in addComment:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getComments = async (loadId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Check if the admin_comments table exists first
      const { data: tableInfo, error: tableError } = await supabase.from("admin_comments").select("*").limit(1)

      if (tableError) {
        console.log("Admin comments table doesn't exist, returning empty comments")
        return []
      }

      // If the table exists, try to get the comments
      const { data, error: commentsError } = await supabase
        .from("admin_comments")
        .select(`
          id,
          comment,
          priority,
          dispatcher_notified,
          created_at,
          admin_id,
          users!admin_id(name)
        `)
        .eq("load_id", loadId)
        .order("created_at", { ascending: false })

      if (commentsError) {
        throw new Error(`Error fetching comments: ${commentsError.message}`)
      }

      return data.map((comment) => ({
        id: comment.id,
        text: comment.comment,
        priority: comment.priority,
        dispatcherNotified: comment.dispatcher_notified,
        createdAt: comment.created_at,
        adminId: comment.admin_id,
        adminName: comment.users?.name || "Admin",
      }))
    } catch (err) {
      console.error("Error in getComments:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    addComment,
    getComments,
    loading,
    error,
  }
}
