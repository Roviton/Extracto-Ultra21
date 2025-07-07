import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return new NextResponse("Missing URL parameter", { status: 400 })
    }

    // Security check: Only allow URLs from Vercel Blob storage
    if (
      !url.startsWith("https://") ||
      (!url.includes(".public.blob.vercel-storage.com") && !url.includes(".blob.vercel-storage.com"))
    ) {
      return new NextResponse("Invalid URL. Only Vercel Blob URLs are allowed.", { status: 403 })
    }

    // Fetch the PDF from the URL
    const response = await fetch(url, {
      headers: {
        Accept: "application/pdf",
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, {
        status: response.status,
      })
    }

    // Get the PDF data
    const pdfData = await response.arrayBuffer()

    // Return the PDF with appropriate headers
    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Frame-Options": "SAMEORIGIN",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("PDF proxy error:", error)
    return new NextResponse(`Error serving PDF: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}
