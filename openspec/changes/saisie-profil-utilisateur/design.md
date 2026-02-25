## Context

Le projet démarre sur une base vierge. Aucune table n'existe encore en base de données, aucune page n'est implémentée. La saisie du profil utilisateur est le **point d'entrée obligatoire** : sans `objectif_kcal`, le planificateur et la collation dynamique ne peuvent fonctionner. Ce premier développement pose également la fondation architecturale du projet (structure Next.js App Router, Supabase Server Actions, React Hook Form + Zod).

## Goals / Non-Goals

**Goals:**
- Créer la migration SQL pour la table `profil`
- Implémenter la logique TMB/TDEE dans `src/lib/physiologie/tmb.ts`
- Créer la Server Action `src/actions/profil.ts` (upsert profil + calcul `objectif_kcal`)
- Créer la page `src/app/profil/page.tsx` avec formulaire de saisie
- Afficher les valeurs calculées (TMB, TDEE, objectif_kcal) après soumission

**Non-Goals:**
- Authentification / gestion multi-utilisateurs (V2)
- Historique des modifications de profil
- Gestion des allergènes (V1 différé au planificateur)
- Connexion Suunto ou ajustement sport (planificateur)

## Decisions

### D1 — Profil unique sans authentification (V1)
**Décision** : La table `profil` contient un seul enregistrement (id fixe `1`). L'opération est un `upsert` (INSERT ON CONFLICT DO UPDATE).
**Alternatives considérées** : Row par utilisateur avec auth Supabase → complexité inutile pour usage solo en V1.
**Rationale** : Simplicité maximale, conformément à la contrainte V1 du PRD.

### D2 — Calcul de `objectif_kcal` en Server Action
**Décision** : Le calcul TMB → TDEE → `objectif_kcal` est effectué dans `src/actions/profil.ts` (côté serveur), pas dans le composant client.
**Alternatives considérées** : Calcul côté client puis envoi du résultat → risque de manipulation de la valeur.
**Rationale** : Cohérence avec la règle "toutes les mutations DB via Server Actions". La logique pure est isolée dans `src/lib/physiologie/tmb.ts` pour testabilité.

### D3 — Formulaire React Hook Form + Zod
**Décision** : Validation côté client via React Hook Form + schéma Zod, revalidation côté serveur dans la Server Action avec le même schéma Zod.
**Alternatives considérées** : Formulaire HTML natif → pas de validation typée, pas de gestion d'erreurs par champ.
**Rationale** : Déjà dans les dépendances du projet ; double validation client/serveur sans duplication (schéma partagé).

### D4 — Page Profil comme Server Component wrappant un Client Component
**Décision** : `src/app/profil/page.tsx` est un Server Component qui charge le profil existant via une lecture Supabase directe, et passe les données au composant `ProfilForm` (Client Component).
**Rationale** : Respect des conventions du projet (pages = Server Components, formulaires interactifs = Client Components).

### D5 — Niveaux d'activité PAL comme enum TypeScript
**Décision** : Cinq niveaux codifiés : `sedentaire (1.2)`, `leger (1.375)`, `modere (1.55)`, `tres_actif (1.725)`, `extreme (1.9)`. Libellés français affichés dans le select.
**Rationale** : Correspondance directe avec les valeurs PAL standard Mifflin-St Jeor, aligné avec la documentation de l'architecture.

## Risks / Trade-offs

- **[Risque] Profil unique `id=1`** → Si plusieurs utilisateurs utilisent l'app simultanément en V1, ils partagent le même profil. *Mitigation* : Usage solo V1, migration vers auth Supabase prévue en V2.
- **[Risque] Types DB non générés au démarrage** → `src/types/database.ts` n'existe pas avant la première migration Supabase. *Mitigation* : Génération via `supabase gen types` après exécution de la migration ; documenter l'étape dans tasks.md.
- **[Trade-off] Recalcul `objectif_kcal` à chaque soumission** → Valeur recalculée côté serveur à chaque upsert. Simple et fiable, mais ne reflète pas automatiquement un changement de poids quotidien. Acceptable pour V1.

## Migration Plan

1. Écrire `supabase/migrations/001_init_schema.sql` (table `profil`)
2. Appliquer la migration : `supabase db push` (local) ou via Supabase Dashboard
3. Générer les types TypeScript : `supabase gen types typescript --project-id <id> > src/types/database.ts`
4. Implémenter `tmb.ts`, `actions/profil.ts`, `app/profil/page.tsx`
5. Tester le formulaire localement (Playwright)

**Rollback** : Supprimer la table `profil` via une migration de rollback `DROP TABLE IF EXISTS profil`.

## Open Questions

_(aucune — toutes les décisions techniques sont claires pour V1)_
