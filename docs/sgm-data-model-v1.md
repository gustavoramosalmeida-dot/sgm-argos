### SGM — Data Model v1

Modelo baseado em:

- **Tudo é `asset_node`** (inclusive planta e máquina)
- **Hierarquia recursiva**
- **N níveis ilimitados**
- **Visual separado da lógica**
- **Timeline ligada ao ativo**
- **Timeline da máquina = agregação da árvore**
- **PostgreSQL** como banco oficial

---

## 1. `asset_nodes`

Representa qualquer elemento da estrutura da fábrica (site, área, máquina, subsistema, conjunto, sub-conjunto, componente, peça, item rastreável, etc.).

### Tabela `asset_nodes`

| Campo                     | Tipo       | Obrigatório | Descrição                          |
|---------------------------|------------|------------:|------------------------------------|
| `id`                      | uuid       | sim         | Identificador único                |
| `parent_id`               | uuid       | não         | Nó pai                             |
| `code`                    | varchar    | não         | Código do ativo                    |
| `name`                    | varchar    | sim         | Nome exibido                       |
| `description`             | text       | não         | Descrição                          |
| `node_kind`               | varchar    | sim         | Papel estrutural                   |
| `asset_type`              | varchar    | não         | Tipo operacional                   |
| `status`                  | varchar    | não         | Estado atual                       |
| `qr_code`                 | varchar    | não         | QR associado                       |
| `has_qr`                  | boolean    | sim         | Indica se possui QR                |
| `location_label`          | varchar    | não         | Localização textual                |
| `useful_life_days_default` | integer   | não         | Vida útil padrão (dias)           |
| `serial_number`           | varchar    | não         | Número de série                    |
| `part_number`             | varchar    | não         | Part number                        |
| `manufacturer`            | varchar    | não         | Fabricante                         |
| `installed_at`            | timestamp  | não         | Data de instalação                 |
| `sort_order`              | integer    | não         | Ordem entre irmãos                 |
| `path_cache`              | text       | não         | Cache de caminho                   |
| `depth_cache`             | integer    | não         | Cache de profundidade              |
| `created_at`              | timestamp  | sim         | Criação                            |
| `updated_at`              | timestamp  | sim         | Atualização                        |
| `deleted_at`              | timestamp  | não         | Soft delete                        |

### Domínio `node_kind` (exemplos)

- `SITE`
- `AREA`
- `MACHINE`
- `SYSTEM`
- `SUBSYSTEM`
- `ASSEMBLY`
- `SUBASSEMBLY`
- `COMPONENT`
- `PART`
- `ITEM`

### Domínio `asset_type` (exemplos)

- `machine`
- `motor`
- `sensor`
- `painel`
- `estrutura`
- `rolamento`
- `correia`
- `atuador`
- `eixo`
- `outro`

---

## 2. `asset_visual_layers`

Define as camadas visuais que representam um ativo (ex.: foto da máquina, blueprint técnico, exploded view).

### Tabela `asset_visual_layers`

| Campo           | Tipo      | Obrigatório | Descrição                        |
|-----------------|-----------|------------:|----------------------------------|
| `id`            | uuid      | sim         | Identificador                    |
| `asset_node_id` | uuid      | sim         | Ativo dono da camada             |
| `layer_type`    | varchar   | sim         | Tipo da camada                   |
| `name`          | varchar   | sim         | Nome da camada                   |
| `image_url`     | text      | sim         | URL da imagem                    |
| `width_px`      | integer   | não         | Largura da imagem (px)          |
| `height_px`     | integer   | não         | Altura da imagem (px)           |
| `is_default`    | boolean   | sim         | Indica se é a camada padrão     |
| `created_at`    | timestamp | sim         | Criação                          |
| `updated_at`    | timestamp | sim         | Atualização                      |
| `deleted_at`    | timestamp | não         | Soft delete                      |

### Domínio `layer_type`

- `PHOTO`
- `BLUEPRINT`
- `EXPLODED`

**MVP:** utilizar apenas `PHOTO`.

---

## 3. `asset_visual_points`

Define posições visuais na imagem associadas a ativos (ex.: motor principal, sensor lateral, painel elétrico).

### Tabela `asset_visual_points`

| Campo             | Tipo      | Obrigatório | Descrição                           |
|-------------------|-----------|------------:|-------------------------------------|
| `id`              | uuid      | sim         | Identificador                       |
| `asset_node_id`   | uuid      | sim         | Ativo representado                  |
| `visual_layer_id` | uuid      | sim         | Camada visual                       |
| `label`           | varchar   | não         | Rótulo do ponto                     |
| `point_type`      | varchar   | não         | Tipo de marcador                    |
| `x_percent`       | numeric   | sim         | Posição X relativa (0–100)          |
| `y_percent`       | numeric   | sim         | Posição Y relativa (0–100)          |
| `marker_color`    | varchar   | não         | Cor do marcador                     |
| `marker_icon`     | varchar   | não         | Ícone                               |
| `is_primary`      | boolean   | sim         | Indica se é o ponto principal      |
| `created_at`      | timestamp | sim         | Criação                             |
| `updated_at`      | timestamp | sim         | Atualização                         |
| `deleted_at`      | timestamp | não         | Soft delete                         |

