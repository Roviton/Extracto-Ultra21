"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessagingIntegrationSettings } from "@/components/dashboard/settings/messaging-integration-settings"
import { RPMBenchmarkSettings } from "@/components/dashboard/settings/rpm-benchmark-settings"
import { ColumnCustomizationSettings } from "@/components/dashboard/settings/column-customization-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("messaging")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your freight dispatch system preferences and integrations.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messaging">Messaging Integration</TabsTrigger>
          <TabsTrigger value="rpm">RPM Benchmark</TabsTrigger>
          <TabsTrigger value="columns">Column Customization</TabsTrigger>
        </TabsList>
        <TabsContent value="messaging" className="space-y-4 py-4">
          <MessagingIntegrationSettings />
        </TabsContent>
        <TabsContent value="rpm" className="space-y-4 py-4">
          <RPMBenchmarkSettings />
        </TabsContent>
        <TabsContent value="columns" className="space-y-4 py-4">
          <ColumnCustomizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
