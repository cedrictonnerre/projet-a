# Projet : Dashboard Nutrition & Sport Connecté

> Document de référence projet — V1 (MVP)
> Source de vérité pour les décisions produit, techniques et architecturales.

---

## Vision

Application web **personnelle et modulaire** permettant de gérer la nutrition en fonction de l'activité physique réelle. L'outil automatise la planification des repas, la gestion des courses et l'ajustement calorique via une variable spécifique : **la collation dynamique**.

Usage cible : 1 utilisateur principal (potentiellement famille proche < 5 users).

---

## Roadmap

| Version | Périmètre |
|---------|-----------|
| **V1 — MVP** | Saisie manuelle du sport, calcul menus, liste de courses consolidée, bouton "J'ai déjà", pas d'authentification |
| **V2 — Automation** | Connexion API Suunto (OAuth 2.0 + webhooks), authentification Supabase, RLS, inventaire permanent |
| **V3 — Drive** | Mapping catalogue Intermarché Drive, remplissage panier automatique, export liste de courses |

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework fullstack | Next.js (App Router) | 15.x |
| Langage | TypeScript | 5.x |
| Base de données | PostgreSQL via Supabase | — |
| UI Components | shadcn/ui (Radix UI + Tailwind) | latest |
| Styles | Tailwind CSS | 3.4.x |
| Hébergement frontend | Vercel (Hobby) | — |
| Hébergement DB | Supabase (Free tier) | — |

## Bibliothèques

| Besoin | Librairie | Version |
|--------|-----------|---------|
| Charts | Recharts | ^2.12 |
| Tables | TanStack Table | ^8.x |
| Formulaires | React Hook Form | ^7.x |
| Validation | Zod | ^3.x |
| State serveur | TanStack Query | ^5.x |
| State client | Zustand | ^4.x |
| Dates | date-fns (locale `fr`) | ^3.x |
| Linting / Format | Biome | ^1.x |

---

## Structure du projet

```
src/
├── app/                              ← Pages (App Router)
│   ├── layout.tsx                    ← Layout global + providers (Query, Zustand)
│   ├── page.tsx                      ← Dashboard principal (résumé jour)
│   ├── profil/page.tsx               ← Saisie profil + recalcul objectif_kcal
│   ├── planificateur/page.tsx        ← Vue semaine + curseur sport + collation
│   ├── recettes/page.tsx             ← Bibliothèque recettes + filtres
│   └── courses/page.tsx              ← Liste consolidée + bouton "J'ai déjà"
├── components/
│   ├── dashboard/
│   │   ├── CalorieSlider.tsx         ← Curseur sport (Client Component)
│   │   ├── MacroChart.tsx            ← Recharts : répartition macros du jour
│   │   └── WeekCalendar.tsx          ← Grille semaine avec repas + sport
│   ├── courses/
│   │   └── CoursesTable.tsx          ← TanStack Table + toggle "J'ai déjà"
│   └── ui/                           ← Composants shadcn/ui (copiés localement)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Client Supabase (browser)
│   │   └── server.ts                 ← Client Supabase (Server Actions uniquement)
│   ├── physiologie/
│   │   ├── tmb.ts                    ← Formule Mifflin-St Jeor + TDEE
│   │   ├── macros.ts                 ← Répartition glucides/protéines/lipides
│   │   └── collation.ts             ← Calcul déficit + sélection collation optimale
│   └── courses/
│       └── consolidation.ts          ← Agrégation ingrédients + arrondi unité Drive
├── actions/                          ← Next.js Server Actions (jamais exposées côté client)
│   ├── profil.ts                     ← CRUD profil + recalcul objectif_kcal
│   ├── planificateur.ts              ← Ajout/modif repas + séance sport
│   └── courses.ts                    ← Toggle "J'ai déjà"
├── types/
│   └── database.ts                   ← Généré : supabase gen types typescript
└── supabase/
    ├── migrations/
    │   ├── 001_init_schema.sql        ← 4 tables + FK + index
    │   └── 002_seed_recettes.sql      ← Recettes initiales
    └── functions/
        ├── suunto-sync/               ← V2 : webhooks Suunto
        └── drive-basket/              ← V3 : remplissage panier Drive
```

