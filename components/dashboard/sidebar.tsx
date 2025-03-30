"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Settings, Home } from "lucide-react"

const sidebarItems = [
  {
    title: "Accueil",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendrier",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Famille",
    href: "/dashboard/family",
    icon: Users,
  },
  {
    title: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="md:w-[240px] flex-shrink-0 border-r md:h-[calc(100vh-3.5rem)] hidden md:block p-4">
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-muted font-medium" : "font-normal"
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </aside>
  )
}
