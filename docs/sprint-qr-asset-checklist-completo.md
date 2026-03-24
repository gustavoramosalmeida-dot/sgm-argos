# Sprint QR Point → Asset Node — Checklist completo (aceite final)

Usar no **aceite final da sprint**, após o checklist curto e ajustes finos. Garante que o sistema entrega o grafo **QR → ativo → histórico** sem gaps.

---

## 1. Arquitetura e modelo

| Item | Critério |
|------|----------|
| Regra oficial | QR Point **não é** o ativo; QR Point **aponta** para o ativo |
| Persistência | Vínculo em `asset_visual_points.asset_node_id` → `asset_nodes.id` |
| Compatibilidade | Uso interno de `asset_node_id`; API expõe `assetId` (camelCase) |
| Estados | Visual point pode existir sem ativo; ativo pode existir sem visual point |

## 2. Backend — endpoints e contratos

| Endpoint | Método | Contrato | Observação |
|----------|--------|----------|------------|
| Listar visual points por máquina | `GET /api/sgm/machines/:machineId/visual-points` | `{ machineId, items: VisualPoint[] }` com `assetId`, `asset` opcional | 404 se máquina inexistente (via getMachineById) |
| Detalhe do ativo | `GET /api/sgm/assets/:assetId` | `AssetSummary` (id, code, name, nodeKind, assetType, status, machineId) | 404 se ativo inexistente |
| Vincular QR a ativo existente | `PATCH /api/sgm/visual-points/:visualPointId/link-asset` | Body: `{ assetId }`; resposta: `VisualPoint` atualizado | 404 para visual point ou asset inexistente |
| Criar ativo a partir do QR | `POST /api/sgm/visual-points/:visualPointId/create-asset` | Body: `{ name, code?, nodeKind?, assetType?, parentId? }`; resposta: `VisualPoint` (201) | Cria `asset_nodes` e atualiza vínculo |

- [ ] Payloads em camelCase
- [ ] Validação de params/body (Zod ou equivalente)
- [ ] Arquitetura mantida: routes → controller → service → repository

## 3. Frontend — tela da máquina

| Área | Comportamento esperado |
|------|------------------------|
| Carga de dados | Máquina UUID: dados da API (máquina + visual points); máquina numérica: mock + localStorage |
| Lista lateral | Cada item indica "Ativo vinculado" ou "Sem ativo vinculado" |
| Mapa | Marcadores refletem os visual points (posição, vínculo implícito no dado) |
| Clique no QR (mapa ou lista) | Abre drawer/detalhe do ponto |
| Drawer com ativo vinculado | Exibe resumo do ativo (código/nome) e opções de vínculo/criação |
| Drawer sem ativo | Exibe "Sem ativo vinculado" e botões "Vincular ativo existente" / "Criar ativo novo" |
| Vincular ativo existente | Fluxo disponível; ao confirmar, API PATCH é chamada e lista/mapa atualizam |
| Criar ativo novo | Fluxo disponível; ao confirmar, API POST é chamada e lista/mapa atualizam |
| Abertura do ativo | Quando há `assetId`, drawer pode mostrar detalhe mínimo do ativo (ex.: via GET /assets/:id) |

- [ ] Layout atual preservado
- [ ] Mock isolado onde ainda não houver API (ex.: máquina numérica)
- [ ] Estados de loading/erro tratados onde fizer sentido

## 4. Fluxo de dados end-to-end

- [ ] **QR sem ativo** → usuário pode vincular ativo existente ou criar ativo novo → persistência no banco → próxima carga mostra "Ativo vinculado"
- [ ] **QR com ativo** → clique abre detalhe que mostra dados do ativo (resumo) e mantém opções de vínculo/criação para outros pontos
- [ ] Lista e mapa usam a mesma fonte de verdade (visual points da API após operações de vínculo/criação)

## 5. Não escopo (evitar escopo creep)

- [ ] Sem edição visual avançada do mapa nesta sprint
- [ ] Sem drag-and-drop de máquinas
- [ ] Sem CRUD completo sofisticado de ativos
- [ ] Sem permissões/RBAC
- [ ] Sem upload de imagem da planta
- [ ] Sem indicadores avançados de saúde

## 6. Aceite

- [ ] Checklist curto foi executado e todos os itens ok
- [ ] Ajustes finos realizados
- [ ] Checklist completo executado e assinado
- [ ] Sistema entrega: **Planta → Máquina → Mapa → QR Point → Asset Node**, com vínculo e abertura do ativo pelo QR

---

*Assinatura / data do aceite: ________________*
