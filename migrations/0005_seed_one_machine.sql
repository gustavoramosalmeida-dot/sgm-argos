-- Seed: uma máquina de teste na planta existente, com um QR point sem ativo vinculado.
-- Pré-requisito: migration 0004 (asset_visual_points.asset_node_id nullable) deve estar aplicada.

-- Site existente (0003)
-- id: a944b47c-30ef-405a-9661-b0b633c04dc0

INSERT INTO public.asset_nodes (
  id,
  parent_id,
  code,
  name,
  description,
  node_kind,
  status,
  has_qr
)
SELECT
  'b8e02f3a-1c4d-4a2e-9f5b-7d6e8c9a0b1c'::uuid,
  'a944b47c-30ef-405a-9661-b0b633c04dc0'::uuid,
  'MAQ-TESTE-001',
  'Máquina de teste (QR Point → Asset)',
  'Use para testar Criar ativo novo / Vincular ativo.',
  'MACHINE',
  'ACTIVE',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_nodes
  WHERE id = 'b8e02f3a-1c4d-4a2e-9f5b-7d6e8c9a0b1c'::uuid
);

-- Camada visual (foto) da máquina
INSERT INTO public.asset_visual_layers (
  id,
  asset_node_id,
  layer_type,
  name,
  image_url,
  is_default
)
SELECT
  'c9f13a4b-2d5e-5b3f-0a6c-8e7f9d0b1c2d'::uuid,
  'b8e02f3a-1c4d-4a2e-9f5b-7d6e8c9a0b1c'::uuid,
  'PHOTO',
  'Foto',
  'https://placehold.co/800x500/1e293b/94a3b8?text=M%C3%A1quina+de+teste',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_visual_layers
  WHERE id = 'c9f13a4b-2d5e-5b3f-0a6c-8e7f9d0b1c2d'::uuid
);

-- Um QR point sem ativo (asset_node_id NULL) para testar "Criar ativo novo"
-- Requer 0004_allow_visual_point_without_asset.sql
INSERT INTO public.asset_visual_points (
  id,
  asset_node_id,
  visual_layer_id,
  label,
  point_type,
  x_percent,
  y_percent,
  is_primary
)
SELECT
  'd0a24b5c-3e6f-6c4a-1b7d-9f8a0e2c3d4e'::uuid,
  NULL,
  'c9f13a4b-2d5e-5b3f-0a6c-8e7f9d0b1c2d'::uuid,
  'Novo ponto',
  'QR',
  0.42,
  0.67,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_visual_points
  WHERE id = 'd0a24b5c-3e6f-6c4a-1b7d-9f8a0e2c3d4e'::uuid
);
