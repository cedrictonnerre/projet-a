## Why

Gérer sa nutrition en fonction de son activité physique réelle est actuellement impossible sans un outil personnalisé : les applications génériques ne permettent pas d'ajuster automatiquement les repas selon une séance de sport, ni de consolider une liste de courses hebdomadaire adaptée. Ce dashboard V1 crée le socle fonctionnel permettant d'automatiser la planification alimentaire d'un athlète solo avec un budget infrastructure nul.

## What Changes

- Mise en place du projet Next.js 15 (App Router) avec TypeScript, Tailwind CSS, shadcn/ui et Biome
- Création du schéma PostgreSQL Supabase avec les 4 tables (`profil`, `recettes`, `planificateur_hebdo`, `suivi_sportif`) et leurs contraintes
- Implémentation du moteur physiologique : formule Mifflin-St Jeor → TDEE → `objectif_kcal`
- Bibliothèque de recettes avec ingrédients en JSONB, filtres par type de repas et temps de préparation
- Planificateur hebdomadaire avec règle de recyclage (repas soir J → midi J+1, quantités ×2)
- Curseur sport (Client Component) → recalcul en temps réel de la collation optimale selon `impact_macro`
- Liste de courses consolidée via agrégation SQL JSONB + bouton "J'ai déjà" (toggle Server Action)
- Seed de recettes initiales pour rendre l'app opérationnelle dès le déploiement

## Capabilities

### New Capabilities

- `profil-physiologique` : Saisie du profil utilisateur (poids, taille, âge, sexe, niveau d'activité, objectif) et calcul automatique de l'`objectif_kcal` via la formule Mifflin-St Jeor
- `bibliotheque-recettes` : Gestion CRUD de la bibliothèque de recettes avec filtres par type de repas (`matin`, `midi`, `soir`, `collation`), temps de préparation et allergènes
- `planificateur-hebdomadaire` : Grille de planification semaine avec affectation repas/sport par jour et règle de recyclage (is_rest = repas soir J-1 au midi J avec quantités ×2)
- `suivi-sportif` : Saisie manuelle des séances sportives (type, durée, kcal brûlées) avec mapping automatique vers `impact_macro` (glucides ou protéines)
- `collation-adaptative` : Curseur calories sport → calcul du déficit calorique résiduel → sélection de la collation optimale dont le `impact_macro` correspond au sport du jour
- `liste-courses-consolidee` : Agrégation SQL des ingrédients JSONB sur la semaine (avec ×2 pour les jours recyclés), groupement par rayon Drive et toggle "J'ai déjà"

### Modified Capabilities

<!-- Aucune — projet greenfield, pas de specs existantes -->

## Impact

- **Nouveau projet** : initialisation complète du dépôt Next.js 15
- **Base de données** : migrations SQL Supabase (`001_init_schema.sql`, `002_seed_recettes.sql`)
- **Dépendances** : Next.js 15, TypeScript 5, Tailwind 3.4, shadcn/ui, Recharts ^2.12, TanStack Table ^8, TanStack Query ^5, React Hook Form ^7, Zod ^3, Zustand ^4, date-fns ^3 (locale `fr`), Biome ^1, `@supabase/supabase-js`
- **Variables d'environnement** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Hébergement** : Vercel Hobby (frontend) + Supabase Free tier (PostgreSQL) → coût $0
