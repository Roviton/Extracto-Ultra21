import { AITestPanel } from "@/components/dashboard/ai-test-panel"

export default function AITestPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Feature Testing</h1>
        <p className="text-muted-foreground">Test AI-powered features for your freight dispatch system</p>
      </div>
      <AITestPanel />
    </div>
  )
}
