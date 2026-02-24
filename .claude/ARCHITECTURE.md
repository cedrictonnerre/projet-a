# Architecture Technique
## Dashboard Nutrition & Sport Connecté

> Document de référence pour le développement — V1 (MVP)
> Décisions figées — à mettre à jour avant chaque nouvelle phase.

---

## 1. Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework fullstack | Next.js (App Router) | 15.x |
| Langage | TypeScript | 5.x |
| Base de données | PostgreSQL via Supabase | — |
| UI Components | shadcn/ui (Radix UI + Tailwind) | latest |
| Styles | Tailwind CSS | 3.4.x |
| Hébergement frontend | Vercel (Hobby) | — |
| Hébergement DB | Supabase (Free tier) | — |

---

## 2. Bibliothèques

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

## 3. Structure du projet

```
src/
├── app/                              ← Pages (App Router)
│   ├── layout.tsx                    ← Layout global + providers (Query, Zustand)
│   ├── page.tsx                      ← Dashboard principal (résumé jour)
│   ├── profil/
│   │   └── page.tsx                  ← Saisie profil + recalcul objectif_kcal
│   ├── planificateur/
│   │   └── page.tsx                  ← Vue semaine + curseur sport + collation
│   ├── recettes/
│   │   └── page.tsx                  ← Bibliothèque recettes + filtres
│   └── courses/
│       └── page.tsx                  ← Liste consolidée + bouton "J'ai déjà"
│
├── components/
│   ├── dashboard/
│   │   ├── CalorieSlider.tsx         ← Curseur sport (Client Component)
│   │   ├── MacroChart.tsx            ← Recharts : répartition macros du jour
│   │   └── WeekCalendar.tsx          ← Grille semaine avec repas + sport
│   ├── courses/
│   │   └── CoursesTable.tsx          ← TanStack Table + toggle "J'ai déjà"
│   └── ui/                           ← Composants shadcn/ui (copiés localement)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Client Supabase (browser, composants client)
│   │   └── server.ts                 ← Client Supabase (Server Actions uniquement)
│   ├── physiologie/
│   │   ├── tmb.ts                    ← Formule Mifflin-St Jeor + TDEE
│   │   ├── macros.ts                 ← Répartition glucides/protéines/lipides
│   │   └── collation.ts             ← Calcul déficit + sélection collation optimale
│   └── courses/
│       └── consolidation.ts          ← Agrégation ingrédients + arrondi unité Drive
│
├── actions/                          ← Next.js Server Actions (jamais exposées côté client)
│   ├── profil.ts                     ← CRUD profil + recalcul objectif_kcal
│   ├── planificateur.ts              ← Ajout/modif repas + séance sport
│   └── courses.ts                    ← Toggle "J'ai déjà"
│
├── types/
│   └── database.ts                   ← Généré automatiquement : supabase gen types typescript
│
└── supabase/
    ├── migrations/
    │   ├── 001_init_schema.sql        ← 4 tables + FK + index
    │   └── 002_seed_recettes.sql      ← Recettes initiales
    └── functions/                     ← Edge Functions (V2 et V3, vides en V1)
        ├── suunto-sync/               ← V2 : réception webhooks Suunto
        └── drive-basket/              ← V3 : remplissage panier Intermarché Drive
```

---

## 4. Base de données

### Schéma des 4 tables

