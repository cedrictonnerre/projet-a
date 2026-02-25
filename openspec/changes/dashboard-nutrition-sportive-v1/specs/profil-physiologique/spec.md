## ADDED Requirements

### Requirement: Saisie du profil utilisateur
Le système SHALL permettre de saisir et de modifier les données physiologiques de l'utilisateur : poids (kg), taille (cm), âge, sexe (homme/femme), niveau d'activité et objectif nutritionnel.

#### Scenario: Saisie initiale du profil
- **WHEN** l'utilisateur soumet le formulaire profil avec des données valides
- **THEN** le système persiste les données dans la table `profil` via une Server Action et affiche l'`objectif_kcal` calculé

#### Scenario: Validation des champs obligatoires
- **WHEN** l'utilisateur soumet le formulaire avec un champ manquant ou invalide (ex: poids négatif)
- **THEN** le système affiche un message d'erreur Zod sous le champ concerné et bloque la soumission

### Requirement: Calcul automatique de l'objectif calorique via Mifflin-St Jeor
Le système SHALL calculer l'`objectif_kcal` selon la formule Mifflin-St Jeor : TMB = (10 × poids) + (6.25 × taille) − (5 × âge) + 5 (homme) ou − 161 (femme), puis multiplier par le PAL du niveau d'activité et ajouter le surplus/déficit selon l'objectif.

#### Scenario: Calcul pour un homme très actif en prise de muscle
- **WHEN** un profil homme, 80 kg, 180 cm, 30 ans, niveau `tres_actif` (PAL 1.725), objectif `prise_muscle` (+250 kcal) est sauvegardé
- **THEN** l'`objectif_kcal` stocké est : TMB = (10×80)+(6.25×180)−(5×30)+5 = 1880, TDEE = round(1880×1.725) = 3243, objectif = 3243+250 = **3493 kcal**

#### Scenario: Calcul pour une femme en perte de poids
- **WHEN** un profil femme, 65 kg, 165 cm, 28 ans, niveau `modere` (PAL 1.55), objectif `perte_poids` (−500 kcal) est sauvegardé
- **THEN** l'`objectif_kcal` stocké est : TMB = (10×65)+(6.25×165)−(5×28)−161 = 1470.25, TDEE = round(1470.25×1.55) = 2279, objectif = 2279−500 = **1779 kcal**

#### Scenario: Recalcul automatique après modification du profil
- **WHEN** l'utilisateur modifie son poids et sauvegarde
- **THEN** le système recalcule et met à jour `objectif_kcal` dans la table `profil`

### Requirement: Gestion des allergènes
Le système SHALL permettre de déclarer une liste d'ingrédients à exclure stockée dans `profil.allergies` (tableau TEXT[]).

#### Scenario: Ajout d'un allergène
- **WHEN** l'utilisateur ajoute "gluten" à sa liste d'allergènes et sauvegarde
- **THEN** `profil.allergies` contient `["gluten"]` et les recettes contenant "gluten" dans leurs ingrédients sont marquées visuellement dans la bibliothèque
