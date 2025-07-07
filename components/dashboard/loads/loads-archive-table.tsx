"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Loader2,
  AlertCircle,
  ChevronRightIcon,
  ChevronDownIcon,
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  Package,
  Building,
  Truck,
  MapPin,
  User,
} from "lucide-react"

interface Load {
  id: string
  load_number?: string | null
  reference_number?: string | null
  customer?: any | null
  pickup_city?: string | null
  pickup_state?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  pickup_address?: string | null
  pickup_location?: string | null
  pickup_number?: string | null
  pickup_contact_name?: string | null
  pickup_contact_phone?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_address?: string | null
  delivery_location?: string | null
  delivery_number?: string | null
  delivery_contact_name?: string | null
  delivery_contact_phone?: string | null
  status: string
  rate?: number | string | null
  commodity?: string | null
  weight?: number | null
  miles?: number | null
  load_drivers?: any[] | null
  equipment_type?: string | null
  pieces?: number | null
  special_instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
  completed_at?: string | null
  appointment_number?: string | null
  notes?: string | null
  comments?: string | null
  pickup_zip?: string | null
  delivery_zip?: string | null
  rate_confirmation_pdf_url?: string | null
  rate_confirmation_pdf_id?: string | null
}

interface LoadsArchiveTableProps {
  loads: Load[]
  loading?: boolean
  error?: string | null
  onViewDetails: (load: Load) => void
}

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
    tempDocumentStorage?: Map<string, { blobUrl: string; fileName: string }>
  }
}