```sql
-- ============================================================
-- TABLE 1 : Profil Utilisateur
-- ============================================================
CREATE TABLE profil (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  poids            NUMERIC(5,2) NOT NULL,                        -- kg
  taille           INTEGER      NOT NULL,                        -- cm
  age              INTEGER      NOT NULL,
  sexe             TEXT         NOT NULL CHECK (sexe IN ('homme', 'femme')),
  niveau_activite  TEXT         NOT NULL DEFAULT 'tres_actif'
                   CHECK (niveau_activite IN ('sedentaire','leger','modere','tres_actif','extreme')),
  objectif         TEXT         NOT NULL DEFAULT 'prise_muscle'
                   CHECK (objectif IN ('perte_poids','maintien','prise_muscle')),
  objectif_kcal    INTEGER      NOT NULL,  -- Calculé par l'app, stocké après chaque maj profil
  allergies        TEXT[]       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 2 : Bibliothèque de Recettes
-- ============================================================
CREATE TABLE recettes (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_recette     TEXT         NOT NULL,
  type_repas      TEXT         NOT NULL
                  CHECK (type_repas IN ('matin','midi','soir','collation')),
  ingredients     JSONB        NOT NULL,   -- [{nom, grammes, rayon_drive}]
  calories_100g   NUMERIC(6,2) NOT NULL,
  temps_prepa     INTEGER      NOT NULL,   -- minutes
  is_recyclable   BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_recettes_type_repas   ON recettes (type_repas);
CREATE INDEX idx_recettes_temps_prepa  ON recettes (temps_prepa);

-- ============================================================
-- TABLE 3 : Planificateur Hebdomadaire
-- ============================================================
CREATE TABLE planificateur_hebdo (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date      DATE        NOT NULL,
  repas_id  UUID        REFERENCES recettes(id)      ON DELETE SET NULL,
  sport_id  UUID        REFERENCES suivi_sportif(id) ON DELETE SET NULL,
  is_rest   BOOLEAN     NOT NULL DEFAULT FALSE,  -- TRUE = recyclage repas soir J-1
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_planificateur_date ON planificateur_hebdo (date);

-- ============================================================
-- TABLE 4 : Suivi Sportif
-- ============================================================
CREATE TABLE suivi_sportif (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport    TEXT        NOT NULL
                CHECK (type_sport IN ('musculation','trail','running','etirements')),
  duree         INTEGER     NOT NULL,   -- minutes
  kcal_brulees  INTEGER     NOT NULL,   -- saisie manuelle V1, Suunto V2
  impact_macro  TEXT        NOT NULL
                CHECK (impact_macro IN ('glucides','proteines')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Correspondance sport → impact_macro

| Type de sport | impact_macro |
|--------------|-------------|
| Musculation | `proteines` |
| Trail | `glucides` |
| Running | `glucides` |
| Étirements | `glucides` |

### Sécurité (V1 sans authentification)

En V1, l'app est à usage strictement personnel — aucune page de connexion.
Toutes les interactions avec Supabase passent exclusivement par les **Server Actions** Next.js,
qui utilisent la clé `SUPABASE_SERVICE_ROLE_KEY` (stockée en variable d'environnement serveur, jamais exposée au navigateur).

```
NEXT_PUBLIC_SUPABASE_URL=...        ← OK côté client (non-sensible)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   ← OK côté client (lecture publique)
SUPABASE_SERVICE_ROLE_KEY=...       ← Serveur uniquement, jamais préfixé NEXT_PUBLIC_
```

Le RLS sera activé et configuré en **V2** lors de l'ajout de l'authentification multi-utilisateurs (famille).

---

## 5. Logique métier

### 5.1 Formule Mifflin-St Jeor

**Implémentation : `lib/physiologie/tmb.ts`**

```typescript
// Facteurs d'activité (PAL — Physical Activity Level)
export const PAL = {
  sedentaire:  1.2,    // Peu ou pas d'exercice
  leger:       1.375,  // 1–3 séances/semaine
  modere:      1.55,   // 3–5 séances/semaine
  tres_actif:  1.725,  // 6–7 séances/semaine  ← valeur utilisateur actuelle
  extreme:     1.9,    // 2× par jour
} as const

// Ajustement selon objectif
export const SURPLUS_OBJECTIF = {
  perte_poids:  -500,  // déficit kcal/j
  maintien:        0,
  prise_muscle:  +250, // surplus kcal/j       ← valeur utilisateur actuelle
} as const

// TMB Mifflin-St Jeor
export function calculerTMB(
  poids: number,   // kg
  taille: number,  // cm
  age: number,
  sexe: 'homme' | 'femme'
): number {
  const base = 10 * poids + 6.25 * taille - 5 * age
  return sexe === 'homme' ? base + 5 : base - 161
}

