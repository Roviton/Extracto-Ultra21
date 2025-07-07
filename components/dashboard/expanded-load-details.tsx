"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Paperclip } from "lucide-react"
import type { Load } from "@/components/dashboard/loads-data-table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, RefreshCw, Mail, Edit, Save, Clipboard } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface ExpandedLoadDetailsProps {
  load: Load
}

export function ExpandedLoadDetails({ load }: ExpandedLoadDetailsProps) {
  const { user } = useAuth()
  // Sample communication thread data
  const messages = [
    {
      id: 1,
      sender: "Dispatcher",
      senderAvatar: "/emergency-dispatcher.png",
      content: `Hello, you have been assigned to load ${load.id} from ${load.origin} to ${load.destination}. Pickup is scheduled for ${new Date(load.pickupDate).toLocaleDateString()} and delivery for ${new Date(load.deliveryDate).toLocaleDateString()}. Please confirm if you accept this assignment.`,
      timestamp: "2025-05-14T15:45:00",
    },
    {
      id: 2,
      sender: load.driver?.name || "Driver",
      senderAvatar: load.driver?.avatar || "/professional-driver.png",
      content: "I accept the load. Will be at pickup location on time.",
      timestamp: "2025-05-14T16:10:00",
    },
    {
      id: 3,
      sender: "Dispatcher",
      senderAvatar: "/emergency-dispatcher.png",
      content: "Great! Let me know when you arrive at the pickup location.",
      timestamp: "2025-05-14T16:15:00",
    },
    ...(load.timeline?.arrivedPickup
      ? [
          {
            id: 4,
            sender: load.driver?.name || "Driver",
            senderAvatar: load.driver?.avatar || "/professional-driver.png",
            content: "I've arrived at the pickup location.",
            timestamp: load.timeline.arrivedPickup,
          },
        ]
      : []),
    ...(load.timeline?.departedPickup
      ? [
          {
            id: 5,
            sender: load.driver?.name || "Driver",
            senderAvatar: load.driver?.avatar || "/professional-driver.png",
            content: "Loading complete. I'm departing from pickup now.",
            timestamp: load.timeline.departedPickup,
          },
        ]
      : []),
  ]

  // Sample broker emails
  const [brokerEmails, setBrokerEmails] = useState([
    {
      id: 1,
      subject: `Load Update: ${load.id} - Driver Assigned`,
      recipient: "broker@acmelogistics.com",
      sentAt: "2025-05-14T15:50:00",
      content: "Hello, this is an update regarding your load...",
      saved: false,
    },
    {
      id: 2,
      subject: `Load Update: ${load.id} - Driver En Route to Pickup`,
      recipient: "broker@acmelogistics.com",
      sentAt: "2025-05-14T16:20:00",
      content: "Hello, this is an update regarding your load...",
      saved: false,
    },
    ...(load.timeline?.arrivedPickup
      ? [
          {
            id: 3,
            subject: `Load Update: ${load.id} - Driver Arrived at Pickup`,
            recipient: "broker@acmelogistics.com",
            sentAt: load.timeline.arrivedPickup,
            content: "Hello, this is an update regarding your load...",
            saved: false,
          },
        ]
      : []),
    ...(load.timeline?.departedPickup
      ? [
          {
            id: 4,
            subject: `Load Update: ${load.id} - Driver Departed from Pickup`,
            recipient: "broker@acmelogistics.com",
            sentAt: load.timeline.departedPickup,
            content: "Hello, this is an update regarding your load...",
            saved: false,
          },
        ]
      : []),
  ])

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const initialDraftContent = `Hello ${load.details?.brokerContact?.split(" ")[0] || "Mike"},\n\nI'm pleased to inform you that load ${load.id} (${load.reference}) has been successfully picked up and our driver ${load.driver?.name || "John Smith"} is now en route to the delivery destination.\n\n**Current Status:** In Transit\n**Pickup Completed:** ${new Date().toLocaleString()}\n**Estimated Delivery:** ${new Date(load.deliveryDate).toLocaleDateString()} at 09:00\n**Route:** ${load.origin} → ${load.destination}\n\nThe load is secure and we're tracking progress in real-time. I'll send another update when the driver arrives at the delivery location or if there are any changes to the schedule.\n\nPlease don't hesitate to reach out if you need any additional information or have specific delivery instructions.\n\nBest regards,\nYour Dispatcher\nFreight Dispatch System`

  const [isEditing, setIsEditing] = useState(false)
  const [draftContent, setDraftContent] = useState(initialDraftContent)

  const regenerateDraft = () => {
    const newDraft = `Hello ${load.details?.brokerContact?.split(" ")[0] || "Mike"},\n\nI'm writing to provide you with an update on load ${load.id} (${load.reference}).\n\n**Current Status:** ${load.status}\n**Driver:** ${load.driver?.name || "John Smith"}\n**Current Location:** En route to ${load.destination}\n**Estimated Delivery:** ${new Date(load.deliveryDate).toLocaleDateString()} at 09:00\n**Route:** ${load.origin} → ${load.destination}\n\nOur driver is making good progress and we're monitoring the shipment closely. I'll keep you updated on any significant developments or if there are any changes to the delivery schedule.\n\nIf you have any questions or need additional information, please don't hesitate to contact me.\n\nBest regards,\nYour Dispatcher\nFreight Dispatch System`
    setDraftContent(newDraft)
  }

  const handleEditSave = () => {
    if (isEditing) {
      // Save the email to broker emails
      const newEmail = {
        id: brokerEmails.length + 1,
        subject: `Load Update: ${load.id} - Driver Departed from Pickup`,
        recipient: load.details?.brokerEmail || "broker@acmelogistics.com",
        sentAt: new Date().toISOString(),
        content: draftContent,
        saved: true,
      }
      setBrokerEmails([...brokerEmails, newEmail])
      alert("Email saved to Broker Updates tab")
    }
    // Toggle editing mode
    setIsEditing(!isEditing)
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      {/* Left side - Rate Confirmation Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rate Confirmation</h3>
            <Badge variant="outline" className="ml-2">
              {load.rate}
            </Badge>
          </div>
          <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-md border bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">Rate Confirmation PDF</p>
                <p className="text-xs text-muted-foreground">
                  {load.reference} - {load.customer}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>rate-confirmation-{load.id.toLowerCase()}.pdf</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Right side - Tabs for Load Details, Communication, and Broker Emails */}
      <Card>
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Load Details
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex-1">
              Communication
            </TabsTrigger>
            <TabsTrigger value="broker" className="flex-1">
              Broker Updates
            </TabsTrigger>
          </TabsList>

          {/* Load Details Tab */}
          <TabsContent value="details" className="p-0 flex-1 flex flex-col h-full">
            <div className="p-4 h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Load ID / Reference:</span>
                      <p>
                        {load.id} / {load.reference}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Broker/Customer:</span>
                      <p>{load.customer}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Origin Name & Address:</span>
                      <p>{load.originCompany || "ABC Warehouse"}</p>
                      <p>{load.originAddress || `123 Shipping Lane, ${load.origin}`}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Pickup Date & Time:</span>
                      <p>
                        {new Date(load.pickupDate).toLocaleDateString()} {load.pickupTime || "14:00-16:00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Shipper Contact:</span>
                      <p>
                        {load.shipperContact || "John Smith"} • {load.shipperPhone || "555-123-4567"}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Pickup Number (PU#):</span>
                      <p>{load.pickupNumber || "PU12345"}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Destination Name & Address:</span>
                      <p>{load.destinationCompany || "XYZ Distribution Center"}</p>
                      <p>{load.destinationAddress || `456 Receiving Blvd, ${load.destination}`}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Delivery Date & Time:</span>
                      <p>
                        {new Date(load.deliveryDate).toLocaleDateString()} {load.deliveryTime || "09:00-11:00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Consignee Contact:</span>
                      <p>
                        {load.consigneeContact || "Jane Doe"} • {load.consigneePhone || "555-987-6543"}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Delivery Number (DEL#):</span>
                      <p>{load.deliveryNumber || "DEL67890"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Commodity:</span>
                      <p>{load.commodity || "General Freight"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Weight:</span>
                      <p>{load.weight || "42,000 lbs"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Quantity:</span>
                      <p>{load.quantity || "12 pallets"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Dimensions:</span>
                      <p>{load.dimensions || '48" x 40" x 60"'}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Equipment Type:</span>
                      <p>{load.equipment || "Dry Van"}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Rate:</span>
                      <p>{load.rate}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Distance:</span>
                      <p>{load.distance} miles</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">RPM:</span>
                      <p>${load.rpm?.toFixed(2)}/mi</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Status:</span>
                      <p>{load.status}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Broker Contact:</span>
                      <p>
                        {load.brokerContact || "Mike Johnson"} • {load.brokerPhone || "555-789-0123"} •{" "}
                        {load.brokerEmail || "mike@acmelogistics.com"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Booked By:</span>
                      <p>{load.dispatcher || "Unknown dispatcher"}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Special Instructions / Notes:</span>
                      <p className="whitespace-pre-line">
                        {load.notes ||
                          "- Driver must check in at security gate\n- Lumper fee to be paid by carrier (reimbursable with receipt)\n- Hard hat and safety vest required\n- Call consignee 1 hour before arrival"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-xs font-medium text-muted-foreground">Manager Comments:</span>
                      <p className="whitespace-pre-line">{load.comments || "No manager comments"}</p>
                    </div>
                  </div>

                  {load.driver && (
                    <div className="mt-4 border-t pt-4">
                      <span className="text-xs font-medium text-muted-foreground">Assigned Driver:</span>
                      <div className="mt-2 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={load.driver.avatar || "/placeholder.svg"} alt={load.driver.name} />
                          <AvatarFallback>
                            {load.driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{load.driver.name}</p>
                          <p className="text-xs text-muted-foreground">{load.driver.phone || "555-555-5555"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="p-0 flex-1 flex flex-col h-full">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={load.driver?.avatar || "/professional-driver.png"}
                      alt={load.driver?.name || "Driver"}
                    />
                    <AvatarFallback>
                      {load.driver?.name
                        ? load.driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{load.driver?.name || "Unassigned Driver"}</p>
                    <p className="text-xs text-muted-foreground">via Telegram Bot</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Online
                </Badge>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 py-4 px-4">
                  {/* Initial load assignment message */}
                  <div className="flex justify-end gap-3">
                    <div className="max-w-[80%] rounded-lg bg-blue-600 text-white p-3">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <span className="text-xs font-medium">Dispatcher</span>
                        <span className="text-xs opacity-70">2:45 PM</span>
                      </div>
                      <p className="text-sm">
                        Hello {load.driver?.name?.split(" ")[0] || "Driver"}, you have been assigned to load {load.id}{" "}
                        from {load.origin} to {load.destination}. Pickup:{" "}
                        {new Date(load.pickupDate).toLocaleDateString()} at 14:00-16:00 Delivery:{" "}
                        {new Date(load.deliveryDate).toLocaleDateString()} at 09:00-11:00 Rate: {load.rate}
                      </p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/emergency-dispatcher.png" alt="Dispatcher" />
                      <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Driver inline keyboard response (only visible to driver) */}
                  {user?.role === "driver" && (
                    <div className="flex justify-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={load.driver?.avatar || "/professional-driver.png"} alt="Driver" />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                      <div className="max-w-[80%]">
                        <div className="rounded-lg bg-muted p-3 mb-2">
                          <div className="mb-1 flex items-center justify-between gap-4">
                            <span className="text-xs font-medium">Driver</span>
                            <span className="text-xs text-muted-foreground">2:47 PM</span>
                          </div>
                          <p className="text-sm">Load assignment received</p>
                        </div>
                        {/* Inline keyboard for driver */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white">
                            ✅ Accept Load
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8">
                            ❌ Refuse Load
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Driver acceptance message */}
                  <div className="flex justify-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={load.driver?.avatar || "/professional-driver.png"} alt="Driver" />
                      <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[80%] rounded-lg bg-muted p-3">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <span className="text-xs font-medium">Driver</span>
                        <span className="text-xs text-muted-foreground">2:48 PM</span>
                      </div>
                      <p className="text-sm">✅ Load accepted. I'll be at pickup location on time.</p>
                    </div>
                  </div>

                  {/* Status update with inline keyboard (driver only) */}
                  {user?.role === "driver" && (
                    <div className="flex justify-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={load.driver?.avatar || "/professional-driver.png"} alt="Driver" />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                      <div className="max-w-[80%]">
                        <div className="rounded-lg bg-muted p-3 mb-2">
                          <div className="mb-1 flex items-center justify-between gap-4">
                            <span className="text-xs font-medium">Driver</span>
                            <span className="text-xs text-muted-foreground">8:30 AM</span>
                          </div>
                          <p className="text-sm">📍 I've arrived at the pickup location</p>
                        </div>
                        {/* Status update keyboard */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            🚛 At Pickup
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            📦 Loaded
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            🛣️ En Route
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            🏢 At Delivery
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Driver status update */}
                  <div className="flex justify-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={load.driver?.avatar || "/professional-driver.png"} alt="Driver" />
                      <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[80%] rounded-lg bg-muted p-3">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <span className="text-xs font-medium">Driver</span>
                        <span className="text-xs text-muted-foreground">10:30 AM</span>
                      </div>
                      <p className="text-sm">📦 Loading complete. Departing from pickup now.</p>
                    </div>
                  </div>

                  {/* Dispatcher response */}
                  <div className="flex justify-end gap-3">
                    <div className="max-w-[80%] rounded-lg bg-blue-600 text-white p-3">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <span className="text-xs font-medium">Dispatcher</span>
                        <span className="text-xs opacity-70">10:32 AM</span>
                      </div>
                      <p className="text-sm">Great! Safe travels. Please update when you arrive at delivery.</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/emergency-dispatcher.png" alt="Dispatcher" />
                      <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </ScrollArea>

              {/* Dispatcher preset keyboard options */}
              {user?.role === "dispatcher" && (
                <div className="border-t border-b p-4">
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      📍 Request Location
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      ⏰ Request ETA
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      📋 Status Update
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      🚨 Priority Message
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      📞 Call Request
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      ℹ️ Load Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Message composer */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea placeholder="Type your message..." className="min-h-[60px] pr-12" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8"
                      title="Attach document"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI-Generated Broker Email (Dispatcher only) */}
              {user?.role === "dispatcher" && (
                <div className="border-t bg-muted/30 flex-1 flex flex-col">
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mx-4 dark:border-amber-700 dark:bg-amber-950/30 h-full flex-1 flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        >
                          🤖 Auto-Generated Email
                        </Badge>
                        <span className="text-xs text-muted-foreground">Based on driver updates</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 flex items-center gap-1 text-xs"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span className="hidden sm:inline">Regenerate</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 flex items-center gap-1 text-xs"
                          title="Copy to Clipboard"
                          onClick={() => {
                            const textToCopy = isEditing
                              ? draftContent
                              : `Hello ${load.details?.brokerContact?.split(" ")[0] || "Mike"},

I wanted to update you on load ${load.id}. Our driver ${load.driver?.name || "John Smith"} has successfully completed pickup and is now en route to the delivery destination.

Current Status: En Route
Pickup Completed: ${new Date().toLocaleString()}
Estimated Delivery: ${new Date(load.deliveryDate).toLocaleDateString()} at 09:00
Route: ${load.origin} → ${load.destination}

The load is secure and we're tracking progress in real-time. I'll send another update when the driver arrives at the delivery location.

Best regards,
Your Dispatcher`
                            navigator.clipboard.writeText(textToCopy)
                            alert("Email copied to clipboard!")
                          }}
                        >
                          <Clipboard className="h-3 w-3" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 flex items-center gap-1 text-xs"
                          title={isEditing ? "Save to Broker Updates" : "Edit"}
                          onClick={handleEditSave}
                        >
                          {isEditing ? (
                            <>
                              <Save className="h-3 w-3" />
                              <span className="hidden sm:inline">Save</span>
                            </>
                          ) : (
                            <>
                              <Edit className="h-3 w-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">To:</span>
                        <span>{load.details?.brokerEmail || "broker@acmelogistics.com"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Subject:</span>
                        <span>Load {load.id} - Driver Departed from Pickup</span>
                      </div>

                      <div className="border-t border-amber-200 pt-3 flex-1 overflow-auto h-[250px]">
                        {isEditing ? (
                          <Textarea
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            className="w-full h-full min-h-[250px] max-h-[250px] rounded-md border-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          />
                        ) : (
                          <div className="h-[250px] overflow-y-auto">
                            <p className="text-sm leading-relaxed">
                              Hello {load.details?.brokerContact?.split(" ")[0] || "Mike"},<br />
                              <br />I wanted to update you on load {load.id}. Our driver{" "}
                              {load.driver?.name || "John Smith"} has successfully completed pickup and is now en route
                              to the delivery destination.
                              <br />
                              <br />
                              <strong>Current Status:</strong> En Route
                              <br />
                              <strong>Pickup Completed:</strong> {new Date().toLocaleString()}
                              <br />
                              <strong>Estimated Delivery:</strong> {new Date(load.deliveryDate).toLocaleDateString()} at
                              09:00
                              <br />
                              <strong>Route:</strong> {load.origin} → {load.destination}
                              <br />
                              <br />
                              The load is secure and we're tracking progress in real-time. I'll send another update when
                              the driver arrives at the delivery location.
                              <br />
                              <br />
                              Best regards,
                              <br />
                              Your Dispatcher
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Broker Updates Tab */}
          <TabsContent value="broker" className="p-0 flex-1 flex flex-col h-full">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/broker.png" alt="Broker" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{load.details?.brokerContact || "Broker Contact"}</p>
                    <p className="text-xs text-muted-foreground">{load.details?.brokerEmail || "broker@example.com"}</p>
                  </div>
                </div>
                <Badge variant="outline">Email</Badge>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 py-4 px-4">
                  {/* Email History - Timeline Dropdown */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Email Timeline</h3>
                      <Badge variant="outline" className="text-xs">
                        {brokerEmails.length} emails
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {brokerEmails.map((email) => (
                        <div key={email.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                          <details className="group">
                            <summary className="flex cursor-pointer items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{email.subject}</p>
                                  <p className="text-xs text-muted-foreground">To: {email.recipient}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {email.saved && (
                                  <Badge variant="secondary" className="text-xs">
                                    Saved
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  Delivered
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Sent: {formatTimestamp(email.sentAt)}
                                </span>
                              </div>
                            </summary>
                            <div className="mt-3 border-t pt-3 pl-6 text-sm">
                              <p className="whitespace-pre-line">
                                {email.content || "Hello, this is an update regarding your load..."}
                              </p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI-Generated Smart Draft */}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