export function LoadsArchiveTable({ loads, loading, error, onViewDetails }: LoadsArchiveTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const canvasContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const pdfDocRefs = useRef<Map<string, any>>(new Map())
  const [pdfScales, setPdfScales] = useState<Map<string, number>>(new Map())
  const [pdfLoaded, setPdfLoaded] = useState<Map<string, boolean>>(new Map())
  const [currentPages, setCurrentPages] = useState<Map<string, number>>(new Map())
  const [totalPages, setTotalPages] = useState<Map<string, number>>(new Map())
  const [pdfErrors, setPdfErrors] = useState<Map<string, string>>(new Map())
  const [pdfJsReady, setPdfJsReady] = useState(false)

  // Load PDF.js when component mounts
  useEffect(() => {
    const loadPDFJS = async () => {
      if (typeof window !== "undefined") {
        if (window.pdfjsLib) {
          setPdfJsReady(true)
          return
        }

        try {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
              setPdfJsReady(true)
              console.log("PDF.js loaded successfully")
            }
          }
          script.onerror = () => {
            console.error("Failed to load PDF.js")
            setPdfJsReady(false)
          }
          document.head.appendChild(script)
        } catch (error) {
          console.error("Error loading PDF.js:", error)
          setPdfJsReady(false)
        }
      }
    }
    loadPDFJS()
  }, [])

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return "$0.00"
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (isNaN(numAmount)) return "$0.00"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numAmount)
  }

  const getCustomerDisplay = (customer: any): string => {
    if (!customer) return "N/A"
    if (typeof customer === "string") return customer
    if (typeof customer === "object") {
      return customer.name || "N/A"
    }
    return "N/A"
  }

  const getDriverDisplay = (loadDrivers: any[] | null | undefined): string => {
    if (!loadDrivers || loadDrivers.length === 0) return "Unassigned"
    const primaryDriver = loadDrivers.find((ld) => ld.is_primary) || loadDrivers[0]
    return primaryDriver?.driver?.name || "Unknown Driver"
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
      },
      other_archived: {
        label: "Archived",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
    }

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const toggleRowExpansion = (loadId: string) => {
    if (expandedRow === loadId) {
      setExpandedRow(null)
    } else {
      setExpandedRow(loadId)
      const load = loads.find((l) => l.id === loadId)
      if (load) {
        // Wait for the DOM to update before trying to render
        setTimeout(() => initializeDocumentForLoad(load), 500)
      }
    }
  }

  const initializeDocumentForLoad = async (load: Load) => {
    console.log("Initializing document for load:", load.id)

    // Reset states
    setPdfLoaded((prev) => new Map(prev).set(load.id, false))
    setPdfErrors((prev) => new Map(prev).set(load.id, ""))
    setPdfScales((prev) => new Map(prev).set(load.id, 1.0))
    setCurrentPages((prev) => new Map(prev).set(load.id, 1))
    setTotalPages((prev) => new Map(prev).set(load.id, 1))

    // Create canvas if it doesn't exist
    const canvasContainer = canvasContainerRefs.current.get(load.id)
    if (!canvasContainer) {
      console.log("Canvas container not found for load:", load.id)
      setPdfErrors((prev) => new Map(prev).set(load.id, "Canvas container not found"))
      return
    }

    // Check if we need to create a canvas
    if (!canvasRefs.current.has(load.id)) {
      try {
        const canvas = document.createElement("canvas")
        canvas.className = "border border-gray-300 shadow-lg bg-white rounded"
        canvas.style.maxWidth = "100%"
        canvas.style.height = "auto"

        // Clear container and append new canvas
        while (canvasContainer.firstChild) {
          canvasContainer.removeChild(canvasContainer.firstChild)
        }
        canvasContainer.appendChild(canvas)
        canvasRefs.current.set(load.id, canvas)
        console.log("Canvas created for load:", load.id)
      } catch (error) {
        console.error("Error creating canvas:", error)
        setPdfErrors((prev) => new Map(prev).set(load.id, "Failed to create canvas"))
        return
      }
    }

    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id

    // If no PDF URL or PDF.js not ready, render fallback immediately
    if (!pdfUrl || !pdfJsReady) {
      console.log("No PDF URL or PDF.js not ready, rendering fallback for load:", load.id)
      await renderFallbackDocument(load)
      return
    }

    // Try to load actual PDF
    try {
      await loadActualPdf(load, pdfUrl)
    } catch (error: any) {
      console.error("Failed to load PDF, falling back to generated document:", error)
      await renderFallbackDocument(load)
    }
  }

  const loadActualPdf = async (load: Load, pdfUrl: string) => {
    console.log("Loading actual PDF for load:", load.id, "URL:", pdfUrl)

    if (!window.pdfjsLib) {
      throw new Error("PDF.js not available")
    }

    const loadingTask = window.pdfjsLib.getDocument({
      url: pdfUrl,
      httpHeaders: {
        Accept: "application/pdf",
      },
    })

    // Set a timeout for PDF loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("PDF loading timeout")), 15000) // 15 second timeout
    })

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise])
    pdfDocRefs.current.set(load.id, pdf)
    setTotalPages((prev) => new Map(prev).set(load.id, pdf.numPages))
    await renderPdfPage(load.id, 1)
    console.log("PDF loaded and rendered successfully for load:", load.id)
  }

  const renderPdfPage = async (loadId: string, pageNumber: number) => {
    const pdfDoc = pdfDocRefs.current.get(loadId)
    const canvas = canvasRefs.current.get(loadId)
    const scale = pdfScales.get(loadId) || 1.0

    if (!pdfDoc || !canvas) {
      console.error("PDF doc or canvas not available for load:", loadId)
      return
    }

    try {
      const page = await pdfDoc.getPage(pageNumber)
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Could not get canvas context")

      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = canvas.parentElement?.clientWidth || 550
      const fitScale = Math.min(containerWidth / viewport.width, scale)
      const scaledViewport = page.getViewport({ scale: fitScale })

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = scaledViewport.height * devicePixelRatio
      canvas.width = scaledViewport.width * devicePixelRatio
      canvas.style.width = `${scaledViewport.width}px`
      canvas.style.height = `${scaledViewport.height}px`
      context.scale(devicePixelRatio, devicePixelRatio)

      context.clearRect(0, 0, canvas.width, canvas.height)
      const renderContext = { canvasContext: context, viewport: scaledViewport }
      await page.render(renderContext).promise

      setCurrentPages((prev) => new Map(prev).set(loadId, pageNumber))
      setPdfLoaded((prev) => new Map(prev).set(loadId, true))
      setPdfErrors((prev) => new Map(prev).set(loadId, ""))

      console.log("PDF page rendered successfully for load:", loadId, "page:", pageNumber)
    } catch (error: any) {
      console.error(`Error rendering PDF page for load ${loadId}:`, error)
      setPdfLoaded((prev) => new Map(prev).set(loadId, false))
      setPdfErrors((prev) => new Map(prev).set(loadId, error.message || "Failed to render PDF"))
    }
  }

  const renderFallbackDocument = async (load: Load) => {
    console.log("Rendering fallback document for load:", load.id)

    const canvas = canvasRefs.current.get(load.id)
    if (!canvas) {
      console.error("Canvas not available for fallback rendering:", load.id)
      setPdfErrors((prev) => new Map(prev).set(load.id, "Canvas not available"))
      setPdfLoaded((prev) => new Map(prev).set(load.id, true))
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Canvas context not available for fallback rendering:", load.id)
      setPdfErrors((prev) => new Map(prev).set(load.id, "Canvas context not available"))
      setPdfLoaded((prev) => new Map(prev).set(load.id, true))
      return
    }

    try {
      const scale = pdfScales.get(load.id) || 1.0
      const baseWidth = 612
      const baseHeight = 792

      // Set canvas size
      canvas.width = baseWidth * scale
      canvas.height = baseHeight * scale
      canvas.style.width = `${Math.min(canvas.parentElement?.clientWidth || 550, baseWidth * scale)}px`
      canvas.style.height = "auto"

      // Clear and scale context
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)

      // White background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, baseWidth, baseHeight)

      // Header
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText("RATE CONFIRMATION", baseWidth / 2, 50)

      ctx.font = "18px Arial"
      ctx.fillText("TFI Transportation Services", baseWidth / 2, 85)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("123 Logistics Way, Transport City, TX 75001", baseWidth / 2, 105)
      ctx.fillText("Phone: (555) 123-4567 | Email: dispatch@tfi.com", baseWidth / 2, 125)

      // Separator line
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 150)
      ctx.lineTo(562, 150)
      ctx.stroke()

      // Load Information Section
      ctx.textAlign = "left"
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 18px Arial"
      ctx.fillText("LOAD INFORMATION", 50, 180)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#374151"
      const loadInfo = [
        `Load Number: ${load.load_number || "N/A"}`,
        `Reference: ${load.reference_number || "N/A"}`,
        `Customer: ${getCustomerDisplay(load.customer)}`,
        `Rate: ${formatCurrency(load.rate)}`,
        `Commodity: ${load.commodity || "General Freight"}`,
        `Weight: ${load.weight ? load.weight + " lbs" : "N/A"}`,
      ]
      loadInfo.forEach((info, index) => {
        ctx.fillText(info, 50, 210 + index * 25)
      })

      // Pickup Information Section
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 18px Arial"
      ctx.fillText("PICKUP INFORMATION", 50, 380)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#374151"
      const pickupInfo = [
        `Location: ${load.pickup_city || "N/A"}, ${load.pickup_state || "N/A"}`,
        `Address: ${load.pickup_address || "N/A"}`,
        `Date: ${load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : "N/A"}`,
        `Time: ${load.pickup_time || "N/A"}`,
        `Contact: ${load.pickup_contact_name || "N/A"}`,
        `Phone: ${load.pickup_contact_phone || "(555) 123-4567"}`,
      ]
      pickupInfo.forEach((info, index) => {
        ctx.fillText(info, 50, 410 + index * 25)
      })

      // Delivery Information Section
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 18px Arial"
      ctx.fillText("DELIVERY INFORMATION", 50, 570)

      ctx.font = "14px Arial"
      ctx.fillStyle = "#374151"
      const deliveryInfo = [
        `Location: ${load.delivery_city || "N/A"}, ${load.delivery_state || "N/A"}`,
        `Address: ${load.delivery_address || "N/A"}`,
        `Date: ${load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "N/A"}`,
        `Time: ${load.delivery_time || "N/A"}`,
        `Contact: ${load.delivery_contact_name || "N/A"}`,
        `Phone: ${load.delivery_contact_phone || "(555) 987-6543"}`,
      ]
      deliveryInfo.forEach((info, index) => {
        ctx.fillText(info, 50, 600 + index * 25)
      })

      // Footer
      ctx.fillStyle = "#059669"
      ctx.font = "bold 20px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`TOTAL RATE: ${formatCurrency(load.rate)}`, baseWidth / 2, 730)

      ctx.font = "12px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("This rate confirmation is valid for 24 hours.", baseWidth / 2, 755)
      ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, baseWidth / 2, 775)

      // Border
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      ctx.strokeRect(25, 25, baseWidth - 50, baseHeight - 50)

      // Mark as loaded
      setPdfLoaded((prev) => new Map(prev).set(load.id, true))
      setTotalPages((prev) => new Map(prev).set(load.id, 1))
      setCurrentPages((prev) => new Map(prev).set(load.id, 1))
      setPdfErrors((prev) => new Map(prev).set(load.id, ""))

      console.log("Fallback document rendered successfully for load:", load.id)
    } catch (error: any) {
      console.error("Error rendering fallback document for load:", load.id, error)
      setPdfErrors((prev) => new Map(prev).set(load.id, `Fallback render error: ${error.message}`))
      setPdfLoaded((prev) => new Map(prev).set(load.id, true))
    }
  }

  const handlePdfZoom = async (loadId: string, newScale: number) => {
    setPdfScales((prev) => new Map(prev).set(loadId, newScale))
    const currentPage = currentPages.get(loadId) || 1
    const pdfDoc = pdfDocRefs.current.get(loadId)
    if (pdfDoc) {
      await renderPdfPage(loadId, currentPage)
    } else {
      const load = loads.find((l) => l.id === loadId)
      if (load) await renderFallbackDocument(load)
    }
  }

  const handlePageChange = async (loadId: string, direction: "next" | "previous") => {
    const currentPage = currentPages.get(loadId) || 1
    const total = totalPages.get(loadId) || 1
    let newPage = currentPage
    if (direction === "next" && currentPage < total) newPage = currentPage + 1
    else if (direction === "previous" && currentPage > 1) newPage = currentPage - 1
    else return
    await renderPdfPage(loadId, newPage)
  }

  const handleDownloadPDF = (load: Load) => {
    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id
    if (pdfUrl && (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("http"))) {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.download = `rate-confirmation-${load.reference_number || load.load_number}.pdf`
      a.target = "_blank"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }
    if (pdfUrl && typeof window !== "undefined" && window.tempDocumentStorage) {
      const tempDoc = window.tempDocumentStorage.get(pdfUrl)
      if (tempDoc && tempDoc.blobUrl) {
        const a = document.createElement("a")
        a.href = tempDoc.blobUrl
        a.download = `rate-confirmation-${load.reference_number || load.load_number}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }
    }
    const canvas = canvasRefs.current.get(load.id)
    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rate-confirmation-${load.reference_number || load.load_number}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    }
  }

  const renderExpandedContent = (load: Load) => {
    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id
    const isLoading = !pdfLoaded.get(load.id) && !pdfErrors.get(load.id)
    const hasError = !!pdfErrors.get(load.id)

    return (
      <TableRow key={`${load.id}-expanded`} className="bg-muted/20 hover:bg-muted/30">
        <TableCell colSpan={9} className="p-0">
          <div className="border-t">
            <Tabs defaultValue="rate-confirmation" className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="rate-confirmation">Rate Confirmation</TabsTrigger>
                  <TabsTrigger value="load-details">Load Details</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="rate-confirmation" className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                      <Badge variant="outline">{formatCurrency(load.rate)}</Badge>
                      {pdfUrl && !hasError && <Badge variant="secondary">PDF Available</Badge>}
                      {!pdfUrl && <Badge variant="outline">Generated</Badge>}
                      {hasError && <Badge variant="destructive">Error</Badge>}
                    </div>
                    <div className="border rounded-lg bg-white min-h-[400px] flex flex-col">
                      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700 truncate">
                            Rate Conf - {load.reference_number || load.load_number}
                          </span>
                          {hasError && (
                            <AlertCircle className="h-4 w-4 text-amber-500" title={pdfErrors.get(load.id)} />
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(load)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <div className="flex-1 overflow-auto bg-gray-50 p-4" style={{ maxHeight: "600px" }}>
                        <div className="flex justify-center min-h-full">
                          {isLoading && (
                            <div className="flex items-center justify-center w-full h-96 bg-white border border-gray-300 rounded">
                              <div className="text-center">
                                <Loader2 className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-spin" />
                                <p className="text-sm text-gray-500">
                                  {pdfUrl ? "Loading PDF..." : "Generating document..."}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Please wait while we prepare the document</p>
                              </div>
                            </div>
                          )}
                          {hasError && (
                            <div className="flex flex-col items-center justify-center w-full h-96 bg-white border border-gray-300 rounded text-red-500">
                              <AlertCircle className="h-8 w-8 mb-2" />
                              <p className="text-sm">Failed to load document</p>
                              <p className="text-xs text-gray-500 mt-1">{pdfErrors.get(load.id)}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => initializeDocumentForLoad(load)}
                              >
                                Retry
                              </Button>
                            </div>
                          )}
                          <div
                            ref={(el) => {
                              if (el) canvasContainerRefs.current.set(load.id, el)
                            }}
                            className="w-full flex justify-center"
                          >
                            {/* Canvas will be created and appended here dynamically */}
                          </div>
                        </div>
                      </div>
                      {pdfLoaded.get(load.id) && !hasError && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(load.id, "previous")}
                              disabled={(currentPages.get(load.id) || 1) <= 1}
                            >
                              Previous
                            </Button>
                            <span className="text-xs px-2">
                              Page {currentPages.get(load.id) || 1} of {totalPages.get(load.id) || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(load.id, "next")}
                              disabled={(currentPages.get(load.id) || 1) >= (totalPages.get(load.id) || 1)}
                            >
                              Next
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePdfZoom(load.id, Math.max(0.5, (pdfScales.get(load.id) || 1) - 0.25))
                              }
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-xs px-3 py-1 bg-white border rounded">
                              {Math.round((pdfScales.get(load.id) || 1) * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePdfZoom(load.id, Math.min(3, (pdfScales.get(load.id) || 1) + 0.25))}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Load Summary</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Load ID / Reference</label>
                          <p className="font-medium">
                            {load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`}
                          </p>
                          {load.reference_number && (
                            <p className="text-sm text-muted-foreground">REF: {load.reference_number}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Broker/Customer</label>
                          <p className="font-medium">{getCustomerDisplay(load.customer)}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Origin Name & Address</label>
                        <p className="font-medium">{load.pickup_location || "Pickup Location"}</p>
                        <p className="text-sm">
                          {load.pickup_address || `${load.pickup_city || "N/A"}, ${load.pickup_state || "N/A"}`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Pickup Date & Time</label>
                          <p>{formatDateTime(load.pickup_date)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Pickup Number (PU#)</label>
                          <p>{load.pickup_number || "N/A"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Destination Name & Address</label>
                        <p className="font-medium">{load.delivery_location || "Delivery Location"}</p>
                        <p className="text-sm">
                          {load.delivery_address || `${load.delivery_city || "N/A"}, ${load.delivery_state || "N/A"}`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Delivery Date & Time</label>
                          <p>{formatDateTime(load.delivery_date)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Delivery Number (DEL#)</label>
                          <p>{load.delivery_number || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="load-details" className="p-6">
                <div className="space-y-6">
                  {/* Load Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center">
                          <Package className="mr-2 h-5 w-5" />
                          <h3 className="text-lg font-semibold">Load Information</h3>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Load Number</label>
                          <p className="font-medium">
                            {load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                          <p>{load.reference_number || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">{getStatusBadge(load.status)}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Rate</label>
                          <p className="text-lg font-semibold text-green-600">{formatCurrency(load.rate)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center">
                          <Building className="mr-2 h-5 w-5" />
                          <h3 className="text-lg font-semibold">Customer Information</h3>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Customer/Broker</label>
                          <p className="font-medium">{getCustomerDisplay(load.customer)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center">
                          <Truck className="mr-2 h-5 w-5" />
                          <h3 className="text-lg font-semibold">Driver Assignment</h3>
                        </div>
                        {load.load_drivers && load.load_drivers.length > 0 ? (
                          load.load_drivers.map((assignment: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{assignment.driver?.name?.charAt(0) || "D"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{assignment.driver?.name || "Unknown Driver"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {assignment.driver?.phone || "No phone provided"}
                                  </p>
                                  <Badge variant="outline" size="sm" className="mt-1">
                                    {assignment.is_primary ? "Primary" : "Secondary"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>No driver assigned</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pickup and Delivery Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold">Pickup Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date</label>
                            <p className="font-medium">{formatDate(load.pickup_date)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Time</label>
                            <p>{load.pickup_time || "Not specified"}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="font-medium">{load.pickup_location || "Pickup Location"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <p>{load.pickup_address || `${load.pickup_city || "N/A"}, ${load.pickup_state || "N/A"}`}</p>
                          {load.pickup_zip && <p className="text-sm text-muted-foreground">ZIP: {load.pickup_zip}</p>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-red-600" />
                          <h3 className="text-lg font-semibold">Delivery Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date</label>
                            <p className="font-medium">{formatDate(load.delivery_date)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Time</label>
                            <p>{load.delivery_time || "Not specified"}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="font-medium">{load.delivery_location || "Delivery Location"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <p>
                            {load.delivery_address || `${load.delivery_city || "N/A"}, ${load.delivery_state || "N/A"}`}
                          </p>
                          {load.delivery_zip && (
                            <p className="text-sm text-muted-foreground">ZIP: {load.delivery_zip}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="communication" className="p-6">
                <div className="text-center text-muted-foreground">Communication content coming soon...</div>
              </TabsContent>

              <TabsContent value="timeline" className="p-6">
                <div className="text-center text-muted-foreground">Timeline content coming soon...</div>
              </TabsContent>
            </Tabs>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading archived loads...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <span>Error loading loads: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-semibold">Load #</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Route</TableHead>
                <TableHead className="font-semibold">Pickup Date</TableHead>
                <TableHead className="font-semibold">Delivery Date</TableHead>
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Rate</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No archived loads found.
                  </TableCell>
                </TableRow>
              ) : (
                loads.map((load) => (
                  <Fragment key={load.id}>
                    <TableRow
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        expandedRow === load.id ? "border-b-0" : ""
                      }`}
                      onClick={() => toggleRowExpansion(load.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpansion(load.id)
                          }}
                        >
                          {expandedRow === load.id ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`}
                          </div>
                          {load.reference_number && (
                            <div className="text-xs text-muted-foreground">Ref: {load.reference_number}</div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{getCustomerDisplay(load.customer)}</div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            <span className="font-medium">
                              {load.pickup_city || "N/A"}, {load.pickup_state || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                            <span className="font-medium">
                              {load.delivery_city || "N/A"}, {load.delivery_state || "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">{formatDate(load.pickup_date)}</TableCell>

                      <TableCell className="font-medium">{formatDate(load.delivery_date)}</TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getDriverDisplay(load.load_drivers).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{getDriverDisplay(load.load_drivers)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-green-600">{formatCurrency(load.rate)}</TableCell>

                      <TableCell>{getStatusBadge(load.status)}</TableCell>
                    </TableRow>
                    {expandedRow === load.id && renderExpandedContent(load)}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {loads.length > 0 && (
          <div className="px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {loads.length} archived load{loads.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
