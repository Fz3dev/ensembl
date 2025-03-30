"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Baby, Plus, Trash2, ArrowRight } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Couleurs prédéfinies pour les enfants
const PRESET_COLORS = [
  "#FF5733", // Rouge-orange
  "#33A8FF", // Bleu clair
  "#33FF57", // Vert clair
  "#FF33A8", // Rose
  "#A833FF", // Violet
  "#FFD433", // Jaune
  "#33FFD4", // Turquoise
  "#FF8333", // Orange
]

interface ChildFormData {
  firstName: string
  color: string
}

export default function AddChildrenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const familyId = searchParams.get("family_id")
  
  const [children, setChildren] = useState<ChildFormData[]>([
    { firstName: "", color: PRESET_COLORS[0] }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier que l'ID de famille est présent
    if (!familyId) {
      router.push("/onboarding/create-family")
    }
  }, [familyId, router])

  const addChild = () => {
    // Ajouter un nouvel enfant avec une couleur prédéfinie différente
    const nextColorIndex = children.length % PRESET_COLORS.length
    setChildren([...children, { firstName: "", color: PRESET_COLORS[nextColorIndex] }])
  }

  const removeChild = (index: number) => {
    if (children.length === 1) {
      // Garder au moins un enfant, juste vider le champ
      setChildren([{ firstName: "", color: children[0].color }])
    } else {
      // Supprimer l'enfant à l'index spécifié
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const updateChildName = (index: number, name: string) => {
    const updatedChildren = [...children]
    updatedChildren[index].firstName = name
    setChildren(updatedChildren)
  }

  const updateChildColor = (index: number, color: string) => {
    const updatedChildren = [...children]
    updatedChildren[index].color = color
    setChildren(updatedChildren)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filtrer les enfants sans nom
    const validChildren = children.filter(child => child.firstName.trim() !== "")
    
    // Si tous les enfants sont vides, on peut quand même continuer
    // car l'ajout d'enfants est optionnel
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (validChildren.length > 0) {
        // Insérer les enfants valides dans la base de données
        const { error: childrenError } = await supabase
          .from("children")
          .insert(
            validChildren.map(child => ({
              family_id: familyId,
              first_name: child.firstName.trim(),
              color: child.color
            }))
          )
        
        if (childrenError) {
          throw new Error(`Erreur lors de l'ajout des enfants: ${childrenError.message}`)
        }
      }
      
      // Rediriger vers l'étape suivante
      router.push(`/onboarding/invite-parent?family_id=${familyId}`)
      
    } catch (err: any) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue lors de l'ajout des enfants")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push(`/onboarding/invite-parent?family_id=${familyId}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <Baby className="h-6 w-6" />
        </div>
        <CardTitle className="text-center">Ajoutez vos enfants</CardTitle>
        <CardDescription className="text-center">
          Vous pourrez toujours en ajouter ou les modifier plus tard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {children.map((child, index) => (
            <div key={index} className="space-y-3 p-3 border rounded-md bg-muted/20">
              <div className="flex items-center gap-3">
                <Label htmlFor={`child-${index}`} className="sr-only">
                  Prénom de l'enfant
                </Label>
                <Input
                  id={`child-${index}`}
                  placeholder="Prénom de l'enfant"
                  value={child.firstName}
                  onChange={(e) => updateChildName(index, e.target.value)}
                  autoComplete="off"
                  autoFocus={index === 0}
                  className="flex-1"
                />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: child.color }}
                    >
                      <span className="sr-only">Choisir une couleur</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <div className="space-y-3">
                      <HexColorPicker 
                        color={child.color} 
                        onChange={(color) => updateChildColor(index, color)} 
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            style={{ backgroundColor: color }}
                            onClick={() => updateChildColor(index, color)}
                            aria-label={`Couleur ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeChild(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChild}
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un enfant
          </Button>
          
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            <>
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
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
