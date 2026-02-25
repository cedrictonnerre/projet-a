## Context

Projet greenfield : aucun code existant. L'objectif est de créer un dashboard personnel de nutrition sportive utilisable en V1 sans authentification (usage solo) et évolutif vers une intégration Suunto (V2) et Intermarché Drive (V3). L'architecture doit respecter trois contraintes fortes : coût $0, stack React typée pour la maintenabilité long terme, et PostgreSQL pour les requêtes JSONB sur les ingrédients.

Stack retenue (issue du rapport `TECH_STACK_REPORT.md`) : **Next.js 15 App Router + TypeScript 5 + Supabase (PostgreSQL) + shadcn/ui + Tailwind 3.4**.

## Goals / Non-Goals

**Goals:**
- Initialiser le projet Next.js 15 avec App Router, TypeScript strict, Biome et shadcn/ui
- Créer le schéma SQL des 4 tables avec FK, contraintes CHECK et index
- Implémenter les 6 fonctionnalités métier décrites dans la proposal
- Assurer un rendu hybride correct (RSC pour le fetch initial, Client Components pour l'interactivité)
- Atteindre $0/mois d'infrastructure en V1

**Non-Goals:**
- Authentification (prévue en V2 avec Supabase Auth + RLS)
- Intégration API Suunto ou Intermarché Drive (V2/V3)
- Application mobile native (web-first, responsive)
- Support multi-utilisateurs (V2)
- Tests automatisés (hors scope V1 — ajoutés en V2)

## Decisions

### D1 — Next.js 15 App Router avec Server Actions (pas d'API Routes en V1)

**Décision** : Toutes les mutations utilisent des Server Actions Next.js. Aucune API Route REST n'est créée en V1.

**Pourquoi** : Les Server Actions simplifient l'architecture en éliminant la couche API intermédiaire. Elles s'exécutent côté serveur (accès sécurisé à `SUPABASE_SERVICE_ROLE_KEY`) et sont directement appelables depuis les composants React. La migration vers des API Routes explicites en V2 est triviale si nécessaire pour les webhooks Suunto.

**Alternatives considérées** :
- API Routes (`/app/api/`) : plus verbeux, nécessite fetch côté client, pas de gain en V1
- tRPC : overhead de configuration non justifié pour un projet solo

### D2 — Supabase (PostgreSQL managé) plutôt que SQLite/Prisma

**Décision** : PostgreSQL via Supabase Free tier pour la base de données.

**Pourquoi** : La table `recettes` stocke `ingredients` en JSONB. Les requêtes d'agrégation des courses utilisent `jsonb_array_elements` et `SUM()` en une seule requête SQL — fonctionnalité absente ou limitée dans SQLite. Supabase fournit aussi les Edge Functions pour les webhooks Suunto (V2), l'auth intégrée (V2) et la génération automatique des types TypeScript (`supabase gen types typescript`).

**Alternatives considérées** :
- Next.js + SQLite/Prisma (Stack B) : $0 absolu mais incompatible Vercel, webhooks complexes, migration vers Postgres nécessaire avant V2
- PocketBase (Stack C) : JSONB moins puissant, écosystème de composants UI React plus pauvre

### D3 — Zustand pour l'état du curseur + TanStack Query pour les données serveur

**Décision** : État du curseur sport dans Zustand (local, éphémère). Données DB dans TanStack Query (cache, invalidation).

**Pourquoi** : Le curseur sport doit déclencher un recalcul temps réel sans polluer le cache serveur à chaque mouvement. Zustand stocke `sportKcal` localement ; TanStack Query ne s'invalide que sur `onChangeEnd` (fin du glissement). Séparation claire : état UI local (Zustand) vs état serveur (TanStack Query).

### D4 — Rendu hybride : Server Components pour le fetch initial, Client Components pour l'interactivité

**Décision** :
- `app/*/page.tsx` → Server Components (fetch initial via Server Actions)
- `CalorieSlider.tsx`, `MacroChart.tsx`, `CoursesTable.tsx`, `WeekCalendar.tsx` → Client Components

**Pourquoi** : Les pages chargent leurs données initiales côté serveur (zero JS pour le fetch), puis les composants interactifs prennent le relais côté client. Recharts et TanStack Table nécessitent le DOM — ils doivent être Client Components.

### D5 — Formule Mifflin-St Jeor (pas Harris-Benedict)

**Décision** : Implémenter uniquement Mifflin-St Jeor dans `lib/physiologie/tmb.ts`.

**Pourquoi** : Mifflin-St Jeor est plus précise pour les adultes actifs (erreur ±10% vs ±15% pour Harris-Benedict selon les méta-analyses). La PRD la mentionne explicitement. Harris-Benedict peut être ajoutée en V2 comme option.

### D6 — Variables d'environnement : clé service role côté serveur uniquement

**Décision** : `SUPABASE_SERVICE_ROLE_KEY` n'est jamais préfixée `NEXT_PUBLIC_`. Toutes les mutations passent par les Server Actions qui utilisent cette clé.

**Pourquoi** : En V1 sans authentification, le RLS Supabase n'est pas activé. La seule protection est que la clé service role ne soit jamais exposée au navigateur. Les Server Actions garantissent cette isolation.

## Risks / Trade-offs

- **[Risque] Pas d'authentification en V1** → L'app est accessible sans mot de passe. Mitigation : déploiement sur URL Vercel non divulguée, pas de données sensibles critiques (pas de santé, pas de données financières).
- **[Risque] Supabase Free tier pause après 1 semaine d'inactivité** → Mitigation : utiliser un cron job Vercel gratuit (ping DB toutes les 48h) ou activer l'option "No pausing" disponible en Free tier depuis 2024.
- **[Trade-off] Server Actions vs API Routes** → En V1, les Server Actions sont plus simples. La migration V2 pour les webhooks Suunto nécessitera d'ajouter des API Routes — pas de refactoring majeur mais travail supplémentaire.
- **[Risque] JSONB ingrédients** → Les erreurs de format JSON ne sont pas catchées au niveau TypeScript (type `Json` de Supabase est permissif). Mitigation : validation Zod systématique sur les formulaires recettes.
- **[Trade-off] shadcn/ui copy-paste** → Les composants sont copiés localement (ownership total) mais ne se mettent pas à jour automatiquement. Mitigation : accepté pour la V1, pas de mises à jour automatiques nécessaires.

## Migration Plan

1. Créer le projet Next.js 15 localement (`npx create-next-app@latest`)
2. Configurer Biome, Tailwind, shadcn/ui
3. Créer le projet Supabase (dashboard en ligne) + variables `.env.local`
4. Exécuter les migrations SQL (`001_init_schema.sql`, `002_seed_recettes.sql`)
5. Générer les types TypeScript : `supabase gen types typescript`
6. Implémenter les 6 capabilities dans l'ordre : profil → recettes → suivi-sportif → collation → planificateur → courses
7. Déployer sur Vercel (import GitHub) + configurer les variables d'environnement Vercel

**Rollback** : Projet greenfield — aucun rollback nécessaire. En cas de problème de migration SQL, supprimer et recréer le projet Supabase dev.

## Open Questions

- **Seed recettes** : Combien de recettes initiales ? (suggestion : 3 par type_repas = 12 recettes pour rendre l'app opérationnelle)
- **Allergènes** : Faut-il filtrer les recettes selon `profil.allergies` dès la V1, ou afficher simplement un badge d'avertissement ?
- **Unité de vente Drive (V3)** : La fonction `arrondiUniteDrive` nécessite `uniteVenteGrammes` par ingrédient — ce champ est-il à ajouter en JSONB dès V1 pour préparer V3 ?
