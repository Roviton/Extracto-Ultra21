"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, FileText, Mail, MapPin, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AITestPanel() {
  const { toast } = useToast()
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isInstructionsLoading, setIsInstructionsLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [emailResult, setEmailResult] = useState<string>("")
  const [instructionsResult, setInstructionsResult] = useState<string>("")
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [instructionsError, setInstructionsError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isPdfFile, setIsPdfFile] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsPdfFile(file.type === "application/pdf")

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For PDFs, show PDF icon
      setFilePreview(null)
    }
  }

  const handleOcrTest = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to process",
        variant: "destructive",
      })
      return
    }

    setIsOcrLoading(true)
    setOcrError(null)
    setOcrResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setOcrResult(result.data)
        toast({
          title: "OCR Successful",
          description: `Extracted data from ${selectedFile.name} using ${result.processingMethod || "AI vision"} method`,
        })
      } else {
        setOcrError(result.error || "Unknown error occurred")
        toast({
          title: "OCR Failed",
          description: result.error || "Failed to extract data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("OCR test error:", error)
      setOcrError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "OCR Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsOcrLoading(false)
    }
  }

  const handleEmailTest = async () => {
    setIsEmailLoading(true)
    setEmailError(null)

    try {
      // Use OCR data if available, otherwise use sample data
      const loadData = ocrResult || {
        loadNumber: "LD-2024-001",
        pickupDate: "2024-01-10",
        deliveryDate: "2024-01-15",
        broker: {
          name: "ABC Logistics",
          email: "broker@acmelogistics.com",
        },
        driver: {
          name: "John Smith",
        },
        pickupLocation: {
          address: "123 Pickup St",
          city: "Los Angeles",
          state: "CA",
        },
        deliveryLocation: {
          address: "456 Delivery Ave",
          city: "Phoenix",
          state: "AZ",
        },
        status: "En Route",
      }

      const response = await fetch("/api/ai/broker-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loadData }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setEmailResult(result.email)
        toast({
          title: "Email Generated",
          description: "Broker email generated successfully",
        })
      } else {
        throw new Error(result.error || "Failed to generate email")
      }
    } catch (error) {
      console.error("Email test error:", error)
      setEmailError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Email Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleInstructionsTest = async () => {
    setIsInstructionsLoading(true)
    setInstructionsError(null)

    try {
      // Use OCR data if available, otherwise use sample data
      const loadData = ocrResult || {
        loadNumber: "LD-2024-001",
        pickupLocation: {
          address: "123 Pickup St, Los Angeles, CA 90001",
        },
        deliveryLocation: {
          address: "456 Delivery Ave, Phoenix, AZ 85001",
        },
        commodity: "Electronics",
        vin: "1HGBH41JXMN109186",
        specialInstructions: "Fragile items, handle with care",
      }

      const response = await fetch("/api/ai/driver-instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loadData }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setInstructionsResult(result.instructions)
        toast({
          title: "Instructions Generated",
          description: "Driver instructions generated successfully",
        })
      } else {
        throw new Error(result.error || "Failed to generate instructions")
      }
    } catch (error) {
      console.error("Instructions test error:", error)
      setInstructionsError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Instructions Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsInstructionsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Feature Testing</h2>
        <p className="text-muted-foreground">Test AI-powered features for your freight dispatch system</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Full Document Support:</strong> Upload images (JPEG, PNG, WebP) or PDF documents for AI extraction.
          Both formats are fully supported!
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Document OCR</CardTitle>
          <CardDescription>
            Upload an image of a bill of lading or rate confirmation to extract data using AI vision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {filePreview ? (
                    <img src={filePreview || "/placeholder.svg"} alt="Preview" className="max-h-40 mb-4" />
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{selectedFile.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isPdfFile ? "PDF Document" : "Image File"} - Ready for processing
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, PNG, JPG, WEBP (MAX. 10MB) - All formats fully supported
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <Button onClick={handleOcrTest} disabled={isOcrLoading || !selectedFile}>
              {isOcrLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Extract Data"
              )}
            </Button>
          </div>

          {ocrResult && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Extracted Data:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(ocrResult, null, 2)}</pre>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  OCR data will be used for email and instructions generation below.
                </p>
              </div>
            </div>
          )}

          {ocrError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Processing Error:</p>
                  <p>{ocrError}</p>
                  {isPdfFile && (
                    <p className="mt-2 text-sm">
                      Try converting your PDF to an image format (JPEG/PNG) for better results.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Broker Email</CardTitle>
            <CardDescription>Generate professional emails to brokers about load status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleEmailTest} disabled={isEmailLoading}>
              {isEmailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Test Email Generation
                </>
              )}
            </Button>

            {emailResult && (
              <div className="mt-4">
                <Textarea value={emailResult} readOnly className="min-h-[300px] font-mono text-sm" />
              </div>
            )}

            {emailError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
                <p>{emailError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Instructions</CardTitle>
            <CardDescription>Generate detailed instructions for drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstructionsTest} disabled={isInstructionsLoading}>
              {isInstructionsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Test Instructions
                </>
              )}
            </Button>

            {instructionsResult && (
              <div className="mt-4">
                <Textarea value={instructionsResult} readOnly className="min-h-[300px] font-mono text-sm" />
              </div>
            )}

            {instructionsError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
                <p>{instructionsError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
