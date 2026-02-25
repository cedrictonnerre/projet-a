'use server'

import { createServerClient } from '@/lib/supabase/server'
import { calculerBesoinsCaloriques } from '@/lib/physiologie/tmb'
import { profilSchema, type ProfilFormData } from '@/lib/validations/profil'
import type { Profil } from '@/types/database'

// ID fixe pour le profil unique V1
const PROFIL_ID = '00000000-0000-0000-0000-000000000001'

export type SauvegarderProfilResult =
  | {
      success: true
      data: {
        tmb: number
        tdee: number
        objectifKcal: number
      }
    }
  | {
      success: false
      error: string
      fieldErrors?: Partial<Record<keyof ProfilFormData, string[]>>
    }

// --- Tâche 3.3 : Server Action sauvegarderProfil ---
export async function sauvegarderProfil(
  formData: ProfilFormData
): Promise<SauvegarderProfilResult> {
  // Revalidation côté serveur (même schéma que le client)
  const parsed = profilSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<keyof ProfilFormData, string[]>
      >,
    }
  }

  const { poids, taille, age, sexe, niveau_activite, objectif } = parsed.data

  // Calcul des besoins caloriques côté serveur
  const { tmb, tdee, objectifKcal } = calculerBesoinsCaloriques({
    poids,
    taille,
    age,
    sexe,
    niveauActivite: niveau_activite,
    objectif,
  })

  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from('profil')
      .upsert(
        {
          id: PROFIL_ID,
          poids,
          taille,
          age,
          sexe,
          niveau_activite,
          objectif,
          objectif_kcal: objectifKcal,
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error('Erreur Supabase upsert profil:', error)
      return { success: false, error: 'Erreur lors de la sauvegarde du profil.' }
    }

    return { success: true, data: { tmb, tdee, objectifKcal } }
  } catch (err) {
    console.error('Erreur serveur sauvegarderProfil:', err)
    return { success: false, error: 'Erreur serveur inattendue.' }
  }
}

// --- Tâche 3.4 : Server Action lireProfil ---
export async function lireProfil(): Promise<Profil | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('profil')
      .select('*')
      .eq('id', PROFIL_ID)
      .single()

    if (error) {
      // PGRST116 = aucune ligne trouvée (profil non encore créé)
      if (error.code === 'PGRST116') return null
      console.error('Erreur Supabase lireProfil:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Erreur serveur lireProfil:', err)
    return null
  }
}
