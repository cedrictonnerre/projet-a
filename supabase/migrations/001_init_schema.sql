-- =============================================================
-- Migration 001 : Schéma initial — Dashboard Nutrition & Sport
-- =============================================================

-- ============================================================
-- TABLE 1 : Profil Utilisateur
-- ============================================================
CREATE TABLE IF NOT EXISTS profil (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  poids            NUMERIC(5,2) NOT NULL,                        -- kg
  taille           INTEGER      NOT NULL,                        -- cm
  age              INTEGER      NOT NULL,
  sexe             TEXT         NOT NULL CHECK (sexe IN ('homme', 'femme')),
  niveau_activite  TEXT         NOT NULL DEFAULT 'tres_actif'
                   CHECK (niveau_activite IN ('sedentaire','leger','modere','tres_actif','extreme')),
  objectif         TEXT         NOT NULL DEFAULT 'prise_muscle'
                   CHECK (objectif IN ('perte_poids','maintien','prise_muscle')),
  objectif_kcal    INTEGER      NOT NULL,  -- Calculé par l'app, stocké après chaque maj profil
  allergies        TEXT[]       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Trigger : mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profil_updated_at
  BEFORE UPDATE ON profil
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE 2 : Bibliothèque de Recettes
-- ============================================================
CREATE TABLE IF NOT EXISTS recettes (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_recette     TEXT         NOT NULL,
  type_repas      TEXT         NOT NULL
                  CHECK (type_repas IN ('matin','midi','soir','collation')),
  ingredients     JSONB        NOT NULL,   -- [{nom, grammes, rayon_drive}]
  calories_100g   NUMERIC(6,2) NOT NULL,
  temps_prepa     INTEGER      NOT NULL,   -- minutes
  is_recyclable   BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_recettes_type_repas   ON recettes (type_repas);
CREATE INDEX IF NOT EXISTS idx_recettes_temps_prepa  ON recettes (temps_prepa);

-- ============================================================
-- TABLE 4 : Suivi Sportif (avant planificateur pour la FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS suivi_sportif (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport    TEXT         NOT NULL
                CHECK (type_sport IN ('musculation','trail','running','etirements')),
  duree         INTEGER      NOT NULL,   -- minutes
  kcal_brulees  INTEGER      NOT NULL,   -- saisie manuelle V1, Suunto V2
  impact_macro  TEXT         NOT NULL
                CHECK (impact_macro IN ('glucides','proteines')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 3 : Planificateur Hebdomadaire
-- ============================================================
CREATE TABLE IF NOT EXISTS planificateur_hebdo (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE        NOT NULL,
  repas_id   UUID        REFERENCES recettes(id)      ON DELETE SET NULL,
  sport_id   UUID        REFERENCES suivi_sportif(id) ON DELETE SET NULL,
  is_rest    BOOLEAN     NOT NULL DEFAULT FALSE,  -- TRUE = recyclage repas soir J-1
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planificateur_date ON planificateur_hebdo (date);
