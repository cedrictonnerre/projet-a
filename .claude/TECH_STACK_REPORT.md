# Rapport de Comparaison Tech Stack
## Dashboard Nutrition & Sport Connecté

> Document de décision technique — Version 1.0 — Février 2026
> Ce rapport est autonome et lisible sans le PRD.

---

## 1. Résumé des exigences techniques

Le projet est un dashboard personnel modulaire permettant de piloter la nutrition en fonction de l'activité physique réelle. Les contraintes techniques structurantes sont :

### Données
- **Modèle relationnel strict** : 4 tables liées par des clés étrangères (Profil, Recettes, Planificateur Hebdo, Suivi Sportif)
- **Champ JSON** : la table Recettes stocke les ingrédients sous forme `{nom, grammes, rayon_drive}` — nécessite une DB supportant le JSON natif ou via ORM
- **Transactions multi-tables** : l'ajout d'une séance sport met à jour simultanément le Planificateur et le calcul de la Collation

### Calculs
- TMB (Métabolisme de Base) : formule de Harris-Benedict ou Mifflin-St Jeor
- Ajustement dynamique des macros selon le type de sport (`impact_macro` : glucides ou protéines)
- Consolidation des ingrédients hebdomadaires (somme + arrondi à l'unité de vente supérieure)
- Déficit calorique restant → sélection et quantité de collation adaptée

### Interface
- Dashboard modulaire avec **curseur Sport** → recalcul en temps réel de la collation
- Filtre temporel sur les recettes (`temps_prepa < N minutes`)
- Bouton "J'ai déjà" sur la liste de courses (soustraction d'ingrédient)
- Affichage des macros et calories sous forme de graphiques

### Roadmap
- **V1 (MVP)** : saisie manuelle, calcul menus, liste de courses — usage solo
- **V2** : intégration API **Suunto** (OAuth 2.0 + webhooks activité physique)
- **V3** : mapping catalogue **Intermarché Drive** (REST) + remplissage panier automatique

### Contraintes non-fonctionnelles
- Usage personnel (1 utilisateur principal, potentiellement famille proche)
- Web-first, responsive mobile
- Budget : $0 idéalement en développement, < $25/mois acceptable en production
- Longévité cible : 3+ ans sans refonte majeure

---

## 2. Critères d'évaluation

| # | Critère | Poids | Description |
|---|---------|-------|-------------|
| 1 | Developer Experience & courbe d'apprentissage | Standard | Facilité de prise en main, documentation, tooling |
| 2 | Performance UI pour dashboards complexes | Élevé | Rendu réactif, re-renders maîtrisés, animations fluides |
| 3 | Adéquation modèle de données relationnel | Élevé | Support JSON, FK, joins, transactions, migrations |
| 4 | Facilité intégration API tierces (Suunto, Drive) | Standard | OAuth, webhooks, gestion tokens, proxying |
| 5 | Écosystème (charts, tables, formulaires, UI) | Élevé | Richesse et maturité des librairies compatibles |
| 6 | Déploiement & coût d'hébergement | Standard | Gratuité plan dev, stabilité production |
| 7 | Maintenabilité long terme | Élevé | Typage, conventions, mises à jour écosystème |
| 8 | Adapté au développement solo | Standard | Convention over configuration, debugging, itération rapide |

Notation : /5 (1 = inadapté, 3 = acceptable, 5 = idéal pour ce projet)

---

## 3. Comparaison des 4 stacks

### Stack A — Next.js 15 + Supabase + Tailwind CSS + shadcn/ui

**Description** : Stack full-stack React moderne. Next.js 15 gère le rendu hybride (SSR/RSC/Client) avec les Server Actions pour éliminer la couche API en V1. Supabase fournit un PostgreSQL managé avec auth, storage et Edge Functions intégrés. shadcn/ui est une collection de composants Tailwind copy-paste prêts pour les dashboards.

#### Notation détaillée

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Developer Experience | 4/5 | Excellent tooling TypeScript, Server Actions simplifient le data fetching ; App Router a une courbe initiale |
| Performance UI | 5/5 | RSC réduisent le JS client, Suspense natif, re-renders maîtrisés avec TanStack Query |
| Modèle relationnel | 5/5 | PostgreSQL natif : JSON operators, FK avec cascade, joins optimisés, migrations SQL versionnées |
| Intégration API tierces | 5/5 | API Routes pour proxy OAuth Suunto ; Supabase Edge Functions pour webhooks (V2) ; accès réseau complet |
| Écosystème | 5/5 | Recharts, TanStack Table, React Hook Form, Zod, Zustand, date-fns — tout est mature et compatible |
| Déploiement & coût | 4/5 | Vercel Hobby (gratuit) + Supabase Free (500MB, pas de pause) ; Pro $25/mois si besoin |
| Maintenabilité | 5/5 | `supabase gen types` génère les types TS depuis le schéma DB ; conventions Next.js bien établies |
| Développement solo | 4/5 | Convention over configuration avec App Router ; shadcn accélère l'UI ; documentation abondante |

**Score global : 4.4/5**

#### Avantages
- PostgreSQL = seule DB vraiment adaptée au modèle relationnel du PRD (JSON natif, joins complexes)
- Types TypeScript auto-générés depuis la DB (`supabase gen types typescript`)
- Infrastructure Suunto-ready dès V1 : Edge Functions pour webhooks, auth multi-provider
- shadcn/ui fournit data-table, slider, form — les 3 composants clés du dashboard
- Zéro coût en développement, transition Pro fluide si famille ou scalabilité

#### Inconvénients
- App Router de Next.js 15 requiert de maîtriser RSC vs Client Components
- Supabase ajoute une dépendance externe (mais Free tier très stable)
- Légèrement plus verbeux qu'une solution tout-en-un type PocketBase

#### Bibliothèques recommandées

| Besoin | Librairie | Version | Justification |
|--------|-----------|---------|---------------|
| Charts | Recharts | ^2.12 | SVG, idiomatique React, animations, léger |
| Tables | TanStack Table | ^8.x | Headless, tri/filtre/pagination intégrés |
| Formulaires | React Hook Form | ^7.x | Performances, TypeScript-first |
| Validation | Zod | ^3.x | Schémas runtime, intégration RHF native |
| State serveur | TanStack Query | ^5.x | Cache, invalidation, synchronisation DB |
| State client | Zustand | ^4.x | Ultra-léger, idéal pour le curseur sport |
| Dates | date-fns | ^3.x | Tree-shakeable, 200+ fonctions, pas de mutation |
| UI | shadcn/ui | latest | Copy-paste, Tailwind natif, accessible (Radix) |

---

### Stack B — Next.js 15 + Prisma + SQLite + Tailwind CSS + shadcn/ui

**Description** : Même frontend que Stack A, mais avec une base de données locale SQLite gérée via Prisma ORM. Solution 100% locale, zéro dépendance externe. Idéale si le budget est absolument $0 ou si l'app tourne sur un NAS/serveur local.

#### Notation détaillée

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Developer Experience | 5/5 | Prisma Studio pour visualiser la DB, migrations auto, schéma déclaratif |
| Performance UI | 5/5 | Identique Stack A côté frontend |
| Modèle relationnel | 4/5 | SQLite gère FK et JSON (fonctions json_*), mais moins puissant que PostgreSQL pour les joins complexes |
| Intégration API tierces | 3/5 | Webhooks difficiles avec SQLite local (pas d'adresse publique par défaut) ; nécessite ngrok en dev |
| Écosystème | 5/5 | Identique Stack A |
| Déploiement & coût | 5/5 | $0 absolu si hébergé sur NAS ou Raspberry Pi ; Vercel incompatible avec SQLite fichier |
| Maintenabilité | 4/5 | Prisma génère les types ; SQLite moins adapté si migration vers cloud nécessaire plus tard |
| Développement solo | 5/5 | Setup minimal, tout local, itération ultra-rapide |

**Score global : 4.1/5**

#### Avantages
- Coût $0 absolu, aucune dépendance externe
- Prisma ORM excellent : autocomplétion, migrations versionnées, Prisma Studio
- Setup en 5 minutes, parfait pour prototypage rapide

#### Inconvénients
- SQLite fichier = impossible sur Vercel (filesystem éphémère)
- Webhooks Suunto V2 nécessitent une IP publique ou tunnel (complexité)
- Migration vers PostgreSQL nécessaire si scalabilité → charge de travail future
- JSON operators moins puissants que PostgreSQL

#### Bibliothèques recommandées
Identiques à Stack A, avec ajout de `better-sqlite3` ou `@prisma/client` comme couche DB.

---

### Stack C — SvelteKit + PocketBase + Tailwind CSS

**Description** : Alternative légère tout-en-un. SvelteKit pour le fullstack (stores réactifs natifs, pas de Virtual DOM), PocketBase comme backend self-hosted (BaaS open-source en Go avec SQLite embarqué, auth et API REST auto-générée).

#### Notation détaillée

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Developer Experience | 4/5 | Svelte très élégant, moins de boilerplate que React ; PocketBase admin UI agréable |
| Performance UI | 5/5 | Svelte compile vers du JS vanilla, performances brutes excellentes |
| Modèle relationnel | 3/5 | PocketBase = SQLite avec abstraction collection ; FK limitées, JSON natif mais ORM moins puissant |
| Intégration API tierces | 3/5 | Possible mais moins documenté ; PocketBase hooks en Go = barrière si pas de Go skills |
| Écosystème | 3/5 | Svelte Chart.js (Layerchart), mais moins de composants dashboard ready que React |
| Déploiement & coût | 4/5 | PocketBase = single binary, déploiement sur VPS $5/mois (Fly.io, Railway) |
| Maintenabilité | 3/5 | Écosystème plus petit, moins de ressources communautaires, PocketBase moins mature |
| Développement solo | 4/5 | Svelte réducteur de boilerplate, PocketBase évite la configuration backend |

**Score global : 3.9/5**

#### Avantages
- Bundle JS le plus léger des 4 stacks
- PocketBase = backend complet en 1 binaire (auth, DB, admin UI, REST)
- Svelte stores = réactivité native sans librairie d'état

#### Inconvénients
- Écosystème de composants UI moins riche qu'en React (peu de shadcn/ui équivalents)
- PocketBase moins adapté aux joins complexes multi-tables du PRD
- Webhooks Suunto V2 = développement custom en Go ou workarounds
- Moins de ressources d'apprentissage et d'exemples dashboard
- Risque de blocage sur des cas edge du modèle relationnel

#### Bibliothèques recommandées

| Besoin | Librairie |
|--------|-----------|
| Charts | Layerchart (Svelte + D3) |
| Tables | svelte-headless-table |
| Formulaires | Superforms + Zod |
| Dates | date-fns |
| UI | Skeleton UI ou Flowbite Svelte |

---

### Stack D — Nuxt 4 + Supabase + Tailwind CSS + Nuxt UI

**Description** : Équivalent Vue.js de Stack A. Nuxt 4 en mode full-stack avec le module `@nuxtjs/supabase` et Nuxt UI (bibliothèque de composants Vue officielle basée sur Headless UI + Tailwind).

#### Notation détaillée

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Developer Experience | 4/5 | Auto-imports Nuxt, Nuxt DevTools excellent ; Vue Composition API élégante |
| Performance UI | 4/5 | Nuxt SSR/SSG performant ; Pinia très efficace pour la réactivité |
| Modèle relationnel | 5/5 | Même PostgreSQL Supabase que Stack A — avantage identique |
| Intégration API tierces | 5/5 | Nuxt Server Routes pour proxy OAuth ; Supabase Edge Functions pour webhooks |
| Écosystème | 4/5 | Nuxt UI riche, mais moins de composants dashboard spécialisés que shadcn/ui React |
| Déploiement & coût | 4/5 | Vercel/Netlify + Supabase Free — identique Stack A |
| Maintenabilité | 4/5 | `supabase gen types` compatible ; conventions Nuxt stables depuis v3 |
| Développement solo | 4/5 | Auto-imports réduisent le boilerplate ; moins de ressources dashboard que React |

**Score global : 4.3/5**

#### Avantages
- Vue.js Composition API = réactivité élégante pour le curseur sport → recalcul
- Nuxt UI fournit des composants de qualité (Table, Form, Select, Slider)
- Même infrastructure Supabase que Stack A : PostgreSQL, types auto-générés
- Pinia = gestion d'état plus structurée que Zustand pour des apps Vue

#### Inconvénients
- Moins de composants dashboard prêts-à-l'emploi qu'en React (charts Vue moins matures)
- Communauté plus petite → moins d'exemples de dashboards complexes
- Nuxt 4 est récent (2025) : quelques risques de stabilité API
- Si besoin de contributeurs futurs, React plus universel

#### Bibliothèques recommandées

| Besoin | Librairie |
|--------|-----------|
| Charts | Vue-ChartJS ou ApexCharts Vue |
| Tables | Nuxt UI Table + TanStack Table Vue |
| Formulaires | VeeValidate + Zod |
| State | Pinia |
| Dates | date-fns |
| UI | Nuxt UI |

---

### Tableau de synthèse

| Critère | Stack A (Next+Supabase) | Stack B (Next+SQLite) | Stack C (SvelteKit) | Stack D (Nuxt+Supabase) |
|---------|------------------------|----------------------|---------------------|------------------------|
| Developer Experience | 4/5 | 5/5 | 4/5 | 4/5 |
| Performance UI | 5/5 | 5/5 | 5/5 | 4/5 |
| Modèle relationnel | **5/5** | 4/5 | 3/5 | **5/5** |
| Intégration API tierces | **5/5** | 3/5 | 3/5 | **5/5** |
| Écosystème | **5/5** | **5/5** | 3/5 | 4/5 |
| Déploiement & coût | 4/5 | **5/5** | 4/5 | 4/5 |
| Maintenabilité | **5/5** | 4/5 | 3/5 | 4/5 |
| Développement solo | 4/5 | **5/5** | 4/5 | 4/5 |
| **Score global** | **4.4/5** | **4.1/5** | **3.9/5** | **4.3/5** |

---

## 4. Recommandation finale

### Stack A : Next.js 15 + Supabase + Tailwind CSS + shadcn/ui

#### Justification par rapport aux exigences du PRD

**PostgreSQL (via Supabase) = seule base de données pleinement adaptée au modèle du PRD**

Le Tableau 2 (Recettes) stocke `ingredients` en JSON avec la structure `{nom, grammes, rayon_drive}`. PostgreSQL fournit les opérateurs `->`, `->>`, `jsonb_array_elements` permettant de décomposer ces ingrédients et de les consolider hebdomadairement en une seule requête SQL. SQLite peut le faire mais avec moins de puissance ; PocketBase abstrait trop cette logique.

```sql
-- Exemple : consolidation des ingrédients de la semaine
SELECT
  ingredient->>'nom' AS nom,
  SUM((ingredient->>'grammes')::numeric) AS total_grammes
FROM planificateur_hebdo ph
JOIN recettes r ON r.id = ph.repas_id
CROSS JOIN jsonb_array_elements(r.ingredients) AS ingredient
WHERE ph.date BETWEEN '2026-02-24' AND '2026-03-02'
GROUP BY ingredient->>'nom';
```

**Supabase Free Tier = $0/mois avec infrastructure production-ready**

- 500 MB de stockage PostgreSQL (suffisant pour des années d'usage personnel)
- Auth intégrée (si extension famille en V2)
- Pas de "pause" sur inactivité contrairement à certains concurrents
- Backups automatiques quotidiens
- Dashboard Supabase pour explorer les données sans outil externe

**shadcn/ui = composants dashboard exactement nécessaires**

Les 3 composants clés du PRD sont disponibles nativement :
- `Slider` → curseur calories Sport avec callback en temps réel
- `DataTable` (TanStack Table intégré) → liste de courses avec filtre "J'ai déjà"
- `Form` (React Hook Form + Zod) → saisie profil utilisateur avec validation TypeScript

**Next.js Server Actions = architecture V1 sans API layer**

```typescript
// Recalcul de la collation sans API Route séparée
'use server'
async function updateCollation(sportKcal: number, userId: string) {
  const profil = await supabase.from('profil').select('objectif_kcal').single()
  const deficitKcal = profil.objectif_kcal - REPAS_FIXES_KCAL - sportKcal
  // Sélection collation adaptée selon impact_macro du sport
}
```

**Supabase Edge Functions = infrastructure prête pour V2 et V3**

- V2 Suunto : endpoint webhook `/functions/v1/suunto-sync` reçoit les activités OAuth, met à jour le Tableau 4 automatiquement
- V3 Drive : `/functions/v1/drive-basket` mappe les ingrédients consolidés vers le catalogue Intermarché

**Types TypeScript auto-générés**

```bash
supabase gen types typescript --project-id <id> > types/database.ts
```

Toutes les tables, colonnes et relations sont typées — zéro drift entre la DB et le code TypeScript.

#### Comparaison finale avec Stack D (challenger)

Stack D (Nuxt + Supabase) offre le même avantage PostgreSQL mais perd sur :
- L'écosystème de composants dashboard (moins de charts Vue maturs vs Recharts)
- La taille de la communauté et des exemples de référence
- La stabilité de Nuxt 4 (sorti en 2025, moins de recul)

#### Option budget $0 absolu

Si le budget est strictement nul y compris en production, **Stack B** est recommandée pour la V1, avec migration planifiée vers Supabase avant la V2 (Suunto OAuth nécessite une adresse publique stable).

---

## 5. Architecture technique recommandée

```
Next.js 15 (App Router + Server Actions)
├── app/
│   ├── layout.tsx                    → Layout global + providers
│   ├── page.tsx                      → Dashboard principal
│   ├── profil/page.tsx               → Saisie profil + calcul TMB
│   ├── planificateur/page.tsx        → Vue semaine + curseur sport
│   ├── recettes/page.tsx             → Bibliothèque recettes + filtres
│   └── courses/page.tsx              → Liste consolidée + "J'ai déjà"
│
├── components/
│   ├── dashboard/
│   │   ├── CalorieSlider.tsx         → Curseur sport → recalcul collation
│   │   ├── MacroChart.tsx            → Recharts : répartition macros
│   │   └── WeekCalendar.tsx          → Planificateur hebdomadaire
│   ├── courses/
│   │   ├── CoursesTable.tsx          → TanStack Table + bouton "J'ai déjà"
│   │   └── ArrondiLogique.tsx        → Calcul unités Drive
│   └── ui/                           → Composants shadcn/ui (copie locale)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 → Client Supabase browser
│   │   └── server.ts                 → Client Supabase Server Actions
│   ├── physiologie/
│   │   ├── tmb.ts                    → Calcul TMB (Harris-Benedict)
│   │   ├── macros.ts                 → Répartition macros selon sport
│   │   └── collation.ts             → Sélection collation optimale
│   └── courses/
│       └── consolidation.ts          → Somme ingrédients + arrondi Drive
│
├── actions/
│   ├── profil.ts                     → Server Actions CRUD profil
│   ├── planificateur.ts              → Ajout/modif séance sport + repas
│   └── courses.ts                    → Toggle "J'ai déjà"
│
├── types/
│   └── database.ts                   → Auto-généré : supabase gen types
│
└── supabase/
    ├── migrations/
    │   ├── 001_init_schema.sql       → 4 tables + FK + RLS
    │   └── 002_seed_recettes.sql     → Recettes initiales
    └── functions/
        ├── suunto-sync/              → V2 : webhook activités Suunto
        └── drive-basket/             → V3 : remplissage panier Drive
```

### Schéma de base de données

```sql
-- Table 1 : Profil Utilisateur
CREATE TABLE profil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poids NUMERIC(5,2) NOT NULL,
  taille INTEGER NOT NULL,
  age INTEGER NOT NULL,
  sexe TEXT CHECK (sexe IN ('homme', 'femme')) NOT NULL,
  objectif_kcal INTEGER GENERATED ALWAYS AS (
    -- Calculé côté app et stocké lors de la mise à jour profil
    objectif_kcal
  ) STORED,
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2 : Bibliothèque de Recettes
CREATE TABLE recettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_recette TEXT NOT NULL,
  type_repas TEXT CHECK (type_repas IN ('matin', 'midi', 'soir', 'collation')) NOT NULL,
  ingredients JSONB NOT NULL,  -- [{nom, grammes, rayon_drive}]
  calories_100g NUMERIC(6,2) NOT NULL,
  temps_prepa INTEGER NOT NULL,
  is_recyclable BOOLEAN DEFAULT FALSE
);

-- Table 3 : Planificateur Hebdomadaire
CREATE TABLE planificateur_hebdo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  repas_id UUID REFERENCES recettes(id) ON DELETE SET NULL,
  sport_id UUID REFERENCES suivi_sportif(id) ON DELETE SET NULL,
  is_rest BOOLEAN DEFAULT FALSE,  -- Recyclage repas soir précédent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4 : Suivi Sportif
CREATE TABLE suivi_sportif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport TEXT CHECK (type_sport IN ('musculation', 'trail', 'running', 'etirements')) NOT NULL,
  duree INTEGER NOT NULL,
  kcal_brulees INTEGER NOT NULL,
  impact_macro TEXT CHECK (impact_macro IN ('glucides', 'proteines')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (sécurité mono-utilisateur)
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE recettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planificateur_hebdo ENABLE ROW LEVEL SECURITY;
ALTER TABLE suivi_sportif ENABLE ROW LEVEL SECURITY;
```

### Flux de données : curseur sport → recalcul collation

```
Utilisateur déplace le curseur (sportKcal)
        ↓
CalorieSlider.tsx (Client Component)
        ↓ onChange → Zustand store
        ↓
useCollation(sportKcal) [TanStack Query]
        ↓ invalide le cache
        ↓
Server Action : calcCollation(sportKcal)
        ↓
PostgreSQL : SELECT recettes WHERE type_repas = 'collation'
             AND impact_macro = (sport actif).impact_macro
             ORDER BY |calories - deficit| ASC LIMIT 1
        ↓
Retour : {recette, quantite_g}
        ↓
MacroChart.tsx re-render avec nouvelles valeurs
```

---

## 6. Coût estimé

| Phase | Infrastructure | Coût mensuel |
|-------|---------------|-------------|
| Développement / MVP | Vercel Hobby (gratuit) + Supabase Free (500MB) | **$0** |
| Production personnelle (usage solo) | Idem | **$0** |
| Production famille proche (< 5 users) | Idem — Free tier très confortable | **$0** |
| Si stockage > 500MB ou backups avancés | Supabase Pro ($25/mois) | **$25/mois** |
| Si trafic élevé ou domaine custom | Vercel Pro ($20/mois) + Supabase Pro | **$45/mois** |

**Note** : Pour un usage personnel avec données nutritionnelles typiques (quelques centaines de recettes, 1-2 ans de planificateur), le Free tier Supabase est largement suffisant. La migration vers Pro ne sera nécessaire que si l'app est partagée avec plusieurs membres de la famille.

---

## 7. Bibliothèques clés retenues

| Besoin | Librairie | Version cible | Justification détaillée |
|--------|-----------|--------------|------------------------|
| Charts | **Recharts** | ^2.12 | SVG natif, composants déclaratifs React, animations CSS, bundle < 100KB gzip, API simple pour line/bar/pie charts |
| Tables | **TanStack Table** | ^8.x | Headless (apporte uniquement la logique), tri multi-colonnes, filtres, pagination — intégré nativement dans shadcn data-table |
| Formulaires | **React Hook Form** | ^7.x | Zéro re-render sur frappe, mode non-contrôlé performant, intégration Zod native via `@hookform/resolvers` |
| Validation | **Zod** | ^3.x | Schémas TypeScript-first, validation runtime des données Supabase et des formulaires, inférence de types automatique |
| State serveur | **TanStack Query** | ^5.x | Cache intelligent, invalidation après mutation Server Action, synchronisation automatique, DevTools intégrés |
| State client | **Zustand** | ^4.x | < 1KB, parfait pour l'état du curseur sport et les préférences de filtre sans over-engineering Redux |
| Dates | **date-fns** | ^3.x | Tree-shakeable (seules les fonctions importées sont bundlées), 200+ utilitaires, immutable, locale FR incluse |
| UI Components | **shadcn/ui** | latest | Copy-paste dans le projet (ownership total), Radix UI sous le capot (accessibilité WCAG), Tailwind natif, Slider + DataTable + Form disponibles |
| Styles | **Tailwind CSS** | ^3.4 | Utility-first, responsive trivial, dark mode natif, compatible shadcn/ui |
| Linting/Format | **Biome** | ^1.x | Remplace ESLint + Prettier en un seul outil, 10x plus rapide, configuration minimale |

---

## Vérification des exigences

| Exigence PRD | Couverture Stack A |
|-------------|-------------------|
| Modèle relationnel 4 tables + FK | PostgreSQL Supabase — FK avec CASCADE, contraintes CHECK |
| Champ JSON ingrédients | JSONB PostgreSQL avec opérateurs natifs |
| Calcul TMB + macros | Fonctions TypeScript pures dans `lib/physiologie/` |
| Curseur sport → recalcul collation | Zustand (état) + TanStack Query (invalidation) + Server Action |
| Filtre recettes < N minutes | WHERE temps_prepa <= N, index sur la colonne |
| Bouton "J'ai déjà" | Toggle boolean en Server Action + invalidation cache |
| Arrondi unité de vente (Drive) | Fonction `consolidation.ts` : Math.ceil(total / unite_vente) |
| V2 : OAuth Suunto + webhooks | Supabase Edge Functions + API Route proxy OAuth |
| V3 : REST Drive Intermarché | API Route `/api/drive` + mapping catalogue |
| Usage solo (sécurité) | Supabase RLS (Row Level Security) par user_id |
| Web-first responsive | Tailwind CSS breakpoints natifs |
| Budget $0 en développement | Vercel Hobby + Supabase Free |
| Longévité 3+ ans | Next.js (React) + PostgreSQL = standards industrie stables |

---

*Rapport généré le 24 février 2026 — À réviser si la roadmap V2/V3 évolue significativement.*
