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
    console.log("Tentative d'inscription avec:", email)
    
    // Inscription avec Supabase
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
      console.error("Erreur lors de l'inscription:", error.message)
      
      // Traduction des messages d'erreur courants de Supabase
      if (error.message && error.message.includes("User already registered")) {
        return { data: null, error: { message: "Cet email est déjà utilisé" } }
      }
      
      return { data: null, error }
    }

    // Créer manuellement un profil utilisateur si l'inscription a réussi
    if (data?.user) {
      try {
        console.log("Création manuelle du profil utilisateur pour:", data.user.id)
        
        // Vérifier si un profil existe déjà
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()
        
        if (profileCheckError) {
          console.error("Erreur lors de la vérification du profil:", profileCheckError)
        }
        
        // Si le profil n'existe pas, le créer
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (insertError) {
            console.error("Erreur lors de la création manuelle du profil:", insertError)
          } else {
            console.log("Profil utilisateur créé avec succès")
          }
        } else {
          console.log("Un profil existe déjà pour cet utilisateur")
        }
      } catch (profileError) {
        console.error("Exception lors de la création du profil:", profileError)
      }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Exception non gérée lors de l'inscription:", err)
    return { data: null, error: { message: "Une erreur s'est produite lors de l'inscription." } }
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
  if (password.length < 8) {
    return {
      data: null,
      error: { message: "Le mot de passe doit contenir au moins 8 caractères" },
    }
  }

  try {
    // Vérifier si nous sommes dans un contexte de réinitialisation de mot de passe
    // Le hash contient généralement #access_token=xxx&refresh_token=yyy&type=recovery
    const hash = window.location.hash;
    
    if (hash && hash.includes('type=recovery')) {
      // Nous sommes dans un contexte de réinitialisation de mot de passe
      // Nous devons d'abord échanger le hash contre une session
      
      try {
        // Cette étape est cruciale - elle établit une session à partir du hash
        await supabase.auth.getSession();
        
        // Maintenant que nous avons une session, nous pouvons mettre à jour le mot de passe
        const { data, error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) throw error;
        
        return { data, error: null };
      } catch (error: any) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return { 
          data: null, 
          error: { 
            message: error.message || "Erreur lors de la réinitialisation du mot de passe" 
          } 
        };
      }
    } else {
      // Mise à jour normale du mot de passe (utilisateur déjà connecté)
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Erreur de mise à jour du mot de passe:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    }
  } catch (e) {
    console.error("Exception lors de la mise à jour du mot de passe:", e);
    return {
      data: null,
      error: { message: "Une erreur inattendue s'est produite" },
    };
  }
}
