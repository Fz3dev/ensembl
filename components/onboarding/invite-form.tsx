"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, Copy, Check, Share2 } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { getCurrentUser } from "@/utils/supabase/client"

interface InviteFormProps {
  familyId: string | null
  onError: (message: string) => void
}

export default function InviteForm({ familyId, onError }: InviteFormProps) {
  const [inviteCode, setInviteCode] = useState<string>("")
  const [inviteUrl, setInviteUrl] = useState<string>("")
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateInviteCode = async () => {
    setIsGeneratingCode(true)
    
    try {
      // 1. Récupérer l'utilisateur actuel
      const user = await getCurrentUser()
      
      if (!user) {
        onError("Vous devez être connecté pour inviter un parent")
        return
      }
      
      if (!familyId) {
        onError("Aucune famille sélectionnée")
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
      onError(err.message || "Une erreur est survenue lors de la génération du code d'invitation")
    } finally {
      setIsGeneratingCode(false)
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
      onError("Impossible de copier dans le presse-papiers")
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
        <Users className="h-6 w-6" />
      </div>
      <p className="text-center text-muted-foreground mb-4">
        Invitez l'autre parent à rejoindre votre famille
      </p>
      
      {!inviteCode ? (
        <div className="text-center">
          <Button 
            onClick={generateInviteCode} 
            disabled={isGeneratingCode}
            className="mx-auto"
          >
            {isGeneratingCode ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                Générer un lien d'invitation
              </>
            )}
          </Button>
        </div>
      ) : (
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
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={shareViaWhatsApp}
              >
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={shareViaSMS}
              >
                <Share2 className="mr-2 h-4 w-4" />
                SMS
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={shareViaEmail}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
