"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Mail, Loader2, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AICommunicationPanelProps {
  load: any
}

export function AICommunicationPanel({ load }: AICommunicationPanelProps) {
  const [brokerEmail, setBrokerEmail] = useState("")
  const [driverInstructions, setDriverInstructions] = useState("")
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false)
  const { toast } = useToast()

  const generateBrokerEmail = async () => {
    if (!load || !load.id) {
      toast({
        title: "Error",
        description: "No load data available. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingEmail(true)
    try {
      console.log("Sending load data to broker email API:", load)
      const response = await fetch("/api/ai/broker-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadData: load }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate email")
      }

      const data = await response.json()
      setBrokerEmail(data.email)
      toast({
        title: "Email Generated",
        description: "Broker email has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating broker email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate broker email.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const generateDriverInstructions = async () => {
    if (!load || !load.id) {
      toast({
        title: "Error",
        description: "No load data available. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingInstructions(true)
    try {
      console.log("Sending load data to driver instructions API:", load)
      const response = await fetch("/api/ai/driver-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadData: load }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate instructions")
      }

      const data = await response.json()
      setDriverInstructions(data.instructions)
      toast({
        title: "Instructions Generated",
        description: "Driver instructions have been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating driver instructions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate driver instructions.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInstructions(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: `${type} copied to clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Broker Email Card */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Broker Email</CardTitle>
          <CardDescription className="text-gray-600">
            Generate professional emails to brokers about load status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateBrokerEmail}
            disabled={isGeneratingEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGeneratingEmail ? (
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

          {brokerEmail && (
            <div className="space-y-2 mt-4">
              <Textarea
                value={brokerEmail}
                onChange={(e) => setBrokerEmail(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(brokerEmail, "Broker email")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Instructions Card */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Driver Instructions</CardTitle>
          <CardDescription className="text-gray-600">Generate detailed instructions for drivers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateDriverInstructions}
            disabled={isGeneratingInstructions}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGeneratingInstructions ? (
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

          {driverInstructions && (
            <div className="space-y-2 mt-4">
              <Textarea
                value={driverInstructions}
                onChange={(e) => setDriverInstructions(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(driverInstructions, "Driver instructions")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Instructions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
