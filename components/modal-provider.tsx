"use client";

import { useModal } from "@/hooks/use-modal";
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal";

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
    tempDocumentStorage?: Map<string, { blobUrl: string; fileName: string }>;
  }
}

export function ModalProvider() {
  const { type, isOpen } = useModal();
  
  if (!isOpen || !type) {
    return null;
  }

  if (type === "enhancedNewLoad") {
    return <EnhancedNewLoadModal />;
  }

  return null;
}
