## 1. Base de données — Migration SQL

- [x] 1.1 Créer `supabase/migrations/001_init_schema.sql` avec la table `profil` (id, poids, taille, age, sexe, niveau_activite, objectif, objectif_kcal, allergies, created_at, updated_at)
- [x] 1.2 Appliquer la migration via `supabase db push` (ou Dashboard Supabase)
- [x] 1.3 Générer les types TypeScript : `supabase gen types typescript --project-id <id> > src/types/database.ts`

## 2. Logique métier — Calcul physiologique

- [x] 2.1 Créer `src/lib/physiologie/tmb.ts` : implémenter la formule Mifflin-St Jeor (TMB homme et femme)
- [x] 2.2 Ajouter dans `tmb.ts` : calcul TDEE = TMB × PAL avec les 5 niveaux d'activité (sedentaire, leger, modere, tres_actif, extreme)
- [x] 2.3 Ajouter dans `tmb.ts` : calcul `objectif_kcal` = TDEE ± surplus selon l'objectif (perte_poids -500, maintien 0, prise_muscle +250)

## 3. Server Action — Persistance du profil

- [x] 3.1 Créer `src/lib/supabase/server.ts` : client Supabase serveur (SUPABASE_SERVICE_ROLE_KEY)
- [x] 3.2 Créer `src/actions/profil.ts` : définir le schéma Zod de validation du profil
- [x] 3.3 Implémenter dans `profil.ts` : Server Action `sauvegarderProfil` — valider, calculer objectif_kcal, upsert dans la table `profil` (id=1 fixe)
- [x] 3.4 Implémenter dans `profil.ts` : Server Action `lireProfil` — lecture du profil existant (retourne null si absent)

## 4. Interface utilisateur — Formulaire profil

- [x] 4.1 Créer `src/app/profil/page.tsx` (Server Component) : appeler `lireProfil` et passer les données au composant formulaire
- [x] 4.2 Créer `src/components/profil/ProfilForm.tsx` (Client Component) : formulaire React Hook Form avec champs poids, taille, âge, sexe, niveau_activite, objectif
- [x] 4.3 Brancher la validation Zod côté client dans `ProfilForm.tsx` (schéma partagé avec la Server Action)
- [x] 4.4 Afficher les messages d'erreur par champ dans le formulaire
- [x] 4.5 Afficher le récapitulatif (TMB, TDEE, objectif_kcal) après soumission réussie

## 5. Validation et tests

- [x] 5.1 Tester la Server Action `sauvegarderProfil` manuellement (cas nominal homme, cas nominal femme, cas erreur validation) — nécessite les credentials Supabase dans .env.local
- [x] 5.2 Tester la page `/profil` avec Playwright : formulaire vide, soumission valide, affichage récapitulatif, responsive mobile
