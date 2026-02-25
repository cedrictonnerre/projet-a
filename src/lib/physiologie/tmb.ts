// Formule Mifflin-St Jeor + TDEE + calcul objectif_kcal
// Référence : ARCHITECTURE.md §5.1

// --- Tâche 2.2 : Facteurs d'activité PAL ---
export const PAL = {
  sedentaire: 1.2,    // Peu ou pas d'exercice
  leger: 1.375,       // 1–3 séances/semaine
  modere: 1.55,       // 3–5 séances/semaine
  tres_actif: 1.725,  // 6–7 séances/semaine
  extreme: 1.9,       // 2× par jour
} as const

export type NiveauActivite = keyof typeof PAL

// --- Tâche 2.3 : Ajustements selon l'objectif ---
export const SURPLUS_OBJECTIF = {
  perte_poids: -500,  // déficit kcal/j
  maintien: 0,
  prise_muscle: +250, // surplus kcal/j
} as const

export type Objectif = keyof typeof SURPLUS_OBJECTIF

// --- Tâche 2.1 : TMB Mifflin-St Jeor ---
// Homme : TMB = (10 × poids) + (6.25 × taille) − (5 × âge) + 5
// Femme : TMB = (10 × poids) + (6.25 × taille) − (5 × âge) − 161
export function calculerTMB(
  poids: number,  // kg
  taille: number, // cm
  age: number,
  sexe: 'homme' | 'femme'
): number {
  const base = 10 * poids + 6.25 * taille - 5 * age
  return sexe === 'homme' ? base + 5 : base - 161
}

// --- Tâche 2.2 : TDEE = TMB × PAL ---
export function calculerTDEE(tmb: number, niveauActivite: NiveauActivite): number {
  return Math.round(tmb * PAL[niveauActivite])
}

// --- Tâche 2.3 : objectif_kcal = TDEE ± surplus ---
export function calculerObjectifKcal(
  tdee: number,
  objectif: Objectif
): number {
  return tdee + SURPLUS_OBJECTIF[objectif]
}

// Calcul complet : données profil → TMB + TDEE + objectif_kcal
export function calculerBesoinsCaloriques(params: {
  poids: number
  taille: number
  age: number
  sexe: 'homme' | 'femme'
  niveauActivite: NiveauActivite
  objectif: Objectif
}): { tmb: number; tdee: number; objectifKcal: number } {
  const tmb = calculerTMB(params.poids, params.taille, params.age, params.sexe)
  const tdee = calculerTDEE(tmb, params.niveauActivite)
  const objectifKcal = calculerObjectifKcal(tdee, params.objectif)
  return { tmb: Math.round(tmb), tdee, objectifKcal }
}
