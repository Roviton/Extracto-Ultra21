import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

// Sample message data
const messages = [
  {
    id: 1,
    sender: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
    },
    message: "Will be 15 min late to pickup",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    sender: {
      name: "Tom Davis",
      avatar: "/abstract-geometric-TD.png",
    },
    message: "Arrived at delivery location",
    time: "30 minutes ago",
    read: true,
  },
  {
    id: 3,
    sender: {
      name: "Mike Williams",
      avatar: "/intertwined-letters.png",
    },
    message: "Traffic on I-95, ETA delayed by 45 min",
    time: "1 hour ago",
    read: true,
  },
]

export function RecentMessages() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent Messages</CardTitle>
          <CardDescription>Latest messages from drivers</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <MessageSquare className="mr-2 h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                <AvatarFallback>
                  {message.sender.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{message.sender.name}</p>
                  <p className="text-xs text-muted-foreground">{message.time}</p>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
              </div>
              {!message.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
