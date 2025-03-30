"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import confetti from 'canvas-confetti'

// Composant qui utilise useSearchParams
function CompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const familyId = searchParams.get("family_id")
  
  useEffect(() => {
    // Vérifier que l'ID de famille est présent
    if (!familyId) {
      router.push("/onboarding/create-family")
      return
    }
    
    // Lancer des confettis pour célébrer la fin de l'onboarding
    const duration = 3 * 1000
    const end = Date.now() + duration
    
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      })
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      })
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [familyId, router])
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <CardTitle className="text-center text-2xl">Félicitations !</CardTitle>
        <CardDescription className="text-center text-base">
          Votre espace familial est prêt à être utilisé
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p>
          Vous pouvez maintenant commencer à organiser votre vie de famille en ajoutant des événements à votre calendrier partagé.
        </p>
        <p className="text-sm text-muted-foreground">
          Tous les membres de votre famille pourront voir et modifier ces événements.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => router.push("/dashboard")}
        >
          Accéder à mon calendrier
        </Button>
      </CardFooter>
    </Card>
  )
}

// Fallback pendant le chargement
function CompleteFallback() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Chargement...</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p>Préparation de votre calendrier familial</p>
      </CardContent>
    </Card>
  )
}

export default function OnboardingCompletePage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <Suspense fallback={<CompleteFallback />}>
        <CompleteContent />
      </Suspense>
    </div>
  )
}
