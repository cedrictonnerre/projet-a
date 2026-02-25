## Why

Le dashboard ne peut calculer aucun objectif calorique sans connaître les données physiologiques de l'utilisateur. La saisie du profil (poids, taille, âge, sexe, niveau d'activité, objectif) est le prérequis absolu du Moteur Physiologique défini dans le PRD : sans ces données, le TMB, le TDEE et l'`objectif_kcal` ne peuvent pas être déterminés, bloquant l'ensemble des fonctionnalités de planification.

## What Changes

- **Nouveau** : Formulaire de saisie du profil utilisateur à `/profil` (Next.js App Router)
- **Nouveau** : Calcul du TMB via la formule Mifflin-St Jeor + TDEE + `objectif_kcal` en Server Action
- **Nouveau** : Persistance du profil dans la table `profil` (Supabase/PostgreSQL)
- **Nouveau** : Affichage récapitulatif des valeurs calculées (TMB, TDEE, objectif_kcal) après soumission
- **Nouveau** : Migration SQL `001_init_schema.sql` pour la table `profil`
- **Non-objectif (V1)** : Pas d'authentification — profil unique, sans multi-utilisateurs
- **Non-objectif (V1)** : Pas de connexion Suunto — le curseur sport est géré dans le planificateur
- **Non-objectif (V2+)** : RLS Supabase, historique des modifications de profil

## Capabilities

### New Capabilities

- `profil-physiologique` : Saisie et persistance des données physiologiques de l'utilisateur (poids, taille, âge, sexe, niveau d'activité, objectif) et calcul automatique de l'objectif calorique journalier (`objectif_kcal`) via TMB/TDEE

### Modified Capabilities

_(aucune — premier développement)_

## Impact

- **Table DB** : `profil` (nouvelle — création via migration SQL)
- **Fichiers** : `src/app/profil/page.tsx`, `src/actions/profil.ts`, `src/lib/physiologie/tmb.ts`
- **Dépendances** : React Hook Form + Zod (validation), shadcn/ui (composants formulaire), Supabase (persistance)
- **V1** : fonctionnalité complète en saisie manuelle, sans authentification
