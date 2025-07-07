interface TempDocument {
  id: string
  loadId?: string
  file: File
  blobUrl: string
  uploadedAt: Date
  type: "pdf" | "image"
}

class TempDocumentStorage {
  private documents: Map<string, TempDocument> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval (runs every 30 minutes)
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(
        () => {
          this.cleanup()
        },
        30 * 60 * 1000,
      ) // 30 minutes
    }
  }

  store(file: File, loadId?: string): string {
    const id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const blobUrl = URL.createObjectURL(file)
    const type = file.type.includes("pdf") ? "pdf" : "image"

    const document: TempDocument = {
      id,
      loadId,
      file,
      blobUrl,
      uploadedAt: new Date(),
      type,
    }

    this.documents.set(id, document)
    console.log(`Stored temporary document: ${id}`)

    return id
  }

  get(id: string): TempDocument | null {
    return this.documents.get(id) || null
  }

  getBlobUrl(id: string): string | null {
    const doc = this.documents.get(id)
    return doc ? doc.blobUrl : null
  }

  updateLoadId(id: string, loadId: string): boolean {
    const doc = this.documents.get(id)
    if (doc) {
      doc.loadId = loadId
      this.documents.set(id, doc)
      console.log(`Updated document ${id} with load ID: ${loadId}`)
      return true
    }
    return false
  }

  remove(id: string): boolean {
    const doc = this.documents.get(id)
    if (doc) {
      // Clean up blob URL to prevent memory leaks
      URL.revokeObjectURL(doc.blobUrl)
      this.documents.delete(id)
      console.log(`Removed temporary document: ${id}`)
      return true
    }
    return false
  }

  removeByLoadId(loadId: string): number {
    let removedCount = 0
    for (const [id, doc] of this.documents.entries()) {
      if (doc.loadId === loadId) {
        this.remove(id)
        removedCount++
      }
    }
    console.log(`Removed ${removedCount} documents for load: ${loadId}`)
    return removedCount
  }

  cleanup(): number {
    const now = new Date()
    const maxAge = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    let cleanedCount = 0

    for (const [id, doc] of this.documents.entries()) {
      const age = now.getTime() - doc.uploadedAt.getTime()
      if (age > maxAge) {
        this.remove(id)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired temporary documents`)
    }

    return cleanedCount
  }

  getAll(): TempDocument[] {
    return Array.from(this.documents.values())
  }

  getByLoadId(loadId: string): TempDocument[] {
    return Array.from(this.documents.values()).filter((doc) => doc.loadId === loadId)
  }

  clear(): void {
    for (const [id] of this.documents.entries()) {
      this.remove(id)
    }
    console.log("Cleared all temporary documents")
  }

  destroy(): void {
    this.clear()
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Create singleton instance
export const tempDocumentStorage = new TempDocumentStorage()

// Make it available globally for cleanup in other parts of the app
if (typeof window !== "undefined") {
  ;(window as any).tempDocumentStorage = tempDocumentStorage
}
