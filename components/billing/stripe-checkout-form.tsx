"use client"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setMessage("Stripe.js is still loading!")
      return
    }

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        /**
         * Customize the URL from which to redirect customers after they
         * confirm a payment on the payment method’s app or site.
         * The URL should be under your domain.
         */
        return_url: `${window.location.origin}/return`,
      },
    })

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "")
    } else {
      setMessage("An unexpected error occurred.")
    }

    setIsProcessing(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={!stripe || isProcessing} className="mt-4">
        {isProcessing ? "Processing ... " : "Pay now"}
      </Button>
      {/* Show any error or success message */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
