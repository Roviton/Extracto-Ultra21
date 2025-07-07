import { type NextRequest, NextResponse } from "next/server"
import { deletePdfFromBlob } from "@/lib/vercel-blob"

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "No URL provided" }, { status: 400 })
    }

    await deletePdfFromBlob(url)

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Blob delete API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 500 },
    )
  }
}
