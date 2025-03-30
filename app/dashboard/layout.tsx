import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import DashboardHeader from "@/components/dashboard/header"
import DashboardSidebar from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: 'Tableau de bord - Ensemble',
  description: 'Gérez votre calendrier familial',
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <DashboardHeader />
      <div className="flex-1 flex flex-col md:flex-row">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
