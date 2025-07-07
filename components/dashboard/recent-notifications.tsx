import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

// Sample notification data
const notifications = [
  {
    id: 1,
    title: "Driver John accepted load #12345",
    time: "5 minutes ago",
    type: "success",
  },
  {
    id: 2,
    title: "New load #54321 received",
    time: "20 minutes ago",
    type: "info",
  },
  {
    id: 3,
    title: "Driver Mike refused load #98765",
    time: "1 hour ago",
    type: "warning",
  },
  {
    id: 4,
    title: "Customer Acme Logistics requested delivery update",
    time: "2 hours ago",
    type: "info",
  },
]

export function RecentNotifications() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent Notifications</CardTitle>
          <CardDescription>Latest system notifications</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <Bell className="mr-2 h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
              <Badge
                variant={
                  notification.type === "success"
                    ? "success"
                    : notification.type === "warning"
                      ? "destructive"
                      : "secondary"
                }
              >
                {notification.type === "success" ? "Success" : notification.type === "warning" ? "Warning" : "Info"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
