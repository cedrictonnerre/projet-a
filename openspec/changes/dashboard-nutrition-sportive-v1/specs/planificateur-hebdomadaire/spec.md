## ADDED Requirements

### Requirement: Grille hebdomadaire des repas
Le système SHALL afficher une grille semaine (7 colonnes, 4 lignes : Matin/Midi/Soir/Collation) permettant d'affecter une recette à chaque slot en sélectionnant dans la bibliothèque filtrée par `type_repas`.

#### Scenario: Affectation d'une recette à un slot
- **WHEN** l'utilisateur clique sur le slot "Lundi - Midi" et sélectionne une recette
- **THEN** `planificateur_hebdo` est mis à jour avec `date = lundi`, `repas_id = UUID recette`, `is_rest = FALSE`

#### Scenario: Affichage de la semaine courante par défaut
- **WHEN** l'utilisateur ouvre la page planificateur
- **THEN** la grille affiche la semaine courante (lundi au dimanche) avec les repas déjà planifiés

#### Scenario: Navigation vers les semaines précédentes/suivantes
- **WHEN** l'utilisateur clique sur la flèche "semaine suivante"
- **THEN** la grille se déplace d'une semaine et charge les données correspondantes

### Requirement: Règle de recyclage repas (J → J+1)
Le système SHALL permettre de marquer un slot midi comme recyclage du repas soir du jour précédent (`is_rest = TRUE`), ce qui affiche la recette du soir J-1 au midi J et double les quantités dans la liste de courses.

#### Scenario: Activation du recyclage
- **WHEN** l'utilisateur active le toggle "Restes" sur le slot "Mardi - Midi"
- **THEN** `planificateur_hebdo.is_rest = TRUE` pour ce slot, la recette du soir Lundi est affichée, et les ingrédients de cette recette seront comptés ×2 dans la consolidation courses

#### Scenario: Recyclage sans repas soir J-1
- **WHEN** l'utilisateur active le recyclage pour "Lundi - Midi" mais aucune recette "Dimanche - Soir" n'existe
- **THEN** le système affiche un avertissement "Aucun repas du soir précédent à recycler"

#### Scenario: Calcul calorique du midi recyclé
- **WHEN** `is_rest = TRUE` sur un slot midi
- **THEN** les calories affichées pour ce slot correspondent à la recette du soir J-1 (pas de duplication des kcal, seulement des quantités d'ingrédients)

### Requirement: Résumé calorique journalier
Le système SHALL afficher pour chaque journée du planificateur le total de kcal planifiées (somme des repas affectés + collation calculée) comparé à l'`objectif_kcal` du profil.

#### Scenario: Affichage du bilan calorique
- **WHEN** 3 repas et une collation sont planifiés pour un jour
- **THEN** le total kcal du jour est affiché avec un indicateur visuel (vert si ±5% de l'objectif, orange sinon)
