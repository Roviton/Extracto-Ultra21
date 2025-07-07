import type React from "react"
import Providers from "./providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: "Freight Dispatcher Dashboard",
  description: "Manage your freight dispatching operations efficiently.",
  generator: "v0.dev",
}


import './globals.css'