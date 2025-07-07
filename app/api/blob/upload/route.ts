import { type NextRequest, NextResponse } from "next/server"
import { uploadPdfToBlob } from "@/lib/vercel-blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const loadId = formData.get("loadId") as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a PDF or image file.",
        },
        { status: 400 },
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Upload to Vercel Blob
    const result = await uploadPdfToBlob(file, loadId)

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        filename: file.name,
        size: file.size,
      },
    })
  } catch (error) {
    console.error("Blob upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    )
  }
}
