# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a new, empty project. Update this file as the codebase is built out to document build commands, architecture decisions, and development workflows.

## Langue

Toujours répondre en français.

## Context7

Utilise toujours Context7 lorsque j'ai besoin de générer du code, d'étapes de configuration ou d'installation, ou de documentation de bibliothèque/API. Cela signifie que tu dois automatiquement utiliser les outils MCP Context7 pour résoudre l'identifiant de bibliothèque et obtenir la documentation de bibliothèque sans que j'aie à le demander explicitement.

## Aperçu de l'objectif du projet

Dashboard nutrition & sport connecté : planifier les repas hebdomadaires en fonction de l'activité physique réelle, calculer la collation optimale selon le déficit calorique, et générer la liste de courses consolidée.

## Aperçu de l'architecture globale

- **Stack** : Next.js 16 (App Router + Server Actions) + Supabase (PostgreSQL) + shadcn/ui + Tailwind CSS
- **Commandes** :
  - `npm run dev` — démarrer le serveur de développement (port 3000)
  - `npm run build` — build de production
  - `npx tsc --noEmit` — vérification TypeScript
- **Structure** :
  - `src/app/` — pages Next.js (Server Components)
  - `src/components/` — composants React (Client Components)
  - `src/actions/` — Server Actions Next.js (mutations DB)
  - `src/lib/` — logique métier (physiologie, supabase, validations)
  - `src/types/database.ts` — types Supabase (à régénérer après migration)
  - `supabase/migrations/` — migrations SQL versionnées
- **Pattern clé** : schémas Zod dans `src/lib/validations/` (partagés client/serveur)
- **Sécurité** : SUPABASE_SERVICE_ROLE_KEY uniquement dans les Server Actions
- **V1** : profil unique (id fixe `00000000-0000-0000-0000-000000000001`), pas d'auth

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP

## Contraintes et Politiques

- NE JAMAIS exposer les clés API au client

## Dépendances

- Préférer les composants existants plutôt que d'ajouter de nouvelles bibliothèques UI

## Tests d'interface

À la fin de chaque développement qui implique l'interface graphique :
- Tester avec playwright-skill, l'interface doit être responsive, fonctionnel et répondre au besoin développé

## Documentation

- PRD : [PRD.md](../PRD.md)
- Architecture : [ARCHITECTURE.md](../ARCHITECTURE.md)

## Spécifications

Toutes les spécifications doivent être rédigées en français, y compris les specs OpenSpec (sections Purpose et Scenarios). Seuls les titres de Requirements doivent rester en anglais avec les mots-clés SHALL/MUST pour la validation OpenSpec.