// TDEE + objectif → objectif_kcal stocké dans profil
export function calculerObjectifKcal(
  tmb: number,
  niveau_activite: keyof typeof PAL,
  objectif: keyof typeof SURPLUS_OBJECTIF
): number {
  const tdee = Math.round(tmb * PAL[niveau_activite])
  return tdee + SURPLUS_OBJECTIF[objectif]
}
```

### 5.2 Flux : curseur sport → recalcul collation

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

**Règle impact_macro** :
- Sport musculaire (musculation) → collation riche en **protéines**
- Sport cardio (trail, running) → collation riche en **glucides**
- Étirements → traité comme cardio léger (glucides)

### 5.3 Recyclage repas (règle J → J+1)

Quand `is_rest = TRUE` sur une ligne du planificateur :
- La recette du **soir J-1** est réutilisée au **midi J**
- Les quantités de tous les ingrédients sont **multipliées par 2** lors de la consolidation courses
- Le calcul calorique du midi J utilise les calories de la recette soir J-1

### 5.4 Consolidation des courses

**Implémentation : `lib/courses/consolidation.ts`**

```typescript
// Agrégation JSONB des ingrédients de la semaine
// Requête SQL :
SELECT
  ingredient->>'nom'                        AS nom,
  ingredient->>'rayon_drive'                AS rayon_drive,
  SUM((ingredient->>'grammes')::numeric
    * CASE WHEN ph.is_rest THEN 2 ELSE 1 END) AS total_grammes
FROM planificateur_hebdo ph
JOIN recettes r ON r.id = ph.repas_id
CROSS JOIN jsonb_array_elements(r.ingredients) AS ingredient
WHERE ph.date BETWEEN $1 AND $2
GROUP BY ingredient->>'nom', ingredient->>'rayon_drive'
ORDER BY ingredient->>'rayon_drive', ingredient->>'nom';

// Arrondi à l'unité de vente supérieure (V3 Drive)
export function arrondiUniteDrive(totalGrammes: number, uniteVenteGrammes: number): number {
  return Math.ceil(totalGrammes / uniteVenteGrammes)
}
```

---

## 6. Gestion de l'état

| État | Outil | Justification |
|------|-------|---------------|
| Données serveur (recettes, planificateur, courses) | TanStack Query | Cache + invalidation automatique après Server Action |
| Valeur du curseur sport (temps réel) | Zustand | Léger, local, pas besoin de persistance |
| Filtre `temps_prepa` sur les recettes | Zustand | Préférence UI locale |
| Données profil | TanStack Query | Rarement modifiées, bénéficie du cache |

---

## 7. Rendu : Server vs Client Components

| Composant | Type | Raison |
|-----------|------|--------|
| `app/*/page.tsx` | Server Component | Fetch initial des données via Server Actions |
| `CalorieSlider.tsx` | Client Component | Interactivité temps réel (`onChange`) |
| `MacroChart.tsx` | Client Component | Recharts requiert le DOM |
| `CoursesTable.tsx` | Client Component | TanStack Table, filtres interactifs |
| `WeekCalendar.tsx` | Client Component | Interactions utilisateur (clic, drag) |
| `components/ui/*` | Client Component | shadcn/ui (Radix UI) |

---

## 8. Déploiement

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

### Workflow types auto-générés

À exécuter après chaque migration SQL :

```bash
supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

### Coût

| Phase | Coût mensuel |
|-------|-------------|
| Développement + MVP (usage solo) | $0 |
| Production famille (< 5 utilisateurs) | $0 |
| Si > 500 MB stockage ou backups avancés | $25/mois (Supabase Pro) |

---

## 9. Roadmap technique

### V1 — MVP (état actuel)
- Saisie manuelle du sport via curseur
- Calcul Mifflin-St Jeor → objectif_kcal
- Sélection et ajustement automatique de la collation
- Planificateur hebdomadaire + règle recyclage
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

*Dernière mise à jour : 24 février 2026*
