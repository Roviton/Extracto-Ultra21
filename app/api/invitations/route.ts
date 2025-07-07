import { type NextRequest, NextResponse } from "next/server"
import { invitationService } from "@/lib/invitation-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "create":
        const result = await invitationService.createInvitation(data)
        return NextResponse.json(result)

      case "validate":
        const validation = await invitationService.validateInvitation(data.token)
        return NextResponse.json(validation)

      case "markUsed":
        const markResult = await invitationService.markInvitationUsed(data.token, data.userId)
        return NextResponse.json(markResult)

      case "getCompanyInvitations":
        const invitations = await invitationService.getCompanyInvitations(data.companyId)
        return NextResponse.json(invitations)

      case "revoke":
        const revokeResult = await invitationService.revokeInvitation(data.invitationId)
        return NextResponse.json(revokeResult)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error in invitations API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