---

## Base de données — 4 tables PostgreSQL

### `profil`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `poids` | NUMERIC(5,2) | NOT NULL — kg |
| `taille` | INTEGER | NOT NULL — cm |
| `age` | INTEGER | NOT NULL |
| `sexe` | TEXT | NOT NULL CHECK `'homme'` \| `'femme'` |
| `niveau_activite` | TEXT | NOT NULL DEFAULT `'tres_actif'` CHECK `sedentaire` / `leger` / `modere` / `tres_actif` / `extreme` |
| `objectif` | TEXT | NOT NULL DEFAULT `'prise_muscle'` CHECK `perte_poids` / `maintien` / `prise_muscle` |
| `objectif_kcal` | INTEGER | NOT NULL — Calculé par l'app, stocké après chaque màj |
| `allergies` | TEXT[] | NOT NULL DEFAULT `'{}'` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### `recettes`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `nom_recette` | TEXT | NOT NULL |
| `type_repas` | TEXT | NOT NULL CHECK `'matin'` \| `'midi'` \| `'soir'` \| `'collation'` |
| `ingredients` | JSONB | NOT NULL — `[{nom, grammes, rayon_drive}]` |
| `calories_100g` | NUMERIC(6,2) | NOT NULL |
| `temps_prepa` | INTEGER | NOT NULL — minutes |
| `is_recyclable` | BOOLEAN | NOT NULL DEFAULT FALSE |

Index : `type_repas`, `temps_prepa`

### `planificateur_hebdo`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `date` | DATE | NOT NULL |
| `repas_id` | UUID | FK → `recettes` ON DELETE SET NULL |
| `sport_id` | UUID | FK → `suivi_sportif` ON DELETE SET NULL |
| `is_rest` | BOOLEAN | NOT NULL DEFAULT FALSE — TRUE = recyclage repas soir J-1 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

Index : `date`

### `suivi_sportif`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `type_sport` | TEXT | NOT NULL CHECK `musculation` \| `trail` \| `running` \| `etirements` |
| `duree` | INTEGER | NOT NULL — minutes |
| `kcal_brulees` | INTEGER | NOT NULL — Saisie manuelle V1, Suunto V2 |
| `impact_macro` | TEXT | NOT NULL CHECK `glucides` \| `proteines` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

Correspondance sport → impact_macro :
- `musculation` → `proteines`
- `trail`, `running`, `etirements` → `glucides`

### Schéma SQL complet

```sql
CREATE TABLE profil (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  poids            NUMERIC(5,2) NOT NULL,
  taille           INTEGER      NOT NULL,
  age              INTEGER      NOT NULL,
  sexe             TEXT         NOT NULL CHECK (sexe IN ('homme', 'femme')),
  niveau_activite  TEXT         NOT NULL DEFAULT 'tres_actif'
                   CHECK (niveau_activite IN ('sedentaire','leger','modere','tres_actif','extreme')),
  objectif         TEXT         NOT NULL DEFAULT 'prise_muscle'
                   CHECK (objectif IN ('perte_poids','maintien','prise_muscle')),
  objectif_kcal    INTEGER      NOT NULL,
  allergies        TEXT[]       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE recettes (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_recette     TEXT         NOT NULL,
  type_repas      TEXT         NOT NULL CHECK (type_repas IN ('matin','midi','soir','collation')),
  ingredients     JSONB        NOT NULL,
  calories_100g   NUMERIC(6,2) NOT NULL,
  temps_prepa     INTEGER      NOT NULL,
  is_recyclable   BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_recettes_type_repas  ON recettes (type_repas);
CREATE INDEX idx_recettes_temps_prepa ON recettes (temps_prepa);

CREATE TABLE suivi_sportif (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport    TEXT        NOT NULL CHECK (type_sport IN ('musculation','trail','running','etirements')),
  duree         INTEGER     NOT NULL,
  kcal_brulees  INTEGER     NOT NULL,
  impact_macro  TEXT        NOT NULL CHECK (impact_macro IN ('glucides','proteines')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE planificateur_hebdo (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE        NOT NULL,
  repas_id   UUID        REFERENCES recettes(id)      ON DELETE SET NULL,
  sport_id   UUID        REFERENCES suivi_sportif(id) ON DELETE SET NULL,
  is_rest    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_planificateur_date ON planificateur_hebdo (date);
```

