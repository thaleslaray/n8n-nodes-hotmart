# Plano para Relatório de Filtros e Campos dos Endpoints Hotmart

## 1. Mapeamento dos Endpoints
- Identificar todos os endpoints Hotmart implementados, baseando-se nos arquivos `.operation.ts` em `nodes/Hotmart/v1/actions/`.
- Agrupar os endpoints por recurso (ex: subscription, sales, coupon, club, tickets, product).

## 2. Extração dos Filtros (Parâmetros de Entrada)
- Para cada endpoint, extrair todos os filtros/options definidos no array `options` ou `filters` do respectivo arquivo `.operation.ts`.
- Para cada filtro, coletar:
  - Nome (name)
  - Nome de exibição (displayName)
  - Tipo (type)
  - Descrição (description)
  - Valores possíveis (options), se aplicável

## 3. Extração dos Campos de Saída (Output)
- Para cada endpoint, buscar o exemplo de retorno JSON no arquivo de documentação correspondente em `docs/docs-ht/`.
- Listar todos os campos presentes no exemplo de resposta, incluindo subcampos se houver objetos aninhados.

## 4. Estruturação do Relatório
- Para cada endpoint, criar duas tabelas:
  - **Tabela 1: Filtros/Parâmetros de Entrada**
  - **Tabela 2: Campos de Saída (Output)**
- Exemplo de estrutura para cada endpoint:

### Exemplo de Estrutura

#### [Recurso] - [Nome do Endpoint]

##### Filtros

| Nome         | Nome de Exibição      | Tipo         | Descrição                                 | Valores Possíveis         |
|--------------|----------------------|--------------|-------------------------------------------|--------------------------|
| status       | Status               | multiOptions | Filtrar por status da assinatura          | ACTIVE, INACTIVE, ...    |
| productId    | Product Name or ID   | options      | Escolha da lista ou informe via expressão | -                        |
| ...          | ...                  | ...          | ...                                       | ...                      |

##### Campos de Saída

| Campo                | Tipo      | Descrição (se disponível)                |
|----------------------|-----------|------------------------------------------|
| subscriber_code      | string    | Código exclusivo do assinante            |
| subscription_id      | integer   | ID da assinatura                         |
| status               | string    | Status da assinatura                     |
| accession_date       | long      | Data de início da assinatura             |
| ...                  | ...       | ...                                      |

## 5. Observações e Validações
- Se algum endpoint não tiver documentação de saída, indicar no relatório.
- Se houver divergências entre filtros do código e da documentação, destacar.

## 6. Diagrama de Fluxo (Mermaid)
```mermaid
flowchart TD
    A[Mapear arquivos .operation.ts] --> B[Extrair filtros/options]
    A --> C[Identificar arquivo de documentação]
    C --> D[Extrair campos de saída do exemplo JSON]
    B & D --> E[Gerar tabelas por endpoint]
    E --> F[Montar relatório final agrupado por recurso]
