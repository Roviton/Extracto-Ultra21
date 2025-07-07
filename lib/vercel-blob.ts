import { put, del, list } from "@vercel/blob"

export interface BlobUploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export async function uploadPdfToBlob(file: File, loadId?: string): Promise<BlobUploadResult> {
  try {
    // Generate a unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop() || "pdf"
    const filename = `rate-confirmations/${loadId || "temp"}-${timestamp}-${randomId}.${fileExtension}`

    console.log("Uploading file to Vercel Blob:", filename)

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    console.log("File uploaded successfully:", blob.url)

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `inline; filename="${file.name}"`,
    }
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deletePdfFromBlob(url: string): Promise<void> {
  try {
    console.log("Deleting file from Vercel Blob:", url)
    await del(url)
    console.log("File deleted successfully")
  } catch (error) {
    console.error("Error deleting from Vercel Blob:", error)
    // Don't throw here - deletion failures shouldn't break the app
  }
}

export async function listBlobFiles(prefix?: string) {
  try {
    const { blobs } = await list({
      prefix: prefix || "rate-confirmations/",
    })
    return blobs
  } catch (error) {
    console.error("Error listing blob files:", error)
    return []
  }
}

// Helper function to extract pathname from blob URL for deletion
export function getBlobPathnameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.substring(1) // Remove leading slash
  } catch (error) {
    console.error("Error parsing blob URL:", error)
    return url
  }
}