---

## Logique métier clé

### TMB — `lib/physiologie/tmb.ts`

Formule Mifflin-St Jeor :
- Homme : `(10 × poids) + (6.25 × taille) - (5 × age) + 5`
- Femme : `(10 × poids) + (6.25 × taille) - (5 × age) - 161`

```
TDEE = TMB × PAL
PAL : sedentaire 1.2 / leger 1.375 / modere 1.55 / tres_actif 1.725 / extreme 1.9

objectif_kcal = TDEE + surplus
surplus : perte_poids -500 / maintien 0 / prise_muscle +250
```

Implémentation TypeScript :

```typescript
export const PAL = {
  sedentaire:  1.2,    // Peu ou pas d'exercice
  leger:       1.375,  // 1–3 séances/semaine
  modere:      1.55,   // 3–5 séances/semaine
  tres_actif:  1.725,  // 6–7 séances/semaine  ← valeur utilisateur actuelle
  extreme:     1.9,    // 2× par jour
} as const

export const SURPLUS_OBJECTIF = {
  perte_poids:  -500,  // déficit kcal/j
  maintien:        0,
  prise_muscle:  +250, // surplus kcal/j       ← valeur utilisateur actuelle
} as const

export function calculerTMB(poids: number, taille: number, age: number, sexe: 'homme' | 'femme'): number {
  const base = 10 * poids + 6.25 * taille - 5 * age
  return sexe === 'homme' ? base + 5 : base - 161
}

export function calculerObjectifKcal(
  tmb: number,
  niveau_activite: keyof typeof PAL,
  objectif: keyof typeof SURPLUS_OBJECTIF
): number {
  const tdee = Math.round(tmb * PAL[niveau_activite])
  return tdee + SURPLUS_OBJECTIF[objectif]
}
```

### Collation dynamique — `lib/physiologie/collation.ts`

Flux complet : curseur sport → recalcul collation

```
[Utilisateur déplace le curseur]
         ↓
CalorieSlider.tsx  (Client Component)
         ↓  onChangeEnd → Zustand : set({ sportKcal })
         ↓
useCollation(sportKcal)  [TanStack Query — invalidation automatique]
         ↓
Server Action : calcCollation(sportKcal)
         ↓
  1. Lire profil.objectif_kcal
  2. Lire kcal des repas fixes du jour (matin + midi + soir)
  3. deficit = objectif_kcal - repas_fixes_kcal + sportKcal
  4. SELECT recettes
       WHERE type_repas = 'collation'
         AND impact_macro = (sport actif).impact_macro
       ORDER BY ABS(calories_100g * (deficit / calories_100g) - deficit) ASC
       LIMIT 1
  5. quantite_g = ROUND((deficit / calories_100g) * 100)
         ↓
Retour : { recette, quantite_g }
         ↓
MacroChart.tsx + résumé jour ← re-render
```

Règle impact_macro :
- `musculation` → collation riche en **protéines**
- `trail`, `running`, `etirements` → collation riche en **glucides**

### Recyclage repas (is_rest = TRUE) — règle J → J+1

- La recette du soir J-1 est réutilisée au midi J
- Les quantités des ingrédients sont multipliées par 2 lors de la consolidation courses
- Le calcul calorique du midi J utilise les calories de la recette soir J-1

### Consolidation courses — `lib/courses/consolidation.ts`

```sql
SELECT
  ingredient->>'nom'           AS nom,
  ingredient->>'rayon_drive'   AS rayon_drive,
  SUM((ingredient->>'grammes')::numeric
    * CASE WHEN ph.is_rest THEN 2 ELSE 1 END) AS total_grammes
FROM planificateur_hebdo ph
JOIN recettes r ON r.id = ph.repas_id
CROSS JOIN jsonb_array_elements(r.ingredients) AS ingredient
WHERE ph.date BETWEEN $1 AND $2
GROUP BY nom, rayon_drive
ORDER BY rayon_drive, nom;
```

Arrondi à l'unité de vente supérieure :

