-- Performance: index dedicated to lookups by visual_layer_id
CREATE INDEX IF NOT EXISTS idx_asset_visual_points_layer
ON public.asset_visual_points (visual_layer_id);

