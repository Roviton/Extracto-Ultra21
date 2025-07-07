import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import crypto from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client that bypasses RLS
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface CreateInvitationParams {
  companyId: string
  email: string
  role: "dispatcher" | "admin"
  createdBy: string
}

export interface InvitationData {
  id: string
  email: string
  role: string
  token: string
  expiresAt: string
  createdAt: string
  used: boolean
}

export class InvitationService {
  /**
   * Create a new invitation
   */
  static async createInvitation(params: CreateInvitationParams): Promise<{
    success: boolean
    invitation?: InvitationData
    invitationUrl?: string
    error?: string
  }> {
    try {
      // Generate secure token
      const token = crypto.randomBytes(32).toString("hex")

      // Set expiration to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create invitation record
      const { data: invitation, error } = await supabaseAdmin
        .from("company_invitations")
        .insert({
          company_id: params.companyId,
          email: params.email,
          role: params.role,
          token,
          expires_at: expiresAt.toISOString(),
          created_by: params.createdBy,
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to create invitation:", error)
        return { success: false, error: error.message }
      }

      // Generate invitation URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const invitationUrl = `${baseUrl}/auth/register/dispatcher?token=${token}`

      return {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          token: invitation.token,
          expiresAt: invitation.expires_at,
          createdAt: invitation.created_at,
          used: !!invitation.used_at,
        },
        invitationUrl,
      }
    } catch (error: any) {
      console.error("Invitation creation error:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate an invitation token
   */
  static async validateInvitation(token: string): Promise<{
    valid: boolean
    invitation?: any
    error?: string
  }> {
    try {
      const { data: invitation, error } = await supabaseAdmin
        .from("company_invitations")
        .select(`
          *,
          companies(id, name)
        `)
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (error || !invitation) {
        return { valid: false, error: "Invalid or expired invitation" }
      }

      return { valid: true, invitation }
    } catch (error: any) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Mark invitation as used
   */
  static async markInvitationUsed(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin
        .from("company_invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get invitations for a company
   */
  static async getCompanyInvitations(companyId: string): Promise<{
    success: boolean
    invitations?: InvitationData[]
    error?: string
  }> {
    try {
      const { data: invitations, error } = await supabaseAdmin
        .from("company_invitations")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      const formattedInvitations: InvitationData[] = invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
        used: !!inv.used_at,
      }))

      return { success: true, invitations: formattedInvitations }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Revoke an invitation
   */
  static async revokeInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin
        .from("company_invitations")
        .update({
          expires_at: new Date().toISOString(), // Set expiry to now
        })
        .eq("id", invitationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// Add this at the end of the file after the InvitationService class
export const invitationService = InvitationService
