CREATE TABLE IF NOT EXISTS public.agribalyse (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
  "Code AGB" TEXT,
  "Code CIQUAL" TEXT,
  "Groupe d'aliment" TEXT,
  "Sous-groupe d'aliment" TEXT,
  "Nom du Produit en Français" TEXT,
  "LCI Name" TEXT,
  "code saison" INTEGER,
  "code avion" INTEGER,
  "Livraison" TEXT,
  "Approche emballage" TEXT,
  "Préparation" TEXT,
  "DQR - Note de qualité de la donnée" DOUBLE PRECISION,
  "Score unique EF 3.1" DOUBLE PRECISION,
  "Changement climatique" DOUBLE PRECISION,
  "Appauvrissement de la couche d'ozone" DOUBLE PRECISION,
  "Rayonnements ionisants" DOUBLE PRECISION,
  "Formation photochimique d'ozone" DOUBLE PRECISION,
  "Particules fines" DOUBLE PRECISION,
  "Effets toxicologiques non-cancérogènes" DOUBLE PRECISION,
  "Effets toxicologiques substances cancérogènes" DOUBLE PRECISION,
  "Acidification terrestre et eaux douces" DOUBLE PRECISION,
  "Eutrophisation eaux douces" DOUBLE PRECISION,
  "Eutrophisation marine" DOUBLE PRECISION,
  "Eutrophisation terrestre" DOUBLE PRECISION,
  "Écotoxicité pour écosystèmes aquatiques d'eau douce" DOUBLE PRECISION,
  "Utilisation du sol" DOUBLE PRECISION,
  "Épuisement des ressources eau" DOUBLE PRECISION,
  "Épuisement des ressources énergétiques" DOUBLE PRECISION,
  "Épuisement des ressources minéraux" DOUBLE PRECISION,
  "Changement climatique - émissions biogéniques" DOUBLE PRECISION,
  "Changement climatique - émissions fossiles" DOUBLE PRECISION,
  "Changement climatique - liées à l'affectation des sols" DOUBLE PRECISION
);

ALTER TABLE "public"."agribalyse" OWNER TO "postgres";

ALTER TABLE "public"."agribalyse" ENABLE ROW LEVEL SECURITY;