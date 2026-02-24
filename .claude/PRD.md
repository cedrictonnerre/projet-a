

Voici le récapitulatif complet de votre projet au format **Markdown**.

---

# Spécifications Projet : Dashboard Nutrition & Sport Connecté (V1)

## 📌 Vision du Projet

Un dashboard personnel modulaire permettant de gérer la nutrition en fonction de l'activité physique réelle. L'outil doit automatiser la planification des repas, la gestion des courses et l'ajustement calorique via une variable spécifique : **la collation**.

---

## 🛠 Architecture du MVP (V1)

### 1. Le "Moteur" Physiologique

* **Données Entrées :** Poids, Taille, Âge, Sexe.
* **Calcul :** Détermination du Métabolisme de Base (TMB) + Objectif (Perte/Maintien/Prise de masse).
* **Variable d'Ajustement :** Un curseur de calories "Sport" (saisie manuelle en V1, simulant la future connexion **Suunto**).

### 2. Gestion des Repas

* **Repas Piliers :** Le déjeuner et le dîner sont fixes pour la semaine afin de garantir la stabilité de l'organisation.
* **La Collation Dynamique :** C'est le curseur d'ajustement. Si une séance de sport est ajoutée, seule la quantité ou le type de collation change pour atteindre l'objectif calorique du jour.
* **Règle du Recyclage :** Possibilité de marquer un plat du "Soir J" pour être consommé au "Midi J+1" (multiplication des ingrédients par 2 automatiquement).
* **Filtres temporels :** Sélection de recettes selon le temps disponible (ex: <15 min).

### 3. Logistique & Courses

* **Unification :** Toutes les quantités sont gérées en **grammes**.
* **Consolidation :** Somme automatique des ingrédients identiques sur la semaine.
* **Bouton "J'ai déjà" :** Permet de soustraire un ingrédient de la liste de courses.
* **Arrondi Sécurité :** Pour le futur lien Drive, l'appli arrondit à l'unité de vente supérieure (ex: besoin 450g, achat 1 barquette de 500g).

---

## 📊 Structure des Bases de Données (Tableaux)

### Tableau 1 : Profil Utilisateur

| Champ | Type | Description |
| --- | --- | --- |
| `poids` | Number | Poids actuel en kg |
| `taille` | Number | Taille en cm |
| `age` | Number | Âge |
| `sexe` | Enum | Homme / Femme |
| `objectif_kcal` | Number | Calculé (TMB +/- objectif) |
| `allergies` | List | Ingrédients à exclure |

### Tableau 2 : Bibliothèque de Recettes

| Champ | Type | Description |
| --- | --- | --- |
| `nom_recette` | String | Nom du plat |
| `type_repas` | Enum | Matin, Midi, Soir, Collation |
| `ingredients` | JSON | Liste {nom, grammes, rayon_drive} |
| `calories_100g` | Number | Densité énergétique |
| `temps_prepa` | Number | Temps en minutes |
| `is_recyclable` | Boolean | Supporte le réchauffage |

### Tableau 3 : Planificateur Hebdo

| Champ | Type | Description |
| --- | --- | --- |
| `date` | Date | Jour de la semaine |
| `repas_id` | Relation | Lien vers Tableau 2 |
| `sport_id` | Relation | Lien vers Tableau 4 |
| `is_rest` | Boolean | Si coché, repas = reste du soir précédent |

### Tableau 4 : Suivi Sportif

| Champ | Type | Description |
| --- | --- | --- |
| `type_sport` | Enum | Musculation, Trail, Running, Étirements |
| `duree` | Number | En minutes |
| `kcal_brulees` | Number | Saisie manuelle (V1) / Suunto (V2) |
| `impact_macro` | Enum | Glucides (Trail/Run) ou Protéines (Muscu) |

---

## 🚀 Roadmap Évolutive

* **V1 (MVP) :** Saisie manuelle du sport, calcul des menus, liste de courses consolidée avec bouton "J'ai déjà".
* **V2 (Automation) :** Connexion API **Suunto**, gestion de l'inventaire permanent (placards), export de la liste de courses.
* **V3 (Drive) :** Mapping automatique avec le catalogue **Intermarché Drive** et remplissage du panier automatique.

---

## 🧠 Logique de Codage pour l'Agent IA

> "Lors de la génération du menu, si une séance de sport est détectée dans le Tableau 4, calcule le déficit calorique restant après les repas fixes. Propose une collation du Tableau 2 dont le `impact_macro` correspond au `type_sport` et ajuste la `quantité` pour combler exactement le déficit."

---

### Prochaine étape suggérée

Vous pouvez copier ce texte dans un fichier `PRD.md` (Product Requirements Document) et le donner à votre agent IA. Voulez-vous que je développe davantage la partie **"Algorithme d'arrondi pour le Drive"** ou la **"Logique de filtrage des allergènes"** avant que vous ne commenciez ?