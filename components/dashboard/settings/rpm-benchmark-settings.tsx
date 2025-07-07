"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, DollarSign, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RPMBenchmarkSettings() {
  const [minimumRPM, setMinimumRPM] = useState("2.00")
  const [requireComment, setRequireComment] = useState(true)
  const [showWarning, setShowWarning] = useState(true)
  const [highlightLoads, setHighlightLoads] = useState(true)
  const [notifyManagers, setNotifyManagers] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "RPM benchmark settings have been updated.",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>RPM Benchmark Settings</CardTitle>
          <CardDescription>
            Configure minimum acceptable RPM thresholds and related notification settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="minimum-rpm">Minimum Acceptable RPM</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minimum-rpm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumRPM}
                  onChange={(e) => setMinimumRPM(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Loads with RPM below this threshold will be flagged for review.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Setting this value too high may flag a large number of loads. The current fleet average RPM is $3.18/mi.
              </AlertDescription>
            </Alert>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Settings</h3>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="require-comment" className="flex flex-col space-y-1">
                  <span>Require Manager Comment</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Managers must add a comment when approving loads below the RPM threshold
                  </span>
                </Label>
                <Switch id="require-comment" checked={requireComment} onCheckedChange={setRequireComment} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-warning" className="flex flex-col space-y-1">
                  <span>Show Warning Dialog</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Display a warning when creating loads below the RPM threshold
                  </span>
                </Label>
                <Switch id="show-warning" checked={showWarning} onCheckedChange={setShowWarning} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="highlight-loads" className="flex flex-col space-y-1">
                  <span>Highlight Low RPM Loads</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Visually highlight loads below the RPM threshold in load tables
                  </span>
                </Label>
                <Switch id="highlight-loads" checked={highlightLoads} onCheckedChange={setHighlightLoads} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notify-managers" className="flex flex-col space-y-1">
                  <span>Notify Managers</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Send notifications to managers when loads below the RPM threshold are created
                  </span>
                </Label>
                <Switch id="notify-managers" checked={notifyManagers} onCheckedChange={setNotifyManagers} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            RPM Benchmark Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              The RPM (Revenue Per Mile) benchmark helps ensure fleet profitability by flagging loads that may not meet
              your company's financial goals.
            </p>
            <p className="text-sm">
              <strong>Current fleet statistics:</strong>
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Fleet average RPM: $3.18/mi</li>
              <li>Highest performing driver RPM: $3.50/mi</li>
              <li>Lowest performing driver RPM: $2.80/mi</li>
              <li>Percentage of loads below current threshold: 14.3%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
