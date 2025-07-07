"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useModal } from "@/hooks/use-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BillOfLadingData } from "@/lib/ai-service"
import { cn } from "@/lib/utils"
import { put } from "@vercel/blob"
import { Upload, Search, Brain, FileDigit, Loader2, Check, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash, Plus, Minus, RefreshCw, FileUp, ArrowRight, FileText, CheckCircle2, BarChart } from "lucide-react"

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
  }
}

// Define extraction process steps
type ExtractionStep = {
  id: string
  label: string
  status: "pending" | "processing" | "completed" | "error"
  icon: React.ReactNode
}

type EnhancedNewLoadModalProps = {}

export const EnhancedNewLoadModal = () => {
  const { isOpen, type, data, onClose } = useModal()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [extractedData, setExtractedData] = useState<BillOfLadingData | null>(null)
  const [documentUrl, setDocumentUrl] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(90)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [extractionSuccess, setExtractionSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<any>(null)

  // Extraction process tracking
  const [extractionStepsList, setExtractionStepsList] = useState<ExtractionStep[]>([
    { id: "upload", label: "Uploading document", status: "pending", icon: <Upload className="h-4 w-4" /> },
    { id: "ocr", label: "OCR processing", status: "pending", icon: <Search className="h-4 w-4" /> },
    { id: "ai", label: "AI extraction", status: "pending", icon: <Brain className="h-4 w-4" /> },
    { id: "form", label: "Preparing form data", status: "pending", icon: <FileDigit className="h-4 w-4" /> },
  ])
  const [currentExtractionStep, setCurrentExtractionStep] = useState<string | null>(null)
  const [extractionProgress, setExtractionProgress] = useState(0)

  const isModalOpen = isOpen && type === "enhancedNewLoad"

  // Update extraction step status
  const updateExtractionStep = (stepId: string, status: "pending" | "processing" | "completed" | "error") => {
    setExtractionStepsList((prev: ExtractionStep[]) => {
      const updated = prev.map((step: ExtractionStep) => (step.id === stepId ? { ...step, status } : step))

      // Calculate progress based on updated steps
      const totalSteps = updated.length
      const completedSteps = updated.filter((s: ExtractionStep) => s.status === "completed").length
      const processingSteps = updated.filter((s: ExtractionStep) => s.status === "processing").length

      // Each completed step = 1 point, each processing step = 0.5 points
      const progressPoints = completedSteps + processingSteps * 0.5
      const progressPercentage = Math.min(Math.round((progressPoints / totalSteps) * 100), 100)

      setExtractionProgress(progressPercentage)
      return updated
    })

    if (status === "processing") {
      setCurrentExtractionStep(stepId)
    }
  }

  // Load PDF.js when component mounts
  useEffect(() => {
    const loadPDFJS = async () => {
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        try {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
            }
          }
          script.onerror = () => {
            console.error("Failed to load PDF.js")
          }
          document.head.appendChild(script)
        } catch (error) {
          console.error("Error loading PDF.js:", error)
        }
      }
    }
    loadPDFJS()
  }, [])

  useEffect(() => {
    if (extractedData) {
      // Mark all steps as completed when extraction is done
      setExtractionStepsList((prev: ExtractionStep[]) => prev.map((step: ExtractionStep) => ({ ...step, status: "completed" })))
      setExtractionProgress(100)
      setCurrentExtractionStep(null)

      // Small delay to show completion before switching tabs
      setTimeout(() => {
        setActiveTab("review")
        setExtractionSuccess(true)
        setIsExtracting(false) // Only set to false when everything is complete
      }, 1000)
    }
  }, [extractedData])

  // Render PDF when document URL changes
  useEffect(() => {
    if (documentUrl && documentUrl.endsWith(".pdf") && showPreview) {
      renderPDF(documentUrl)
    }
  }, [documentUrl, showPreview, zoomLevel])

  const renderPDF = async (url: string) => {
    if (!window.pdfjsLib) {
      console.log("PDF.js not loaded yet")
      return
    }

    if (!canvasRef.current) {
      console.log("Canvas not ready")
      return
    }

    try {
      const loadingTask = window.pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise
      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      renderPage(currentPage)
    } catch (error) {
      console.error("Error loading PDF:", error)
      renderFallbackDocument()
    }
  }

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return

    try {
      const page = await pdfDocRef.current.getPage(pageNumber)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = canvas.parentElement?.clientWidth || 550
      const fitScale = Math.min(containerWidth / viewport.width, zoomLevel / 100)
      const scaledViewport = page.getViewport({ scale: fitScale })

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = scaledViewport.height * devicePixelRatio
      canvas.width = scaledViewport.width * devicePixelRatio
      canvas.style.width = `${scaledViewport.width}px`
      canvas.style.height = `${scaledViewport.height}px`
      context.scale(devicePixelRatio, devicePixelRatio)

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      }

      await page.render(renderContext).promise
      setCurrentPage(pageNumber)
    } catch (error) {
      console.error("Error rendering PDF page:", error)
      renderFallbackDocument()
    }
  }

  const renderFallbackDocument = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const baseWidth = 612
    const baseHeight = 792
    const scale = zoomLevel / 100

    canvas.width = baseWidth * scale
    canvas.height = baseHeight * scale
    canvas.style.width = `${Math.min(canvas.parentElement?.clientWidth || 550, baseWidth * scale)}px`
    canvas.style.height = "auto"

    ctx.scale(scale, scale)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, baseWidth, baseHeight)

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

    ctx.textAlign = "left"
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 150)
    ctx.lineTo(562, 150)
    ctx.stroke()

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("LOAD INFORMATION", 50, 180)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const loadInfo = [
      `Load Number: ${extractedData?.loadNumber || "N/A"}`,
      `Reference: ${extractedData?.loadNumber || "N/A"}`,
      `Customer: ${extractedData?.broker?.name || "N/A"}`,
      `Rate: $${extractedData?.rate || "0.00"}`,
      `Commodity: ${extractedData?.commodity || "General Freight"}`,
      `Weight: ${extractedData?.weight ? extractedData.weight + " lbs" : "N/A"}`,
    ]
    loadInfo.forEach((info, index) => ctx.fillText(info, 50, 210 + index * 25))

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("PICKUP INFORMATION", 50, 380)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const pickupInfo = [
      `Location: ${extractedData?.pickupLocation?.city || "N/A"}, ${extractedData?.pickupLocation?.state || "N/A"}`,
      `Address: ${extractedData?.pickupLocation?.address || "N/A"}`,
      `Date: ${extractedData?.pickupDate ? new Date(extractedData.pickupDate).toLocaleDateString() : "N/A"}`,
      `Time: ${extractedData?.pickupDate?.split("T")[1]?.substring(0, 5) || "N/A"}`,
      `Contact: ${extractedData?.pickupLocation?.contactName || "N/A"}`,
      `Phone: ${extractedData?.pickupLocation?.contactPhone || "(555) 123-4567"}`,
    ]
    pickupInfo.forEach((info, index) => ctx.fillText(info, 50, 410 + index * 25))

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("DELIVERY INFORMATION", 50, 570)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const deliveryInfo = [
      `Location: ${extractedData?.deliveryLocation?.city || "N/A"}, ${extractedData?.deliveryLocation?.state || "N/A"}`,
      `Address: ${extractedData?.deliveryLocation?.address || "N/A"}`,
      `Date: ${extractedData?.deliveryDate ? new Date(extractedData.deliveryDate).toLocaleDateString() : "N/A"}`,
      `Time: ${extractedData?.deliveryDate?.split("T")[1]?.substring(0, 5) || "N/A"}`,
      `Contact: ${extractedData?.deliveryLocation?.contactName || "N/A"}`,
      `Phone: ${extractedData?.deliveryLocation?.contactPhone || "(555) 987-6543"}`,
    ]
    deliveryInfo.forEach((info, index) => ctx.fillText(info, 50, 600 + index * 25))

    ctx.fillStyle = "#059669"
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`TOTAL RATE: $${extractedData?.rate || "0.00"}`, baseWidth / 2, 730)
    ctx.font = "12px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("This rate confirmation is valid for 24 hours.", baseWidth / 2, 755)
    ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, baseWidth / 2, 775)

    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(25, 25, baseWidth - 50, baseHeight - 50)
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsExtracting(true)
    setDocumentName(file.name)

    // Reset extraction steps
    setExtractionSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))
    setExtractionProgress(0)

    try {
      // Step 1: Upload to Vercel Blob
      updateExtractionStep("upload", "processing")

      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/blob/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        updateExtractionStep("upload", "error")
        throw new Error("Failed to upload document")
      }

      const uploadResult = await uploadResponse.json()
      if (!uploadResult.success) {
        updateExtractionStep("upload", "error")
        throw new Error(uploadResult.error || "Failed to upload document")
      }

      setDocumentUrl(uploadResult.data.url)
      setUploadSuccess(true)
      setShowPreview(true)
      updateExtractionStep("upload", "completed")

      // Step 2: OCR Processing
      updateExtractionStep("ocr", "processing")
      console.log("OCR API route called")

      // Step 3: AI Extraction
      const fileType = file.type
      const reader = new FileReader()

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string

        try {
          updateExtractionStep("ocr", "completed")
          console.log("Processing document with AI service...")
          updateExtractionStep("ai", "processing")

          const extractResponse = await fetch("/api/ai/extract-document", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dataUrl }),
          })

          if (!extractResponse.ok) {
            updateExtractionStep("ai", "error")
            throw new Error("Failed to extract data from document")
          }

          console.log("AI extraction completed")
          updateExtractionStep("ai", "completed")

          // Step 4: Prepare form data
          updateExtractionStep("form", "processing")
          console.log("Preparing form data")

          const extractResult = await extractResponse.json()
          if (!extractResult.success) {
            updateExtractionStep("form", "error")
            throw new Error(extractResult.error || "Failed to extract data from document")
          }

          // This will trigger the useEffect that handles completion
          setExtractedData(extractResult.data)

          toast({
            title: "Data Extracted",
            description: "Document processed successfully. Please review the extracted information.",
          })
        } catch (error: any) {
          console.error("Error in extraction process:", error)
          setIsExtracting(false)
          toast({
            title: "Extraction Error",
            description: error.message || "Failed to process document",
            variant: "destructive",
          })
        }
      }

      reader.readAsDataURL(file)
    } catch (error: any) {
      console.error("Error processing document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process document",
        variant: "destructive",
      })
      setIsExtracting(false) // Set to false immediately on error
    } finally {
      // Remove the timeout logic - let the extraction complete naturally
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUrlSubmit = async () => {
    if (!imageUrl) return

    setIsExtracting(true)
    // Reset extraction steps
    setExtractionSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))
    setExtractionProgress(0)

    try {
      // Mark upload as completed immediately since we're using a URL
      updateExtractionStep("upload", "completed")

      // Start OCR and AI extraction
      updateExtractionStep("ocr", "processing")
      console.log("OCR API route called for URL")

      updateExtractionStep("ai", "processing")
      console.log("Processing URL with AI service...")

      const response = await fetch("/api/ai/extract-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataUrl: imageUrl }),
      })

      if (!response.ok) {
        updateExtractionStep("ai", "error")
        throw new Error("Failed to extract data from URL")
      }

      updateExtractionStep("ai", "completed")
      updateExtractionStep("form", "processing")
      console.log("Preparing form data from URL")

      const result = await response.json()
      if (!result.success) {
        updateExtractionStep("form", "error")
        throw new Error(result.error || "Failed to extract data from URL")
      }

      setExtractedData(result.data)
      setDocumentUrl(imageUrl)
      setDocumentName("Document from URL")
      setUploadSuccess(true)
      setExtractionSuccess(true)
      setShowPreview(true)
      updateExtractionStep("form", "completed")

      setActiveTab("review")
      toast({
        title: "Data Extracted",
        description: "Document processed successfully. Please review the extracted information.",
      })
    } catch (error: any) {
      console.error("Error processing URL:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process URL",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const generateUniqueLoadNumber = async (companyId: string, baseLoadNumber?: string): Promise<string> => {
    let loadNumber = baseLoadNumber
    let attempt = 0
    const maxAttempts = 10

    while (attempt < maxAttempts) {
      if (!loadNumber || attempt > 0) {
        const timestamp = Date.now().toString()
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")
        const suffix = attempt > 0 ? `-${attempt}` : ""
        loadNumber = `LOAD-${timestamp.slice(-8)}${random}${suffix}`
      }

      // Check if this load number already exists for this company
      const { data: existingLoad, error: checkError } = await supabase
        .from("loads")
        .select("id")
        .eq("company_id", companyId)
        .eq("load_number", loadNumber)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking load number uniqueness:", checkError)
        throw new Error(`Failed to verify load number uniqueness: ${checkError.message}`)
      }

      if (!existingLoad) {
        return loadNumber // This load number is unique
      }

      attempt++
      loadNumber = "" // Reset for next attempt
    }

    throw new Error("Unable to generate a unique load number after multiple attempts")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user?.companyId) {
        throw new Error("User company information is missing. Cannot create load.")
      }

      const formData = new FormData(e.currentTarget)

      // Get form values
      const customerName = (formData.get("customer_name") as string) || extractedData?.broker?.name || ""
      const pickupAddress = (formData.get("pickup_address") as string) || extractedData?.pickupLocation?.address || ""
      const pickupCity = (formData.get("pickup_city") as string) || extractedData?.pickupLocation?.city || ""
      const pickupState = (formData.get("pickup_state") as string) || extractedData?.pickupLocation?.state || ""
      const pickupZip = (formData.get("pickup_zip") as string) || extractedData?.pickupLocation?.zip || ""
      const pickupDate = (formData.get("pickup_date") as string) || extractedData?.pickupDate?.split("T")[0] || ""
      const pickupTime =
        (formData.get("pickup_time") as string) || extractedData?.pickupDate?.split("T")[1]?.substring(0, 5) || ""
      const deliveryAddress =
        (formData.get("delivery_address") as string) || extractedData?.deliveryLocation?.address || ""
      const deliveryCity = (formData.get("delivery_city") as string) || extractedData?.deliveryLocation?.city || ""
      const deliveryState = (formData.get("delivery_state") as string) || extractedData?.deliveryLocation?.state || ""
      const deliveryZip = (formData.get("delivery_zip") as string) || extractedData?.deliveryLocation?.zip || ""
      const deliveryDate = (formData.get("delivery_date") as string) || extractedData?.deliveryDate?.split("T")[0] || ""
      const deliveryTime =
        (formData.get("delivery_time") as string) || extractedData?.deliveryDate?.split("T")[1]?.substring(0, 5) || ""
      const rate = formData.get("rate")
        ? Number.parseFloat(formData.get("rate") as string)
        : extractedData?.rate || null
      const distance = formData.get("distance") ? Number.parseFloat(formData.get("distance") as string) : null
      const weight = formData.get("weight")
        ? Number.parseFloat(formData.get("weight") as string)
        : extractedData?.weight || null
      const commodity = (formData.get("commodity") as string) || extractedData?.commodity || ""
      const specialInstructions =
        (formData.get("special_instructions") as string) || extractedData?.specialInstructions || ""
      const vinNumber = (formData.get("vin_number") as string) || extractedData?.vin || ""
      const equipmentType = (formData.get("equipment_type") as string) || ""

      // Generate a unique load number if not provided
      let loadNumber = (formData.get("load_number") as string) || extractedData?.loadNumber || ""

      if (!loadNumber) {
        // Generate a more unique load number using timestamp + random
        const timestamp = Date.now().toString()
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
        loadNumber = `LOAD-${timestamp.slice(-8)}${random}`
      }

      const referenceNumber = (formData.get("reference_number") as string) || extractedData?.loadNumber || ""
      const appointmentNumber = (formData.get("appointment_number") as string) || extractedData?.appointmentNumber || ""
      const brokerEmail = (formData.get("broker_email") as string) || extractedData?.broker?.email || ""
      const pickupHours =
        (formData.get("pickup_hours") as string) || extractedData?.pickupLocation?.operatingHours || ""
      const pickupContactName =
        (formData.get("pickup_contact_name") as string) || extractedData?.pickupLocation?.contactName || ""
      const pickupContactPhone =
        (formData.get("pickup_contact_phone") as string) || extractedData?.pickupLocation?.contactPhone || ""

      // Validate required fields
      if (!pickupDate) {
        throw new Error("Pickup date is required")
      }
      if (!deliveryDate) {
        throw new Error("Delivery date is required")
      }

      // Use server action to create customer and load (bypasses RLS)
      const response = await fetch("/api/loads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          companyId: user.companyId,
          userId: user.id,
          loadData: {
            load_number: loadNumber,
            reference_number: referenceNumber,
            pickup_address: pickupAddress,
            pickup_city: pickupCity,
            pickup_state: pickupState,
            pickup_zip: pickupZip || null,
            pickup_date: pickupDate,
            pickup_time: pickupTime || null,
            pickup_contact_name: pickupContactName || null,
            pickup_contact_phone: pickupContactPhone || null,
            pickup_operating_hours: pickupHours || null,
            delivery_address: deliveryAddress,
            delivery_city: deliveryCity,
            delivery_state: deliveryState,
            delivery_zip: deliveryZip || null,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime || null,
            rate: rate,
            distance: distance,
            weight: weight,
            commodity: commodity || null,
            special_instructions: specialInstructions || null,
            vin_number: vinNumber || null,
            equipment_type: equipmentType || null,
            appointment_number: appointmentNumber || null,
            blob_url: documentUrl || null,
            broker_email: brokerEmail || null,
            rate_confirmation_pdf_url: documentUrl || null,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create load")
      }

      const result = await response.json()

      console.log("✅ Load created successfully:", result.load)

      toast({
        title: "Success",
        description: `Load ${result.load.load_number} created successfully`,
      })

      onClose()
    } catch (error: any) {
      console.error("❌ Error submitting form:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create load",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for default values
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const closePreview = () => {
    setShowPreview(false)
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1)
    }
  }

  const handleDownloadPDF = () => {
    if (documentUrl) {
      const a = document.createElement("a")
      a.href = documentUrl
      a.download = documentName || "document.pdf"
      a.target = "_blank"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex">
        {/* Document Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-r border-gray-200 flex flex-col h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Document Preview</h2>
              <Button variant="ghost" size="icon" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm truncate">{documentName}</span>
                <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {documentUrl && (
                <div className="flex justify-center">
                  {documentUrl.endsWith(".pdf") ? (
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-300 shadow-lg bg-white rounded"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  ) : (
                    <img
                      src={documentUrl || "/placeholder.svg"}
                      alt="Document preview"
                      className="max-w-full object-contain border border-gray-300 shadow-lg bg-white rounded"
                      style={{ maxHeight: "calc(90vh - 180px)", width: `${zoomLevel}%` }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">Previous</span>
                </Button>

                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>

                <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages}>
                  <span className="mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoomLevel}%</span>
                <Button variant="outline" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Document uploaded successfully</span>
                </div>
                {isExtracting ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting data from document...</span>
                  </div>
                ) : extractionSuccess ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <BarChart className="h-4 w-4" />
                    <span>Data extraction completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BarChart className="h-4 w-4" />
                    <span>Ready for data extraction</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ZoomIn className="h-4 w-4" />
                  <span>Use zoom controls to adjust view</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Panel */}
        <div className={cn("flex flex-col h-[90vh]", showPreview ? "w-1/2" : "w-full")}>
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <DialogTitle>Create New Load</DialogTitle>
            <p className="text-sm text-gray-500">
              Upload a document for automatic data extraction or enter details manually
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Document</TabsTrigger>
                  <TabsTrigger value="review" disabled={!extractedData} className="relative">
                    Review & Edit
                    {isExtracting && <Loader2 className="h-3 w-3 animate-spin ml-2 text-primary" />}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="p-6 space-y-6 relative">
                <div
                  className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
                  />
                  <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-semibold">Upload Bill of Lading</h3>
                  <p className="text-sm text-gray-500">Drag & drop or click to select PDF/image files</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Or enter image URL</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/bill-of-lading.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit} disabled={!imageUrl || isExtracting} type="button">
                      {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isExtracting && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                    <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md w-full mx-4">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">Processing Document</h3>
                          <p className="text-sm text-gray-600">
                            {currentExtractionStep === "upload" && "Uploading your document..."}
                            {currentExtractionStep === "ocr" && "OCR processing document..."}
                            {currentExtractionStep === "ai" && "AI extracting load information..."}
                            {currentExtractionStep === "form" && "Preparing form data..."}
                          </p>
                          <Progress value={extractionProgress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{extractionProgress}% complete</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-600 space-y-2">
                            {extractionSteps.map((step) => (
                              <div key={step.id} className="flex items-center space-x-2">
                                {step.status === "pending" && (
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  </div>
                                )}
                                {step.status === "processing" && (
                                  <div className="w-4 h-4 flex items-center justify-center text-primary">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                )}
                                {step.status === "completed" && (
                                  <div className="w-4 h-4 flex items-center justify-center text-green-500">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                )}
                                {step.status === "error" && (
                                  <div className="w-4 h-4 flex items-center justify-center text-red-500">
                                    <X className="w-4 h-4" />
                                  </div>
                                )}
                                <span
                                  className={cn(
                                    "flex-1",
                                    step.status === "processing" && "text-primary font-medium",
                                    step.status === "completed" && "text-green-600",
                                    step.status === "error" && "text-red-500",
                                  )}
                                >
                                  {step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 italic">
                          This may take up to 30 seconds depending on document complexity
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual">
                <form id="manual-form" onSubmit={handleSubmit} className="space-y-6 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Load Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reference_number">Reference Number *</Label>
                        <Input id="reference_number" name="reference_number" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="load_number">Load Number</Label>
                        <Input id="load_number" name="load_number" placeholder="Auto-generated if empty" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointment_number">Appointment Number</Label>
                        <Input id="appointment_number" name="appointment_number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_name">Customer/Broker *</Label>
                        <Input id="customer_name" name="customer_name" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="broker_email">Broker Email</Label>
                      <Input id="broker_email" name="broker_email" type="email" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pickup Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pickup_address">Pickup Address *</Label>
                      <Input id="pickup_address" name="pickup_address" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_city">City *</Label>
                        <Input id="pickup_city" name="pickup_city" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_state">State *</Label>
                        <Input id="pickup_state" name="pickup_state" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_zip">ZIP Code</Label>
                        <Input id="pickup_zip" name="pickup_zip" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_date">Pickup Date *</Label>
                        <Input id="pickup_date" name="pickup_date" type="date" defaultValue={today} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_time">Pickup Time</Label>
                      <Input id="pickup_time" name="pickup_time" type="time" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_hours">Pickup Hours</Label>
                      <Input id="pickup_hours" name="pickup_hours" placeholder="e.g., 8:00 AM - 5:00 PM" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact_name">Pickup Contact Name</Label>
                        <Input id="pickup_contact_name" name="pickup_contact_name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact_phone">Pickup Contact Phone</Label>
                        <Input id="pickup_contact_phone" name="pickup_contact_phone" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Delivery Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Input id="delivery_address" name="delivery_address" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_city">City *</Label>
                        <Input id="delivery_city" name="delivery_city" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_state">State *</Label>
                        <Input id="delivery_state" name="delivery_state" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_zip">ZIP Code</Label>
                        <Input id="delivery_zip" name="delivery_zip" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_date">Delivery Date *</Label>
                        <Input id="delivery_date" name="delivery_date" type="date" defaultValue={tomorrow} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery_time">Delivery Time</Label>
                      <Input id="delivery_time" name="delivery_time" type="time" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Load Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Rate ($)</Label>
                        <Input id="rate" name="rate" type="number" min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="distance">Distance (miles)</Label>
                        <Input id="distance" name="distance" type="number" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input id="weight" name="weight" type="number" min="0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commodity">Commodity</Label>
                        <Input id="commodity" name="commodity" placeholder="e.g., Electronics, Food, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="equipment_type">Equipment Type</Label>
                        <Input id="equipment_type" name="equipment_type" defaultValue="dry_van" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vin_number">VIN Number</Label>
                      <Input id="vin_number" name="vin_number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special_instructions">Special Instructions</Label>
                      <Textarea id="special_instructions" name="special_instructions" />
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="review">
                {extractedData && (
                  <form id="review-form" onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Load Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reference_number">Reference Number *</Label>
                          <Input
                            id="reference_number"
                            name="reference_number"
                            defaultValue={extractedData.loadNumber || ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="load_number">Load Number</Label>
                          <Input
                            id="load_number"
                            name="load_number"
                            defaultValue={extractedData.loadNumber || ""}
                            placeholder="Auto-generated if empty"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="appointment_number">Appointment Number</Label>
                          <Input
                            id="appointment_number"
                            name="appointment_number"
                            defaultValue={extractedData.appointmentNumber || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_name">Customer/Broker *</Label>
                          <Input
                            id="customer_name"
                            name="customer_name"
                            defaultValue={extractedData.broker?.name || ""}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="broker_email">Broker Email</Label>
                        <Input
                          id="broker_email"
                          name="broker_email"
                          type="email"
                          defaultValue={extractedData.broker?.email || ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pickup Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_address">Pickup Address *</Label>
                        <Input
                          id="pickup_address"
                          name="pickup_address"
                          defaultValue={extractedData.pickupLocation?.address || ""}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_city">City *</Label>
                          <Input
                            id="pickup_city"
                            name="pickup_city"
                            defaultValue={extractedData.pickupLocation?.city || ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup_state">State *</Label>
                          <Input
                            id="pickup_state"
                            name="pickup_state"
                            defaultValue={extractedData.pickupLocation?.state || ""}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_zip">ZIP Code</Label>
                          <Input
                            id="pickup_zip"
                            name="pickup_zip"
                            defaultValue={extractedData.pickupLocation?.zip || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup_date">Pickup Date *</Label>
                          <Input
                            id="pickup_date"
                            name="pickup_date"
                            type="date"
                            defaultValue={extractedData.pickupDate?.split("T")[0] || today}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pickup_time">Pickup Time</Label>
                        <Input
                          id="pickup_time"
                          name="pickup_time"
                          type="time"
                          defaultValue={extractedData.pickupDate?.split("T")[1]?.substring(0, 5) || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pickup_hours">Pickup Hours</Label>
                        <Input
                          id="pickup_hours"
                          name="pickup_hours"
                          defaultValue={extractedData.pickupLocation?.operatingHours || ""}
                          placeholder="e.g., 8:00 AM - 5:00 PM"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_contact_name">Pickup Contact Name</Label>
                          <Input
                            id="pickup_contact_name"
                            name="pickup_contact_name"
                            defaultValue={extractedData.pickupLocation?.contactName || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup_contact_phone">Pickup Contact Phone</Label>
                          <Input
                            id="pickup_contact_phone"
                            name="pickup_contact_phone"
                            defaultValue={extractedData.pickupLocation?.contactPhone || ""}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Delivery Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_address">Delivery Address *</Label>
                        <Input
                          id="delivery_address"
                          name="delivery_address"
                          defaultValue={extractedData.deliveryLocation?.address || ""}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="delivery_city">City *</Label>
                          <Input
                            id="delivery_city"
                            name="delivery_city"
                            defaultValue={extractedData.deliveryLocation?.city || ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_state">State *</Label>
                          <Input
                            id="delivery_state"
                            name="delivery_state"
                            defaultValue={extractedData.deliveryLocation?.state || ""}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="delivery_zip">ZIP Code</Label>
                          <Input
                            id="delivery_zip"
                            name="delivery_zip"
                            defaultValue={extractedData.deliveryLocation?.zip || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_date">Delivery Date *</Label>
                          <Input
                            id="delivery_date"
                            name="delivery_date"
                            type="date"
                            defaultValue={extractedData.deliveryDate?.split("T")[0] || tomorrow}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery_time">Delivery Time</Label>
                        <Input
                          id="delivery_time"
                          name="delivery_time"
                          type="time"
                          defaultValue={extractedData.deliveryDate?.split("T")[1]?.substring(0, 5) || ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Load Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rate">Rate ($)</Label>
                          <Input
                            id="rate"
                            name="rate"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={extractedData.rate || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="distance">Distance (miles)</Label>
                          <Input id="distance" name="distance" type="number" min="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (lbs)</Label>
                          <Input
                            id="weight"
                            name="weight"
                            type="number"
                            min="0"
                            defaultValue={extractedData.weight || ""}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commodity">Commodity</Label>
                          <Input
                            id="commodity"
                            name="commodity"
                            defaultValue={extractedData.commodity || ""}
                            placeholder="e.g., Electronics, Food, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equipment_type">Equipment Type</Label>
                          <Input id="equipment_type" name="equipment_type" defaultValue="dry_van" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vin_number">VIN Number</Label>
                        <Input id="vin_number" name="vin_number" defaultValue={extractedData.vin || ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="special_instructions">Special Instructions</Label>
                        <Textarea
                          id="special_instructions"
                          name="special_instructions"
                          defaultValue={extractedData.specialInstructions || ""}
                        />
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={activeTab === "manual" ? "manual-form" : "review-form"}
              disabled={isLoading || (activeTab === "review" && !extractedData)}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Load
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