```typescript
export function arrondiUniteDrive(totalGrammes: number, uniteVenteGrammes: number): number {
  return Math.ceil(totalGrammes / uniteVenteGrammes)
}
```

---

## Conventions de code

### Server vs Client Components

| Composant | Type | Raison |
|-----------|------|--------|
| `app/*/page.tsx` | **Server Component** | Fetch initial via Server Actions |
| `CalorieSlider.tsx` | **Client Component** | Interactivité temps réel (`onChange`) |
| `MacroChart.tsx` | **Client Component** | Recharts requiert le DOM |
| `CoursesTable.tsx` | **Client Component** | TanStack Table, filtres interactifs |
| `WeekCalendar.tsx` | **Client Component** | Interactions utilisateur (clic, drag) |
| `components/ui/*` | **Client Component** | shadcn/ui (Radix UI) |

### Gestion d'état

| État | Outil | Justification |
|------|-------|---------------|
| Données serveur (recettes, planificateur, courses, profil) | TanStack Query | Cache + invalidation automatique après Server Action |
| Valeur curseur sport (temps réel) | Zustand | Léger, local, pas besoin de persistance |
| Filtre `temps_prepa` recettes | Zustand | Préférence UI locale |

### Mutations

- Toutes les mutations DB passent par des **Server Actions** (`'use server'`)
- Chaque Server Action invalide les queries TanStack Query concernées après mutation

### Sécurité (V1)

- Pas d'authentification en V1 (usage solo personnel)
- Interactions Supabase via Server Actions avec `SUPABASE_SERVICE_ROLE_KEY` (jamais exposée)
- RLS activé en V2 avec authentification multi-utilisateurs

### Variables d'environnement

```bash
NEXT_PUBLIC_SUPABASE_URL=...       # OK côté client
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # OK côté client
SUPABASE_SERVICE_ROLE_KEY=...      # Serveur uniquement, jamais préfixé NEXT_PUBLIC_
```

### Workflow types DB

Après chaque migration SQL :
```bash
supabase gen types typescript --project-id <id> > src/types/database.ts
```

### Unités

Toutes les quantités sont gérées en **grammes**.

---

## Déploiement

### Environnements

| Environnement | Frontend | Base de données |
|--------------|----------|----------------|
| Développement local | `next dev` (localhost:3000) | Supabase projet dédié dev |
| Production | Vercel Hobby (gratuit) | Supabase projet dédié prod |

### Variables d'environnement

```bash
# .env.local (ne jamais committer)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # Serveur uniquement
```

### Coût

| Phase | Coût mensuel |
|-------|-------------|
| Développement + MVP (usage solo) | $0 |
| Production famille (< 5 utilisateurs) | $0 |
| Si > 500 MB stockage ou backups avancés | $25/mois (Supabase Pro) |

---

## Roadmap technique détaillée

### V1 — MVP (état actuel)
- Saisie manuelle du sport via curseur
- Calcul Mifflin-St Jeor → `objectif_kcal`
- Sélection et ajustement automatique de la collation
- Planificateur hebdomadaire + règle recyclage J → J+1
- Liste de courses consolidée + bouton "J'ai déjà"
- Pas d'authentification (accès direct, usage solo)

### V2 — Automatisation Suunto
- Authentification Supabase (email/password ou OAuth)
- Activation RLS sur les 4 tables
- Supabase Edge Function `suunto-sync` : réception webhook → mise à jour `suivi_sportif`
- OAuth 2.0 Suunto via Next.js API Route `/api/suunto/callback`
- Gestion inventaire permanent (placard)

### V3 — Intégration Drive
- Supabase Edge Function `drive-basket` : mapping ingrédients → catalogue Intermarché
- Next.js API Route `/api/drive` : proxy REST + gestion token Drive
- Arrondi à l'unité de vente + remplissage panier automatique
- Export liste de courses (PDF ou partage lien)

---

## Contraintes non-fonctionnelles

- Web-first, responsive mobile (Tailwind breakpoints)
- Budget : $0 en développement + MVP, < $25/mois acceptable en production
- Longévité cible : 3+ ans sans refonte majeure
- Locale : français (`fr`) pour les dates et l'interface
