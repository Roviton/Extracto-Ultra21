"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Clock, MessageSquare, RefreshCw, Users, Zap } from "lucide-react"

export function UsageMetrics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Usage</CardTitle>
          <CardDescription>Monitor your communication platform usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Period</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">AI Message Credits</span>
                    </div>
                    <span className="text-sm font-medium">432 / 1,000</span>
                  </div>
                  <Progress value={43.2} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Credits reset on June 15, 2024. You're using credits at a normal rate.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">Active Drivers</span>
                    </div>
                    <span className="text-sm font-medium">18 / 25</span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    You're approaching your driver limit. Consider upgrading if you need to add more drivers.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">Broker Email Templates</span>
                    </div>
                    <span className="text-sm font-medium">5 / 10</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    You have 5 more email templates available to create for broker communications.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">API Requests</span>
                    </div>
                    <span className="text-sm font-medium">12,432 / 50,000</span>
                  </div>
                  <Progress value={24.9} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    API usage for Telegram and email integrations is well within limits.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="historical">
              <div className="flex items-center justify-center h-64 border rounded-md">
                <div className="flex flex-col items-center text-center p-4">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Historical Usage Charts</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    View detailed usage trends over time to optimize your communication strategy.
                  </p>
                  <Button variant="outline" className="mt-4">
                    View Detailed Analytics
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Efficiency Metrics</CardTitle>
          <CardDescription>Track how the platform is improving your dispatch operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">Average Response Time</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">-32%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Before platform</span>
                <span className="text-sm font-medium">12.4 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">With platform</span>
                <span className="text-sm font-medium">4.2 min</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">Communication Volume</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">+24%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Before platform</span>
                <span className="text-sm font-medium">2,290</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">With platform</span>
                <span className="text-sm font-medium">2,843</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">Time Saved Monthly</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">42 hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Per dispatcher</span>
                <span className="text-sm font-medium">10.5 hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated value</span>
                <span className="text-sm font-medium">$1,680</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
