import { type NextRequest, NextResponse } from "next/server"
import { extractBillOfLadingData } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Check file type - supporting images and PDFs
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload an image (JPEG, PNG, WebP) or PDF.",
        },
        { status: 400 },
      )
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create data URL based on file type
    let dataUrl: string
    let processingMethod: string

    if (file.type === "application/pdf") {
      // For PDFs, create PDF data URL for OpenAI
      const base64 = buffer.toString("base64")
      dataUrl = `data:application/pdf;base64,${base64}`
      processingMethod = "pdf-native"
      console.log("Processing PDF with native OpenAI support...")
    } else {
      // For images, create image data URL
      const base64 = buffer.toString("base64")
      dataUrl = `data:${file.type};base64,${base64}`
      processingMethod = "image"
      console.log("Processing image file...")
    }

    // Process with AI
    console.log(`Extracting data using ${processingMethod} method...`)
    const result = await extractBillOfLadingData(dataUrl)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        usedFallback: result.usedFallback || false,
        message: `Document processed successfully (${processingMethod})`,
        fileType: file.type,
        processingMethod: result.processingMethod,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to extract data from document",
          originalError: result.originalError,
          rawResponse: result.rawResponse,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("OCR API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
