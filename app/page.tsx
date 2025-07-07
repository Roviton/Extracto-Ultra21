"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, Upload, FileText, Search, Brain } from "lucide-react"
import { useModal } from "@/hooks/use-modal"

export default function HomePage() {
  const { onOpen } = useModal()

  const openDocumentUploadModal = () => {
    onOpen("enhancedNewLoad")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2 transform group-hover:scale-105 transition duration-200">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-2xl font-black text-gray-900">
                  Extracto<span className="text-blue-600 font-extrabold">Ultra21</span>
                </div>
                <div className="text-xs text-gray-600 font-medium tracking-wide">Document OCR Extraction</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Document OCR <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Extraction</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your PDF or image documents and let our AI extract the data automatically.
          </p>
        </div>

        {/* Upload Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">Document Upload</CardTitle>
              <CardDescription>
                Upload a document to extract data using OCR and AI technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer" onClick={openDocumentUploadModal}>
                <Upload className="h-12 w-12 text-blue-600 mb-4" />
                <p className="text-lg font-medium text-gray-900">Click to upload a document</p>
                <p className="text-sm text-gray-500 mt-1">Support for PDF, JPEG, PNG, and WebP</p>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-medium">Upload</h3>
                  <p className="text-xs text-center text-gray-500">Drag & drop or click to upload</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <Search className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium">Extract</h3>
                  <p className="text-xs text-center text-gray-500">OCR processes your document</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-medium">Review</h3>
                  <p className="text-xs text-center text-gray-500">Review and edit extracted data</p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
                onClick={openDocumentUploadModal}
              >
                <FileUp className="mr-2 h-5 w-5" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-black">
                Extracto<span className="text-blue-400 font-extrabold">Ultra21</span>
              </div>
              <div className="text-xs text-gray-400 font-medium tracking-wide">Document OCR Extraction</div>
            </div>
          </div>
          <p className="text-gray-400">© 2025 ExtractoUltra21. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
