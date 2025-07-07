"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AICommunicationPanel } from "@/components/dashboard/modals/ai-communication-panel"

interface LoadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  load: any
}

export function LoadDetailsModal({ isOpen, onClose, load }: LoadDetailsModalProps) {
  if (!load) {
    return null // Or a loading state
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Load Details</DialogTitle>
          <DialogDescription>View and manage details for load ID: {load._id}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Load Information</CardTitle>
                <CardDescription>Details about the load.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Load ID</Label>
                    <Input id="name" value={load._id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={load.description || "No description"} disabled />
                  </div>
                  {/* Add more load details here */}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => onClose()}>
                  Close
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="ai-tools" className="space-y-4">
            <AICommunicationPanel load={load} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
