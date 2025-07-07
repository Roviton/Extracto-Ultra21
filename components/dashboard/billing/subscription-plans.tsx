"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, HelpCircle, Info } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [currentPlan, setCurrentPlan] = useState("dispatch-pro")
  const [isConfirmingChange, setIsConfirmingChange] = useState(false)
  const [planToChange, setPlanToChange] = useState("")

  const handlePlanChange = (plan: string) => {
    setPlanToChange(plan)
    setIsConfirmingChange(true)
  }

  const confirmPlanChange = () => {
    setCurrentPlan(planToChange)
    setIsConfirmingChange(false)
  }

  const plans = [
    {
      id: "dispatch-basic",
      name: "Dispatch Basic",
      description: "For small dispatch operations",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        "Up to 5 drivers",
        "Basic AI message drafting",
        "Telegram driver integration",
        "Standard email templates",
        "8-hour support (business hours)",
        "500 AI message credits/month",
      ],
    },
    {
      id: "dispatch-pro",
      name: "Dispatch Pro",
      description: "For growing dispatch businesses",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        "Up to 25 drivers",
        "Advanced AI message drafting",
        "Telegram & SMS driver integration",
        "Custom email templates",
        "12-hour support",
        "1,000 AI message credits/month",
        "Broker communication analytics",
        "Custom branding on communications",
      ],
    },
    {
      id: "dispatch-enterprise",
      name: "Dispatch Enterprise",
      description: "For larger dispatch operations",
      monthlyPrice: 249,
      yearlyPrice: 2490,
      features: [
        "Unlimited drivers",
        "Premium AI message drafting",
        "All communication channels",
        "Advanced email & message templates",
        "24/7 priority support",
        "Unlimited AI message credits",
        "Advanced analytics & reporting",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Choose the plan that best fits your dispatch communication needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue={billingCycle} onValueChange={setBillingCycle} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Save 17%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan
              const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

              return (
                <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? "border-primary" : ""}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{plan.name}</CardTitle>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => handlePlanChange(plan.id)}>
                        {currentPlan === "dispatch-enterprise" && plan.id !== "dispatch-enterprise"
                          ? "Downgrade"
                          : "Upgrade"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <Info className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Need a custom communication solution?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our team for a tailored plan that fits your specific dispatch communication needs.
                </p>
                <Button variant="link" className="h-auto p-0 text-primary">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communication Features</CardTitle>
              <CardDescription>Detailed comparison of communication features across plans</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This table shows a detailed comparison of communication features available in each subscription
                    plan.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-center p-3">Dispatch Basic</th>
                  <th className="text-center p-3">Dispatch Pro</th>
                  <th className="text-center p-3">Dispatch Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Driver Connections</td>
                  <td className="text-center p-3">Up to 5</td>
                  <td className="text-center p-3">Up to 25</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">AI Message Credits</td>
                  <td className="text-center p-3">500/month</td>
                  <td className="text-center p-3">1,000/month</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Driver Communication Channels</td>
                  <td className="text-center p-3">Telegram</td>
                  <td className="text-center p-3">Telegram, SMS</td>
                  <td className="text-center p-3">All Channels</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">AI Message Quality</td>
                  <td className="text-center p-3">Basic</td>
                  <td className="text-center p-3">Advanced</td>
                  <td className="text-center p-3">Premium</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Broker Email Templates</td>
                  <td className="text-center p-3">5</td>
                  <td className="text-center p-3">10</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Communication Analytics</td>
                  <td className="text-center p-3">Basic</td>
                  <td className="text-center p-3">Advanced</td>
                  <td className="text-center p-3">Premium</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Custom Branding</td>
                  <td className="text-center p-3">—</td>
                  <td className="text-center p-3">
                    <Check className="mx-auto h-4 w-4 text-primary" />
                  </td>
                  <td className="text-center p-3">
                    <Check className="mx-auto h-4 w-4 text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Custom Integrations</td>
                  <td className="text-center p-3">—</td>
                  <td className="text-center p-3">—</td>
                  <td className="text-center p-3">
                    <Check className="mx-auto h-4 w-4 text-primary" />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Support Hours</td>
                  <td className="text-center p-3">8 hours</td>
                  <td className="text-center p-3">12 hours</td>
                  <td className="text-center p-3">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmingChange} onOpenChange={setIsConfirmingChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              {planToChange === "dispatch-enterprise" && currentPlan !== "dispatch-enterprise"
                ? "You're about to upgrade to the Dispatch Enterprise plan."
                : planToChange !== "dispatch-enterprise" && currentPlan === "dispatch-enterprise"
                  ? "You're about to downgrade from the Dispatch Enterprise plan."
                  : planToChange === "dispatch-pro" && currentPlan === "dispatch-basic"
                    ? "You're about to upgrade to the Dispatch Pro plan."
                    : "You're about to change your subscription plan."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {planToChange === "dispatch-enterprise" && currentPlan !== "dispatch-enterprise"
                ? "Your billing will be adjusted immediately to reflect the new plan. You'll have access to all Enterprise communication features right away."
                : planToChange !== "dispatch-enterprise" && currentPlan === "dispatch-enterprise"
                  ? "Your access to Enterprise features will continue until the end of your current billing cycle. After that, your plan will change and your billing will be adjusted accordingly."
                  : "Your billing will be adjusted immediately to reflect the new plan. The changes will take effect right away."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingChange(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPlanChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
