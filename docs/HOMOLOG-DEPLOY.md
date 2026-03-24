# Homologação e deploy — SGM Web (MVP)

Runbook vivo: alinha ambiente, smoke test e critérios de go-live. **Atualizado após sessão de homologação prática (local).**

---

## 1. Ambiente validado nesta sessão

| Item | Resultado | Evidência / notas |
|------|-----------|---------------------|
| **Build do app web** | OK | `npm run build` — `tsc -b && vite build` concluiu sem erro (saída Vite “built”). |
| **Backend local** | OK | `GET http://localhost:3333/api/sgm/sites` → **200**, JSON com `items`. |
| **Máquinas (dataset)** | OK | `GET http://localhost:3333/api/sgm/machines` retornou itens (ex.: máquina UUID disponível para testes). |
| **`PUBLIC_BASE_URL` no `.env` do server** | *Não definido* | Variável opcional; com ausência, o servidor usa **Host da requisição** para montar URLs de upload (ver `getPublicBaseUrl`). |
| **Upload de foto (crítico)** | OK (local) | `POST /api/sgm/machines/:machineId/photo` → **200**; corpo com `imageUrl`; `GET` na URL da imagem → **200**, `Content-Type: image/png`. |
| **Front “ambiente alvo” remoto** | Não validado aqui | O smoke de UI (browser, proxy de homolog/produção) depende do **URL que a equipa usar**. Repetir os passos abaixo nesse host. |

**URLs nesta sessão (dev local):**

- API direta: `http://localhost:3333`
- Front com proxy Vite: `http://localhost:5173` (esperado; proxy `/api` → `3333`)

---

## 2. `PUBLIC_BASE_URL` (servidor)

- Variável **opcional** em `server` (`PUBLIC_BASE_URL`): se **vazia**, `getPublicBaseUrl(req)` usa `protocol + Host` do request.
- **Quando definir obrigatoriamente:** o cliente acessa o backend por um host **diferente** do host “público” das URLs de ficheiro (ex.: API interna `api-backend:3333`, browser em `https://sgm.cliente.com`). Nesse caso, sem `PUBLIC_BASE_URL` correto, `imageUrl` pode ficar com host **inacessível ao browser** → **bloqueia go-live** se as imagens de máquina forem requisito.
- **Formato:** `https://dominio-publico.com` — **sem** barra final.

**Sintomas comuns se estiver errado:**

- `imageUrl` com `localhost` ou hostname interno em produção.
- `<img src>` com **404** ou **ERR_CONNECTION_REFUSED** após upload.
- Imagem ok no Network do POST, mas **src** aponta para outro host.

---

## 3. Backend, proxy e CORS

- **Dev:** `vite.config.ts` — `server.proxy['/api']` → `http://localhost:3333`.
- **Homolog/produção:** o browser deve conseguir `fetch('/api/sgm/...')` no mesmo origin do front **ou** CORS + URL absoluta configurada de forma coerente (o código atual usa caminhos relativos `/api/...`).

---

## 4. Indicadores do inventário e radar (honestidade de produto)

- **Inventário por QR** e **mini radar** usam a agregação atual da tela, com **dados de referência/demonstração** por QR onde ainda não há histórico alinhado ao backend.
- **Timeline operacional do ativo** (`/api/sgm/assets/:id/timeline`) é a **fonte principal** quando há ativo vinculado e dados na API.

---

## 5. Smoke test — resultado desta sessão

### Automatizado (esta sessão)

| # | Passo | Resultado |
|---|--------|------------|
| — | `npm run build` | OK |
| — | `GET /api/sgm/sites` | OK |
| — | `GET /api/sgm/machines` | OK |
| — | Upload `POST .../machines/:id/photo` + `GET` da `imageUrl` | OK |

### Manual (browser — obrigatório no ambiente alvo)

Executar no **URL real** do front (homolog/produção). Marcar OK / FALHOU / OK COM OBS.

