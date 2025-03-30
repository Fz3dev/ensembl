"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, Copy, Check, Share2 } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { getCurrentUser } from "@/utils/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Composant qui utilise useSearchParams
function InviteParentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const familyId = searchParams.get("family_id")
  
  const [inviteCode, setInviteCode] = useState<string>("")
  const [inviteUrl, setInviteUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Vérifier que l'ID de famille est présent
    if (!familyId) {
      router.push("/onboarding/create-family")
      return
    }
    
    // Générer un code d'invitation
    generateInviteCode()
  }, [familyId, router])

  const generateInviteCode = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Récupérer l'utilisateur actuel
      const user = await getCurrentUser()
      
      if (!user) {
        setError("Vous devez être connecté pour inviter un parent")
        router.push("/auth/login")
        return
      }
      
      // 2. Générer un code d'invitation unique
      const code = generateRandomCode(8)
      
      // 3. Calculer la date d'expiration (30 jours)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      
      // 4. Enregistrer le code d'invitation dans la base de données
      const { error: inviteError } = await supabase
        .from("invitation_codes")
        .insert([{
          code,
          family_id: familyId,
          created_by: user.id,
          expires_at: expiresAt.toISOString()
        }])
      
      if (inviteError) {
        throw new Error(`Erreur lors de la création du code d'invitation: ${inviteError.message}`)
      }
      
      // 5. Définir le code et l'URL d'invitation
      setInviteCode(code)
      
      // Construire l'URL d'invitation (en utilisant l'URL actuelle comme base)
      const baseUrl = window.location.origin
      const inviteLink = `${baseUrl}/join?code=${code}`
      setInviteUrl(inviteLink)
      
    } catch (err: any) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue lors de la génération du code d'invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomCode = (length: number) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erreur lors de la copie dans le presse-papiers:", err)
      setError("Impossible de copier dans le presse-papiers")
    }
  }

  const shareViaWhatsApp = () => {
    const message = `Rejoins ma famille sur Ensemble ! Utilise ce lien pour t'inscrire : ${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareViaSMS = () => {
    const message = `Rejoins ma famille sur Ensemble ! Utilise ce lien pour t'inscrire : ${inviteUrl}`
    window.open(`sms:?&body=${encodeURIComponent(message)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = "Invitation à rejoindre ma famille sur Ensemble"
    const body = `Bonjour,\n\nJe t'invite à rejoindre ma famille sur l'application Ensemble.\n\nClique sur ce lien pour t'inscrire : ${inviteUrl}\n\nÀ bientôt !`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const handleFinish = () => {
    router.push(`/onboarding/complete?family_id=${familyId}`)
  }

  const handleSkip = () => {
    router.push(`/onboarding/complete?family_id=${familyId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <Users className="h-6 w-6" />
        </div>
        <CardTitle className="text-center">Invitez un autre parent</CardTitle>
        <CardDescription className="text-center">
          Partagez ce lien avec l'autre parent pour qu'il rejoigne votre famille
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invite-link">Lien d'invitation</Label>
            <div className="flex">
              <Input
                id="invite-link"
                value={inviteUrl}
                readOnly
                className="flex-1 rounded-r-none"
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-l-none"
                onClick={() => copyToClipboard(inviteUrl)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ce lien expire dans 30 jours
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Partager via</Label>
            <Tabs defaultValue="whatsapp" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
              <TabsContent value="whatsapp" className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={shareViaWhatsApp}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager via WhatsApp
                </Button>
              </TabsContent>
              <TabsContent value="sms" className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={shareViaSMS}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager par SMS
                </Button>
              </TabsContent>
              <TabsContent value="email" className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={shareViaEmail}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager par Email
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={handleFinish}
          disabled={isLoading}
        >
          Terminer
        </Button>
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground" 
          onClick={handleSkip}
          disabled={isLoading}
        >
          Passer cette étape
        </Button>
      </CardFooter>
    </Card>
  )
}

// Fallback pendant le chargement
function InviteParentFallback() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Chargement...</CardTitle>
        <CardDescription className="text-center">
          Préparation de l'invitation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function InviteParentPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={<InviteParentFallback />}>
        <InviteParentContent />
      </Suspense>
    </div>
  )
}
