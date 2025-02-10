create extension pg_trgm
with
  schema extensions;


CREATE OR REPLACE FUNCTION find_agribalyse_ingredient(ingredient_name text, similarity_threshold float)
RETURNS TABLE(name text, similarity_score real, ef_score float) AS $$
BEGIN
    RETURN QUERY SELECT 
        "public"."agribalyse"."Nom du Produit en Français" as name,
        similarity("public"."agribalyse"."Nom du Produit en Français", ingredient_name) as similarity_score,
        "public"."agribalyse"."Score unique EF 3.1" as ef_score
    FROM "public"."agribalyse"
    WHERE similarity("public"."agribalyse"."Nom du Produit en Français", ingredient_name) >= similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

alter table "public"."stream_ai_run_steps" alter column "input" drop not null;