---

## 4. `asset_events`

Sustenta a linha do tempo do ativo. Qualquer `asset_node` pode ter eventos (instalação, troca, inspeção, falha, etc.).

### Tabela `asset_events`

| Campo              | Tipo      | Obrigatório | Descrição                          |
|--------------------|-----------|------------:|------------------------------------|
| `id`               | uuid      | sim         | Identificador                      |
| `asset_node_id`    | uuid      | sim         | Ativo relacionado                  |
| `event_type`       | varchar   | sim         | Tipo do evento                     |
| `event_date`       | timestamp | sim         | Data do evento                     |
| `title`            | varchar   | sim         | Título                             |
| `description`      | text      | não         | Observação                         |
| `performed_by`     | varchar   | não         | Quem realizou                      |
| `useful_life_days` | integer   | não         | Vida útil aplicada (dias)         |
| `next_due_date`    | timestamp | não         | Próxima data prevista              |
| `severity`         | varchar   | não         | Severidade                         |
| `status`           | varchar   | não         | Estado                             |
| `source`           | varchar   | não         | Origem                             |
| `reference_type`   | varchar   | não         | Tipo de referência externa         |
| `reference_id`     | varchar   | não         | ID externo                         |
| `created_at`       | timestamp | sim         | Criação                            |
| `updated_at`       | timestamp | sim         | Atualização                        |
| `deleted_at`       | timestamp | não         | Soft delete                        |

### Domínio `event_type`

- `INSTALL`
- `REPLACE`
- `INSPECTION`
- `ADJUSTMENT`
- `CLEANING`
- `FAILURE`
- `NOTE`

---

## 5. `asset_files`

Arquivos anexados ao ativo (ex.: manual, foto, laudo, documentação).

### Tabela `asset_files`

| Campo           | Tipo      | Obrigatório | Descrição                    |
|-----------------|-----------|------------:|------------------------------|
| `id`            | uuid      | sim         | Identificador                |
| `asset_node_id` | uuid      | sim         | Ativo relacionado            |
| `file_type`     | varchar   | sim         | Tipo do arquivo              |
| `name`          | varchar   | sim         | Nome                         |
| `url`           | text      | sim         | Local do arquivo             |
| `mime_type`     | varchar   | não         | MIME                         |
| `description`   | text      | não         | Descrição                    |
| `uploaded_by`   | varchar   | não         | Usuário                      |
| `created_at`    | timestamp | sim         | Criação                      |
| `updated_at`    | timestamp | sim         | Atualização                  |
| `deleted_at`    | timestamp | não         | Soft delete                  |

---

## Estrutura hierárquica (exemplo)

Exemplo de árvore real — todos são `asset_nodes`:

- `Bravo Tapeçaria — Produção` (`SITE`)  
  - `Máquina Corte 01` (`MACHINE`)  
    - `Sistema de corte` (`SYSTEM`)  
      - `Motor principal` (`COMPONENT`)  
        - `Rolamento dianteiro` (`PART`)  

Exemplo de QR no modelo (no `asset_nodes`):

- `Rolamento dianteiro`  
  - `qr_code` = `QR-081-A`  
  - `useful_life_days_default` = `90`

---

## Timeline e derivação

### Timeline do ativo (nó individual)

Eventos diretamente ligados ao nó:

- Fonte: `asset_events`
- Filtro: `asset_events.asset_node_id = <id_do_nó>`

Exemplo de timeline do rolamento:

- `15/03/2026` — `REPLACE` — Troca do rolamento  
- `20/03/2026` — `INSPECTION` — Inspeção visual OK  

### Timeline da máquina (agregada pela árvore)

- Fonte: `asset_events`
- Filtro: `asset_events.asset_node_id ∈ subtree(<machine_id>)`  
- Resultado: merge ordenado por `event_date` de todos os eventos da subárvore.

### Inventário de QR da máquina

Não precisa de tabela própria. Deriva de:

- `asset_nodes` (com `has_qr = true` / `qr_code` preenchido)
- +
- `asset_visual_points`
- +
- `asset_events`

---

## Status radar derivado

Estados sugeridos:

- `OK`
- `ATENCAO`
- `VENCIDO`
- `SEM_HISTORICO`

Baseados em:

- `next_due_date` (de `asset_events`, normalmente último evento relevante)
- Data atual

*(Regras exatas de mapeamento podem ser detalhadas em seção futura de “Regras de negócio de status”.)*

---

## Princípios da modelagem

- **Tudo é `asset_node`**.
- **Árvore recursiva com N níveis ilimitados**.
- **Visual separado da lógica** (`asset_visual_layers` / `asset_visual_points`).
- **Timeline ligada ao ativo** (`asset_events`).
- **Timeline da máquina = agregação da árvore** (subtree da máquina).
- **Inventário de QR derivado**, sem tabela dedicada.

