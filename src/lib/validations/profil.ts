import { z } from 'zod'

// Schéma partagé entre la Server Action et le formulaire client
export const profilSchema = z.object({
  poids: z
    .number({ invalid_type_error: 'Le poids doit être un nombre' })
    .positive('Le poids doit être positif')
    .max(300, 'Valeur invalide'),
  taille: z
    .number({ invalid_type_error: 'La taille doit être un nombre' })
    .int('La taille doit être un entier')
    .min(50, 'Taille minimale : 50 cm')
    .max(250, 'Taille maximale : 250 cm'),
  age: z
    .number({ invalid_type_error: "L'âge doit être un nombre" })
    .int("L'âge doit être un entier")
    .min(10, 'Âge minimal : 10 ans')
    .max(120, 'Âge maximal : 120 ans'),
  sexe: z.enum(['homme', 'femme'] as const, {
    errorMap: () => ({ message: 'Sélectionnez un sexe' }),
  }),
  niveau_activite: z.enum(
    ['sedentaire', 'leger', 'modere', 'tres_actif', 'extreme'] as const,
    { errorMap: () => ({ message: "Sélectionnez un niveau d'activité" }) }
  ),
  objectif: z.enum(['perte_poids', 'maintien', 'prise_muscle'] as const, {
    errorMap: () => ({ message: 'Sélectionnez un objectif' }),
  }),
})

export type ProfilFormData = z.infer<typeof profilSchema>
