"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function SubscriptionPlans() {
  const plans = [
    {
      name: "Starter",
      price: 99,
      description: "Perfect for small freight operations",
      features: ["Up to 5 dispatchers", "100 loads per month", "Basic reporting", "Email support"],
      current: false,
    },
    {
      name: "Professional",
      price: 299,
      description: "For growing freight companies",
      features: [
        "Up to 15 dispatchers",
        "Unlimited loads",
        "Advanced analytics",
        "AI-powered features",
        "Priority support",
      ],
      current: true,
    },
    {
      name: "Enterprise",
      price: 599,
      description: "For large freight operations",
      features: [
        "Unlimited dispatchers",
        "Unlimited loads",
        "Custom integrations",
        "Dedicated support",
        "Advanced AI features",
        "Custom reporting",
      ],
      current: false,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              {plan.current && <Badge>Current Plan</Badge>}
            </div>
            <CardDescription>{plan.description}</CardDescription>
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
