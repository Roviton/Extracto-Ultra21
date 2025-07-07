import { type NextRequest, NextResponse } from "next/server"
import { extractBillOfLadingData } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    console.log("OCR API route called")

    const body = await request.json()
    const { dataUrl } = body

    if (!dataUrl) {
      return NextResponse.json({ success: false, error: "No data URL provided" }, { status: 400 })
    }

    console.log("Processing document with AI service...")
    const result = await extractBillOfLadingData(dataUrl)

    console.log("AI service result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
