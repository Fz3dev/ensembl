"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import LoginForm from "@/components/auth/login-form"

// Composant qui utilise useSearchParams
function LoginContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  
  useEffect(() => {
    // Récupérer les paramètres côté client pour éviter l'erreur
    if (searchParams) {
      setMessage(searchParams.get("message"))
    }
  }, [searchParams])
  
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="Ensemble Calendar Logo" className="h-20 w-20 mb-4" />
        <h1 className="text-2xl font-bold text-center">Connexion</h1>
      </div>
      <LoginForm />
      {message && (
        <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md text-center">
          {message}
        </div>
      )}
    </div>
  )
}

// Fallback pendant le chargement
function LoginFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="Ensemble Calendar Logo" className="h-20 w-20 mb-4" />
        <h1 className="text-2xl font-bold text-center">Connexion</h1>
      </div>
      <div className="p-4 text-center">Chargement...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={<LoginFallback />}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
