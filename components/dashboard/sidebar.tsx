"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Settings,
  Truck,
  Shield,
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Bot,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"

export function Sidebar({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "admin"

  const dispatcherRoutes = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      href: "/dashboard",
      variant: "default",
    },
    {
      title: "Loads",
      icon: <Truck className="mr-2 h-4 w-4" />,
      href: "/dashboard/loads",
      variant: "ghost",
    },
    {
      title: "Drivers",
      icon: <Users className="mr-2 h-4 w-4" />,
      href: "/dashboard/drivers",
      variant: "ghost",
    },
    {
      title: "Customers",
      icon: <Building2 className="mr-2 h-4 w-4" />,
      href: "/dashboard/customers",
      variant: "ghost",
    },
    {
      title: "Reports",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      href: "/dashboard/reports-analytics",
      variant: "ghost",
    },
    {
      title: "AI Test",
      icon: <Bot className="mr-2 h-4 w-4" />,
      href: "/dashboard/ai-test",
      variant: "ghost",
    },
    {
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: "/dashboard/settings",
      variant: "ghost",
    },
  ]

  const adminRoutes = [
    {
      title: "Admin Dashboard",
      icon: <Shield className="mr-2 h-4 w-4" />,
      href: "/dashboard/admin",
      variant: "default",
    },
    {
      title: "All Loads",
      icon: <Truck className="mr-2 h-4 w-4" />,
      href: "/dashboard/all-loads",
      variant: "ghost",
    },
    {
      title: "Dispatcher Monitoring",
      icon: <Activity className="mr-2 h-4 w-4" />,
      href: "/dashboard/admin/monitoring",
      variant: "ghost",
    },
    {
      title: "AI Test",
      icon: <Bot className="mr-2 h-4 w-4" />,
      href: "/dashboard/ai-test",
      variant: "ghost",
    },
    {
      title: "Billing",
      icon: <FileText className="mr-2 h-4 w-4" />,
      href: "/dashboard/admin/billing",
      variant: "ghost",
    },
    {
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: "/dashboard/settings",
      variant: "ghost",
    },
  ]

  const routes = isAdmin ? adminRoutes : dispatcherRoutes

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background flex-shrink-0">
      <div className="flex h-14 items-center border-b px-4">
        <Link href={isAdmin ? "/dashboard/admin" : "/dashboard"} className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6" />
          <span>Freight Dispatch</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4" key="sidebar-scroll">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === route.href ||
                  (pathname.startsWith(`${route.href}/`) &&
                    route.href !== "/dashboard" &&
                    !(
                      route.href === "/dashboard/admin" &&
                      pathname.startsWith("/dashboard/admin/") &&
                      pathname !== "/dashboard/admin"
                    )) ||
                  (route.href === "/dashboard" && pathname === "/dashboard")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted",
              )}
            >
              {route.icon}
              {route.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}
