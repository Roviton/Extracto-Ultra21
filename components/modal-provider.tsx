"use client"

import { useModal } from "@/hooks/use-modal"
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal"

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
    tempDocumentStorage?: Map<string, { blobUrl: string; fileName: string }>
  }
}

export function ModalProvider() {
  const { type, data, isOpen, onClose } = useModal()

  console.log("ModalProvider render:", { type, isOpen, data })

  if (!isOpen || !type) {
    console.log("Modal not open or no type, returning null")
    return null
  }

  if (type === "enhancedNewLoad") {
    console.log("Rendering EnhancedNewLoadModal with data:", data)
    return <EnhancedNewLoadModal />
  }

  console.warn("Unknown modal type:", type)
  return null
}
