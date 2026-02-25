## ADDED Requirements

### Requirement: Saisie des données physiologiques
Le système SHALL permettre à l'utilisateur de saisir ses données physiologiques : poids (kg), taille (cm), âge (années), sexe (Homme/Femme), niveau d'activité physique et objectif nutritionnel.

#### Scenario: Affichage du formulaire vierge au premier accès
- **WHEN** l'utilisateur accède à `/profil` pour la première fois (aucun profil en base)
- **THEN** le formulaire s'affiche avec tous les champs vides et les valeurs par défaut des sélecteurs

#### Scenario: Affichage du formulaire pré-rempli si profil existant
- **WHEN** l'utilisateur accède à `/profil` et un profil existe déjà en base
- **THEN** le formulaire s'affiche avec les données sauvegardées pré-remplies

#### Scenario: Validation des champs obligatoires
- **WHEN** l'utilisateur soumet le formulaire avec des champs manquants ou invalides (ex: poids négatif)
- **THEN** des messages d'erreur s'affichent par champ, la soumission est bloquée

### Requirement: Calcul automatique de l'objectif calorique
Le système SHALL calculer automatiquement le TMB, le TDEE et l'`objectif_kcal` à chaque soumission du formulaire, selon la formule Mifflin-St Jeor et le niveau d'activité PAL sélectionné.

#### Scenario: Calcul TMB homme
- **WHEN** un utilisateur de sexe masculin soumet le profil avec poids=80kg, taille=180cm, âge=30
- **THEN** le TMB calculé est (10×80) + (6.25×180) - (5×30) + 5 = 1880 kcal

#### Scenario: Calcul TMB femme
- **WHEN** une utilisatrice de sexe féminin soumet le profil avec poids=65kg, taille=165cm, âge=28
- **THEN** le TMB calculé est (10×65) + (6.25×165) - (5×28) - 161 = 1420.25 kcal

#### Scenario: Application du PAL et de l'objectif
- **WHEN** l'utilisateur sélectionne le niveau "modéré" (PAL=1.55) et l'objectif "perte de poids"
- **THEN** l'`objectif_kcal` = TDEE - 500

### Requirement: Persistance du profil utilisateur
Le système SHALL persister le profil en base de données (table `profil`) via un upsert, de sorte qu'un seul enregistrement actif existe à tout moment en V1.

#### Scenario: Sauvegarde d'un nouveau profil
- **WHEN** l'utilisateur soumet le formulaire pour la première fois avec des données valides
- **THEN** un enregistrement est créé dans la table `profil` avec l'`objectif_kcal` calculé

#### Scenario: Mise à jour d'un profil existant
- **WHEN** l'utilisateur modifie son poids et soumet le formulaire
- **THEN** l'enregistrement existant est mis à jour (upsert), l'`objectif_kcal` est recalculé

### Requirement: Affichage du récapitulatif calorique
Le système SHALL afficher, après une soumission réussie, les valeurs calculées : TMB, TDEE et `objectif_kcal` journalier, afin que l'utilisateur puisse vérifier les résultats.

#### Scenario: Affichage post-soumission
- **WHEN** l'utilisateur soumet un profil valide
- **THEN** la page affiche un récapitulatif avec les trois valeurs (TMB, TDEE, objectif_kcal) en kcal
