import { NextResponse } from "next/server"
import { testAPIKeys } from "@/lib/ai-service"

export async function GET() {
  try {
    const results = await testAPIKeys()
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Failed to test API keys" }, { status: 500 })
  }
}
