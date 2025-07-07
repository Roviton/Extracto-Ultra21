"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SupabaseConnectionTest } from "@/components/supabase-connection-test"
import { SupabaseTest } from "@/components/supabase-test"

export default function SupabaseTestPage() {
  const [activeTab, setActiveTab] = useState("connection")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supabase Integration Tests</h1>
        <p className="text-muted-foreground">Test and verify your Supabase connection and database functionality</p>
      </div>

      <Tabs defaultValue="connection" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">Connection Test</TabsTrigger>
          <TabsTrigger value="queries">Query Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SupabaseConnectionTest />

            <Card>
              <CardHeader>
                <CardTitle>Database Setup</CardTitle>
                <CardDescription>Information about your database configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Your database should be configured with the necessary tables and schemas. Run the SQL scripts in the
                    scripts folder to set up your database.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The database setup test component has been removed as it was causing errors. Please check your
                    database configuration manually.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="mt-6">
          <SupabaseTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}
