"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send } from "lucide-react"
import type { Load } from "../loads/loads-table"

interface NotifyDriverModalProps {
  isOpen: boolean
  onClose: () => void
  load: Load
}

export function NotifyDriverModal({ isOpen, onClose, load }: NotifyDriverModalProps) {
  const [messageTab, setMessageTab] = useState<string>("telegram")
  const [messageText, setMessageText] = useState<string>(
    `Hello, regarding load ${load.id} from ${load.origin} to ${load.destination}. Pickup is scheduled for ${new Date(load.pickupDate).toLocaleDateString()} and delivery for ${new Date(load.deliveryDate).toLocaleDateString()}.`,
  )
  const { toast } = useToast()

  const handleSend = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    // Here you would call your API to send the message
    toast({
      title: "Message sent",
      description: `Message sent to driver via ${messageTab.charAt(0).toUpperCase() + messageTab.slice(1)}`,
    })
    onClose()
  }

  // Get driver messaging preferences (in a real app, this would come from the driver data)
  const driverMessagingPreferences = {
    telegram: "@johnsmith",
    whatsapp: "+15551234567",
    sms: "+15551234567",
    email: "john.smith@example.com",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Notify Driver</DialogTitle>
          <DialogDescription>Send a message to the driver assigned to load {load.id}.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {load.driver ? (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={load.driver.avatar || "/placeholder.svg"} alt={load.driver.name} />
                  <AvatarFallback>
                    {load.driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{load.driver.name}</h3>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
              </div>

              <Tabs defaultValue="telegram" onValueChange={setMessageTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="telegram">Telegram</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="telegram">
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="text-sm">{driverMessagingPreferences.telegram}</span>
                    </div>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message here"
                      className="min-h-[120px]"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="whatsapp">
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="text-sm">{driverMessagingPreferences.whatsapp}</span>
                    </div>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message here"
                      className="min-h-[120px]"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="sms">
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="text-sm">{driverMessagingPreferences.sms}</span>
                    </div>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message here"
                      className="min-h-[120px]"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="email">
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="text-sm">{driverMessagingPreferences.email}</span>
                    </div>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message here"
                      className="min-h-[120px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p>No driver assigned to this load.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
