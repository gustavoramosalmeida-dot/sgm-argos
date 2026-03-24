# Sprint QR Point → Asset Node — Checklist curto (DEV)

Usar **durante o desenvolvimento** para validar rapidamente que o fluxo básico está ok. Não substitui o checklist completo no aceite.

---

## Banco / modelo

- [ ] `asset_visual_points.asset_node_id` existe e referencia `asset_nodes.id`
- [ ] Visual point pode existir sem ativo (asset_node_id null ou temporário)
- [ ] Ativo pode existir sem visual point

## Backend

- [ ] `GET /api/sgm/machines/:machineId/visual-points` retorna lista com `assetId` + `asset` resumido
- [ ] `GET /api/sgm/assets/:assetId` retorna resumo do ativo
- [ ] `PATCH /api/sgm/visual-points/:id/link-asset` com body `{ assetId }` vincula e retorna visual point
- [ ] `POST /api/sgm/visual-points/:id/create-asset` com body `{ name, code?, nodeKind?, assetType? }` cria ativo e vincula
- [ ] 404 para visual point ou asset inexistente

## Frontend

- [ ] Tela da máquina (UUID) carrega visual points reais da API
- [ ] Lista lateral mostra "Ativo vinculado" / "Sem ativo vinculado"
- [ ] Clique no QR (mapa ou lista) abre drawer com dados do ponto
- [ ] Drawer mostra ativo vinculado quando existir e botões "Vincular ativo existente" / "Criar ativo novo"
- [ ] Vincular ativo existente: fluxo executa e lista atualiza
- [ ] Criar ativo novo: fluxo executa e lista atualiza

## Regras rápidas

- [ ] Nada quebra para máquina com ID numérico (mock)
- [ ] Layout atual preservado; sem refatoração visual da tela inteira

---

*Quando todos os itens estiverem ok → passar para **ajustes finos** e depois ao **checklist completo** para aceite.*
