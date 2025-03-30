"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HexColorPicker } from "react-colorful"
import { Baby, Plus, Trash2 } from "lucide-react"

// Couleurs prédéfinies pour les enfants
export const PRESET_COLORS = [
  "#FF5733", // Rouge-orange
  "#33A8FF", // Bleu clair
  "#33FF57", // Vert clair
  "#FF33A8", // Rose
  "#A833FF", // Violet
  "#FFD433", // Jaune
  "#33FFD4", // Turquoise
  "#FF8333", // Orange
]

export interface ChildFormData {
  firstName: string
  color: string
}

interface ChildFormProps {
  children: ChildFormData[]
  onChange: (children: ChildFormData[]) => void
}

export default function ChildForm({ children, onChange }: ChildFormProps) {
  const addChild = () => {
    // Ajouter un nouvel enfant avec une couleur prédéfinie différente
    const nextColorIndex = children.length % PRESET_COLORS.length
    onChange([...children, { firstName: "", color: PRESET_COLORS[nextColorIndex] }])
  }

  const removeChild = (index: number) => {
    if (children.length === 1) {
      // Garder au moins un enfant, juste vider le champ
      const updatedChildren = [...children]
      updatedChildren[0] = { firstName: "", color: children[0].color }
      onChange(updatedChildren)
    } else {
      // Supprimer l'enfant à l'index spécifié
      onChange(children.filter((_, i) => i !== index))
    }
  }

  const updateChildName = (index: number, name: string) => {
    const updatedChildren = [...children]
    updatedChildren[index].firstName = name
    onChange(updatedChildren)
  }

  const updateChildColor = (index: number, color: string) => {
    const updatedChildren = [...children]
    updatedChildren[index].color = color
    onChange(updatedChildren)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
        <Baby className="h-6 w-6" />
      </div>
      <p className="text-center text-muted-foreground mb-4">
        Ajoutez vos enfants pour les inclure dans le calendrier familial
      </p>
      
      <div className="space-y-4">
        {children.map((child, index) => (
          <div key={index} className="space-y-3 p-3 border rounded-md bg-muted/20">
            <div className="flex items-center gap-3">
              <Input
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
      </div>
    </div>
  )
}
