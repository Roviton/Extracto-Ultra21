"use client"

import "@/lib/monaco-environment"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ModalProvider } from "@/components/modal-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
          <ModalProvider />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
