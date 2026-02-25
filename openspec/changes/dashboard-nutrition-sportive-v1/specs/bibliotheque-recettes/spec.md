## ADDED Requirements

### Requirement: Création et modification de recettes
Le système SHALL permettre de créer, modifier et supprimer des recettes avec les champs : nom, type de repas (`matin`, `midi`, `soir`, `collation`), ingrédients (liste JSON `{nom, grammes, rayon_drive}`), calories pour 100g, temps de préparation (minutes) et flag recyclable.

#### Scenario: Création d'une recette valide
- **WHEN** l'utilisateur soumet le formulaire recette avec tous les champs requis
- **THEN** la recette est persistée dans la table `recettes` avec ses ingrédients en JSONB

#### Scenario: Validation des ingrédients
- **WHEN** l'utilisateur ajoute un ingrédient sans nom ou avec des grammes négatifs
- **THEN** le système affiche une erreur Zod et bloque la soumission

#### Scenario: Suppression d'une recette utilisée dans le planificateur
- **WHEN** l'utilisateur supprime une recette référencée dans `planificateur_hebdo`
- **THEN** la FK `ON DELETE SET NULL` met à `NULL` le `repas_id` des entrées concernées

### Requirement: Filtrage de la bibliothèque de recettes
Le système SHALL permettre de filtrer les recettes par type de repas et par temps de préparation maximum.

#### Scenario: Filtre par type de repas
- **WHEN** l'utilisateur sélectionne le filtre "Collation"
- **THEN** seules les recettes avec `type_repas = 'collation'` sont affichées

#### Scenario: Filtre par temps de préparation
- **WHEN** l'utilisateur active le filtre "moins de 15 min"
- **THEN** seules les recettes avec `temps_prepa <= 15` sont affichées

#### Scenario: Combinaison de filtres
- **WHEN** l'utilisateur filtre "Midi" ET "moins de 30 min"
- **THEN** seules les recettes avec `type_repas = 'midi'` ET `temps_prepa <= 30` sont affichées

### Requirement: Marquage recyclable
Le système SHALL permettre de marquer une recette `is_recyclable = TRUE` pour indiquer qu'elle supporte le réchauffage (utilisée par la règle recyclage du planificateur).

#### Scenario: Affichage du badge recyclable
- **WHEN** une recette a `is_recyclable = TRUE`
- **THEN** un badge visuel "Recyclable" est affiché sur la carte de la recette dans la bibliothèque

### Requirement: Calcul des calories totales d'une recette
Le système SHALL calculer et afficher les calories totales d'une recette à partir de `calories_100g` et de la somme des grammes des ingrédients.

#### Scenario: Calcul correct des kcal totales
- **WHEN** une recette a `calories_100g = 150` et `SUM(ingredients.grammes) = 300g`
- **THEN** les kcal totales affichées sont `150 × 300 / 100 = 450 kcal`
