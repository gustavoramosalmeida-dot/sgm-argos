-- Seed: uma segunda máquina na mesma planta, para ter certeza absoluta no teste.
-- Pré-requisito: 0004 (asset_node_id nullable) aplicada.

-- Site (0003): a944b47c-30ef-405a-9661-b0b633c04dc0

-- Nova máquina (UUIDs distintos da 0005)
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
  'e1b35c6d-4f7a-5b8e-2c9d-0a1e3f4b5c6d'::uuid,
  'a944b47c-30ef-405a-9661-b0b633c04dc0'::uuid,
  'MAQ-NOVA-002',
  'Máquina nova — teste Criar ativo',
  'Segunda máquina de seed para teste com certeza absoluta.',
  'MACHINE',
  'ACTIVE',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_nodes
  WHERE id = 'e1b35c6d-4f7a-5b8e-2c9d-0a1e3f4b5c6d'::uuid
);

-- Camada visual
INSERT INTO public.asset_visual_layers (
  id,
  asset_node_id,
  layer_type,
  name,
  image_url,
  is_default
)
SELECT
  'f2c46d7e-5a8b-6c9f-3d0e-1b2f4a5c6d7e'::uuid,
  'e1b35c6d-4f7a-5b8e-2c9d-0a1e3f4b5c6d'::uuid,
  'PHOTO',
  'Foto',
  'https://placehold.co/800x500/1e293b/94a3b8?text=M%C3%A1quina+nova',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_visual_layers
  WHERE id = 'f2c46d7e-5a8b-6c9f-3d0e-1b2f4a5c6d7e'::uuid
);

-- Um QR point sem ativo
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
  'a3d57e8f-6b9c-7d0a-4e1f-2c3a5b6d7e8f'::uuid,
  NULL,
  'f2c46d7e-5a8b-6c9f-3d0e-1b2f4a5c6d7e'::uuid,
  'Ponto para Criar ativo',
  'QR',
  0.35,
  0.55,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_visual_points
  WHERE id = 'a3d57e8f-6b9c-7d0a-4e1f-2c3a5b6d7e8f'::uuid
);