| # | Ação | Esperado | Se falhar |
|---|------|----------|-----------|
| 1 | Abrir `/plants` | Lista ou empty tratado | Bloqueia se erro de API |
| 2 | Abrir planta | Mapa + máquinas | Bloqueia |
| 3 | Abrir `/machines/:uuid` | Página da máquina | Bloqueia |
| 4 | Abrir editor visual | Mapa + QR | Bloqueia |
| 5 | Selecionar QR | Seleção visível | Bloqueia |
| 6 | Abrir drawer | Painel abre | Bloqueia |
| 7 | Criar/vincular ativo | Estado atualiza | Bloqueia |
| 8 | Timeline do ativo | Carrega ou vazio sem erro | Recomendado |
| 9 | Aba Inventário | Tabela | Bloqueia se incoerente |
| 10 | Busca/filtros | Filtra | Recomendado |
| 11 | Mini radar → inventário | Filtro alinhado | Recomendado |
| 12 | “Abrir no editor” | Navega com `?vp=` | Bloqueia |
| 13–15 | Trocar imagem, salvar, refresh | Imagem persiste | **Bloqueia** se URL quebrada |
| 16 | `?tab=inventory` + F5 | Aba mantida | Recomendado |
| 17 | `?vp=` válido | Ponto selecionado | Recomendado |
| 18 | `?vp=invalid` | Aviso + limpeza de query | Recomendado |
| 19 | `?timeline=1` | Drawer abre; param consumido | Recomendado |
| 20 | Navegação máquina ↔ editor ↔ inventário | Coerente | Recomendado |

---

## 6. Upload de imagem — procedimento de verificação

1. No editor, enviar ficheiro e **salvar no servidor** (ou URL https conforme UI).
2. **Network:** `POST /api/sgm/machines/:id/photo` (ou PUT de máquina se só URL) → **200**.
3. **Resposta:** copiar `imageUrl` do JSON.
4. Abrir `imageUrl` noutro separador ou inspecionar `<img src>` → **200** e imagem visível.
5. **F5** na página da máquina/editor → imagem mantém-se.
6. Em homolog atrás de proxy: confirmar que `imageUrl` usa **host público**; se não, ajustar **`PUBLIC_BASE_URL`** e repetir.

**Regra de classificação:** upload HTTP 200 mas imagem inacessível no browser → **bloqueia go-live** no ambiente alvo.

---

## 7. Deep links — casos a validar no browser

| URL | Esperado |
|-----|----------|
| `/machines/:id?tab=inventory` | Aba Inventário; após F5, mantém. |
| `/machines/:id/editor?vp=<uuid válido>` | Ponto selecionado / painel alinhado. |
| `...?vp=<uuid>&timeline=1` | Drawer timeline abre; `timeline` removido da URL após consumo. |
| `...?vp=invalid` | Aviso discreto; params inválidos limpos (comportamento atual do editor). |

Testar também **cópia da URL** noutro browser, quando possível.

---

## 8. Classificação final (após esta sessão)

### A. Bloqueia go-live

- API `/api/sgm` inacessível no ambiente de uso.
- Upload de foto da máquina com **`imageUrl` inacessível** ao utilizador (host/path errado; típico: `PUBLIC_BASE_URL` em deploy atrás de proxy).
- Fluxo UUID principal quebrado (máquina, pontos, vínculo inutilizável).
- Build de produção falhando.

### B. Recomendado antes do go-live

- Smoke manual completo na **mesma URL** que os utilizadores.
- Validar deep links e refresh em homolog.
- Comunicar a equipa a diferença **inventário/radar (referência)** vs **timeline do ativo (oficial)**.

### C. Pode ficar para depois

- Integração de eventos por QR com API real.
- Remoção do fluxo legado numérico.
- Manter `timeline=1` na URL após abrir o drawer (mudança de produto).

---

## 9. Decisão sugerida (esta sessão)

- **Local (dev):** API + build + upload + GET de imagem validados → base técnica **consistente** para seguir para homolog remota.
- **Go-live “oficial”:** exige **repetir** smoke no ambiente alvo (front + proxy + `PUBLIC_BASE_URL` real). Até lá: **pronto para go-live assistido** (local OK; remoto não testado pelo pipeline automático desta sessão).

---

## 10. Build do app web

```bash
npm run build
```

---

*Última atualização: Sprint 6.5 — homologação prática (evidências locais: API, build, upload).*
