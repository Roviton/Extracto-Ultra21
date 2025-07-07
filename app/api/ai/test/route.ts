import { NextResponse } from "next/server"
import { generateBrokerEmail, generateDriverInstructions, extractBillOfLadingData } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case "broker-email":
        const emailResult = await generateBrokerEmail(data)
        return NextResponse.json(emailResult)

      case "driver-instructions":
        const instructionsResult = await generateDriverInstructions(data)
        return NextResponse.json(instructionsResult)

      case "ocr-extraction":
        if (!data.imageUrl) {
          return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 })
        }
        const ocrResult = await extractBillOfLadingData(data.imageUrl)
        return NextResponse.json(ocrResult)

      default:
        return NextResponse.json({ success: false, error: "Invalid test type" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
