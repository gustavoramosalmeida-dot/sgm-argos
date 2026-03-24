-- Permite QR Point sem ativo vinculado (asset_node_id opcional).
-- O vínculo é feito depois via PATCH link-asset ou POST create-asset.
ALTER TABLE public.asset_visual_points
  ALTER COLUMN asset_node_id DROP NOT NULL;
