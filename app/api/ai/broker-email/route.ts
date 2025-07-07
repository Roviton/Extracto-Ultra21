import { type NextRequest, NextResponse } from "next/server"
import { generateBrokerEmail } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Broker email API called")

    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const { loadData } = body

    if (!loadData) {
      console.error("No load data provided")
      return NextResponse.json({ success: false, error: "Load data is required" }, { status: 400 })
    }

    console.log("Calling generateBrokerEmail with:", JSON.stringify(loadData, null, 2))

    const result = await generateBrokerEmail(loadData)
    console.log("generateBrokerEmail result:", result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        email: result.email,
      })
    } else {
      console.error("generateBrokerEmail failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to generate email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Broker email API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
