import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding - Ensemble',
  description: 'Configurez votre espace familial Ensemble',
}

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="container max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Ensemble</h1>
        <p className="text-muted-foreground">Organisez votre vie de famille simplement</p>
      </div>
      {children}
    </div>
  )
}
