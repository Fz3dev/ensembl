"use client"

import { supabase } from "./client"

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  // Validation des données
  if (!email || !password || !firstName || !lastName) {
    return {
      data: null,
      error: { message: "Tous les champs sont obligatoires" },
    }
  }

  // Validation de l'email avec une regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      data: null,
      error: { message: "Format d'email invalide" },
    }
  }

  // Validation du mot de passe (minimum 8 caractères)
  if (password.length < 8) {
    return {
      data: null,
      error: { message: "Le mot de passe doit contenir au moins 8 caractères" },
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    })

    if (error) {
      console.error("Erreur d'inscription:", error)

      // Traduction des messages d'erreur courants de Supabase
      if (error.message && error.message.includes("User already registered")) {
        return { data: null, error: { message: "Cet email est déjà utilisé" } }
      }

      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Exception lors de l'inscription:", e)
    return {
      data: null,
      error: { message: "Une erreur inattendue s'est produite" },
    }
  }
}

export async function signIn(email: string, password: string) {
  // Validation des données
  if (!email || !password) {
    return {
      data: null,
      error: { message: "Email et mot de passe requis" },
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Erreur de connexion:", error)

      // Traduction des messages d'erreur courants
      if (error.message && error.message.includes("Invalid login credentials")) {
        return { data: null, error: { message: "Email ou mot de passe incorrect" } }
      }

      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Exception lors de la connexion:", e)
    return {
      data: null,
      error: { message: "Une erreur inattendue s'est produite" },
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Erreur de déconnexion:", error)
      return { error }
    }

    return { error: null }
  } catch (e) {
    console.error("Exception lors de la déconnexion:", e)
    return { error: { message: "Une erreur inattendue s'est produite" } }
  }
}

export async function resetPassword(email: string) {
  // Validation de l'email
  if (!email) {
    return {
      data: null,
      error: { message: "Email requis" },
    }
  }

  try {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Exception lors de la réinitialisation du mot de passe:", e)
    return {
      data: null,
      error: { message: "Une erreur inattendue s'est produite" },
    }
  }
}

export async function updatePassword(password: string) {
  // Validation du mot de passe
  if (!password || password.length < 8) {
    return {
      data: null,
      error: { message: "Le mot de passe doit contenir au moins 8 caractères" },
    }
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Erreur de mise à jour du mot de passe:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (e) {
    console.error("Exception lors de la mise à jour du mot de passe:", e)
    return {
      data: null,
      error: { message: "Une erreur inattendue s'est produite" },
    }
  }
}

