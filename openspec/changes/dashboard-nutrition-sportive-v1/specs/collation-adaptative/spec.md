## ADDED Requirements

### Requirement: Curseur calories sport en temps réel
Le système SHALL afficher un curseur (Slider shadcn/ui) permettant de saisir les calories brûlées lors d'une séance sportive, avec mise à jour de l'état Zustand en temps réel et invalidation du cache TanStack Query uniquement en fin de glissement (`onChangeEnd`).

#### Scenario: Déplacement du curseur
- **WHEN** l'utilisateur déplace le curseur sport à 400 kcal
- **THEN** l'état Zustand `sportKcal` est mis à jour à 400 et l'affichage du déficit résiduel se met à jour en temps réel

#### Scenario: Fin du glissement → recalcul serveur
- **WHEN** l'utilisateur relâche le curseur à 400 kcal
- **THEN** TanStack Query invalide le cache de la collation et déclenche la Server Action `calcCollation(400)`

### Requirement: Calcul du déficit calorique résiduel
Le système SHALL calculer le déficit calorique résiduel après les repas fixes selon la formule : `deficit = objectif_kcal - kcal_repas_fixes + sportKcal`.

#### Scenario: Calcul du déficit avec sport
- **WHEN** `objectif_kcal = 3000`, kcal des repas fixes (matin+midi+soir) = 2200, `sportKcal = 400`
- **THEN** `deficit = 3000 - 2200 + 400 = 1200 kcal` alloués à la collation

#### Scenario: Calcul du déficit sans sport
- **WHEN** `objectif_kcal = 2500`, kcal repas fixes = 2100, `sportKcal = 0`
- **THEN** `deficit = 2500 - 2100 + 0 = 400 kcal`

### Requirement: Sélection automatique de la collation optimale
Le système SHALL sélectionner la recette de type `collation` dont `impact_macro` correspond au sport actif du jour et dont les calories ajustées sont les plus proches du déficit, et calculer la quantité en grammes : `quantite_g = ROUND((deficit / calories_100g) × 100)`.

#### Scenario: Collation protéinée après musculation
- **WHEN** le sport actif est `musculation` (`impact_macro = 'proteines'`) et le déficit est 400 kcal
- **THEN** le système sélectionne la collation de type `collation` avec `impact_macro = 'proteines'` minimisant `|calories_collation_pour_quantite - deficit|`

#### Scenario: Collation glucidique après running
- **WHEN** le sport actif est `running` (`impact_macro = 'glucides'`) et le déficit est 600 kcal
- **THEN** le système sélectionne une collation `impact_macro = 'glucides'`

#### Scenario: Calcul de la quantité
- **WHEN** la collation sélectionnée a `calories_100g = 200` et le déficit est 400 kcal
- **THEN** `quantite_g = ROUND((400 / 200) × 100) = 200g` est affiché

#### Scenario: Aucune collation disponible
- **WHEN** aucune recette de type `collation` avec le bon `impact_macro` n'existe
- **THEN** le système affiche un message invitant à ajouter des collations dans la bibliothèque

### Requirement: Affichage des macros du jour
Le système SHALL afficher la répartition glucides/protéines/lipides du jour sous forme de graphique Recharts (PieChart ou BarChart) mis à jour après chaque recalcul de collation.

#### Scenario: Mise à jour du graphique après recalcul
- **WHEN** la collation est recalculée suite au déplacement du curseur
- **THEN** le graphique MacroChart se re-rend avec les nouvelles valeurs de macros totales
