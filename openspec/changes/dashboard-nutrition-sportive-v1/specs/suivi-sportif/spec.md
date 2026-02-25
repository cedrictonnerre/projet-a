## ADDED Requirements

### Requirement: Saisie manuelle d'une séance sportive
Le système SHALL permettre de créer une séance sportive avec : type (`musculation`, `trail`, `running`, `étirements`), durée (minutes) et calories brûlées (saisie manuelle en V1).

#### Scenario: Création d'une séance de musculation
- **WHEN** l'utilisateur saisit type=`musculation`, durée=60min, kcal=350 et soumet
- **THEN** la séance est persistée dans `suivi_sportif` avec `impact_macro = 'proteines'` (mapping automatique)

#### Scenario: Création d'une séance de trail
- **WHEN** l'utilisateur saisit type=`trail`, durée=90min, kcal=600 et soumet
- **THEN** la séance est persistée avec `impact_macro = 'glucides'`

#### Scenario: Validation des champs requis
- **WHEN** l'utilisateur soumet le formulaire avec une durée nulle ou négative
- **THEN** le système affiche une erreur de validation et bloque la soumission

### Requirement: Mapping automatique sport → impact_macro
Le système SHALL assigner automatiquement `impact_macro` selon le type de sport : `musculation` → `proteines`, `trail` → `glucides`, `running` → `glucides`, `etirements` → `glucides`.

#### Scenario: Mapping musculation → protéines
- **WHEN** une séance de type `musculation` est créée
- **THEN** `impact_macro = 'proteines'` est automatiquement assigné

#### Scenario: Mapping sports cardio → glucides
- **WHEN** une séance de type `trail`, `running` ou `etirements` est créée
- **THEN** `impact_macro = 'glucides'` est automatiquement assigné

### Requirement: Association séance-jour dans le planificateur
Le système SHALL permettre d'associer une séance sportive à une journée dans le planificateur via `planificateur_hebdo.sport_id`.

#### Scenario: Liaison séance au planificateur
- **WHEN** l'utilisateur associe une séance à un jour du planificateur
- **THEN** `planificateur_hebdo.sport_id` référence l'UUID de la séance et le curseur sport est pré-rempli avec `kcal_brulees` de la séance
