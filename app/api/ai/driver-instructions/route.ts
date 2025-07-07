import { type NextRequest, NextResponse } from "next/server"
import { generateDriverInstructions } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Driver instructions API called")

    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const { loadData } = body

    if (!loadData) {
      console.error("No load data provided")
      return NextResponse.json({ success: false, error: "Load data is required" }, { status: 400 })
    }

    console.log("Calling generateDriverInstructions with:", JSON.stringify(loadData, null, 2))

    const result = await generateDriverInstructions(loadData)
    console.log("generateDriverInstructions result:", result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        instructions: result.instructions,
      })
    } else {
      console.error("generateDriverInstructions failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to generate instructions",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Driver instructions API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
