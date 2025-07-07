"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample payment methods
const paymentMethods = [
  {
    id: "pm_1",
    type: "card",
    brand: "visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "card",
    brand: "mastercard",
    last4: "5555",
    expMonth: 8,
    expYear: 2026,
    isDefault: false,
  },
]

export function PaymentMethods() {
  const [methods, setMethods] = useState(paymentMethods)
  const [isAddingCard, setIsAddingCard] = useState(false)

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const handleRemove = (id: string) => {
    setMethods(methods.filter((method) => method.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your payment methods for your communication platform subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              method.isDefault ? "border-primary bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {method.expMonth}/{method.expYear}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {method.isDefault ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Default
                </Badge>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(method.id)}>
                  Set as default
                </Button>
              )}
              {!method.isDefault && (
                <Button variant="ghost" size="sm" onClick={() => handleRemove(method.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-dashed p-4">
          <div className="flex flex-col items-center justify-center text-center py-4">
            <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Add a new payment method</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
              Add a credit card to ensure uninterrupted service for your dispatch communications.
            </p>
            <Button variant="outline" onClick={() => setIsAddingCard(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="space-y-2 w-full">
          <h3 className="font-medium">Billing Address</h3>
          <p className="text-sm text-muted-foreground">
            ABC Freight Dispatch Services
            <br />
            123 Logistics Way
            <br />
            Suite 456
            <br />
            Chicago, IL 60007
          </p>
          <Button variant="link" className="h-auto p-0 text-primary">
            Update Billing Address
          </Button>
        </div>
      </CardFooter>

      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new credit or debit card to your account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">Card Number</Label>
              <Input id="number" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Select>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCard(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddingCard(false)}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
