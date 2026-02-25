## ADDED Requirements

### Requirement: Consolidation des ingrédients de la semaine
Le système SHALL agréger tous les ingrédients JSONB des recettes planifiées sur la semaine affichée, groupés par `nom` et `rayon_drive`, en appliquant un coefficient ×2 pour les jours avec `is_rest = TRUE`.

#### Scenario: Agrégation simple sans recyclage
- **WHEN** la semaine contient 2 recettes utilisant chacune 100g de "poulet" (`rayon_drive = 'Viandes'`) sans `is_rest`
- **THEN** la liste affiche "poulet — 200g — Viandes"

#### Scenario: Agrégation avec recyclage (×2)
- **WHEN** une recette du soir contient 150g de "pâtes" et le lendemain midi est marqué `is_rest = TRUE`
- **THEN** les "pâtes" sont comptées 150g (soir) + 300g (recyclage ×2) = **450g** dans la consolidation

#### Scenario: Groupement par rayon Drive
- **WHEN** plusieurs ingrédients ont le même `rayon_drive`
- **THEN** la liste de courses est triée et groupée par rayon (`Légumes`, `Viandes`, `Épicerie`…) pour faciliter le parcours en magasin

### Requirement: Bouton "J'ai déjà"
Le système SHALL afficher un toggle par ligne d'ingrédient permettant de marquer les articles déjà disponibles à domicile, ce qui les barre visuellement et les exclut du total sans les supprimer.

#### Scenario: Marquage d'un ingrédient comme disponible
- **WHEN** l'utilisateur clique sur "J'ai déjà" pour "poulet — 200g"
- **THEN** la ligne est barrée et grisée, et l'ingrédient n'est plus comptabilisé dans le résumé "À acheter"

#### Scenario: Démarquage d'un ingrédient
- **WHEN** l'utilisateur reclique sur un ingrédient déjà marqué "J'ai déjà"
- **THEN** l'ingrédient redevient actif et est réintégré dans la liste "À acheter"

#### Scenario: Persistance du marquage
- **WHEN** l'utilisateur recharge la page
- **THEN** les marquages "J'ai déjà" de la semaine courante sont conservés (persistés en base ou en localStorage)

### Requirement: Affichage de la liste par semaine
Le système SHALL afficher la liste de courses pour la semaine du planificateur sélectionné, avec un sélecteur de semaine cohérent avec celui du planificateur.

#### Scenario: Synchronisation avec le planificateur
- **WHEN** l'utilisateur navigue vers la semaine S+1 dans le planificateur
- **THEN** la liste de courses affiche les ingrédients de la semaine S+1

#### Scenario: Liste vide
- **WHEN** aucune recette n'est planifiée pour la semaine sélectionnée
- **THEN** le système affiche un message "Aucune recette planifiée pour cette semaine" avec un lien vers le planificateur
