# Sistema de Teste de Webhook Hotmart

Sistema automatizado para gerar testes abrangentes do HotmartTrigger baseado em eventos reais capturados.

## Visão Geral

Este sistema processa 626 eventos reais capturados do webhook Hotmart e gera automaticamente:
- Fixtures de teste representativas usando amostragem estatística
- Arquivos de teste Jest com cobertura completa
- Documentação e estatísticas do processo

## Componentes

### 1. CSV Parser (`csv-parser.ts`)
- Lê o arquivo CSV com logs de webhook
- Extrai e valida JSONs de eventos
- Agrupa eventos por tipo
- Gera estatísticas de parsing

### 2. Fixture Generator (`fixture-generator.ts`)
- Seleciona eventos representativos usando diferentes estratégias:
  - **all**: Para tipos com poucos eventos (≤5)
  - **sample**: Para tipos com quantidade moderada (≤20)
  - **edge-cases**: Para tipos com muitos eventos (>20)
- Identifica edge cases automaticamente
- Adiciona eventos mockados para tipos faltantes

### 3. Anonymizer (`anonymizer.ts`) 🔒
- **CRUCIAL PARA SEGURANÇA**: Remove dados pessoais dos eventos
- Anonimiza campos sensíveis como:
  - Emails, nomes, telefones
  - CPF/CNPJ, endereços
  - IPs, tokens, IDs de usuário
- Usa hash determinístico para consistência
- Preserva estrutura dos dados

### 4. Test Generator (`test-generator.ts`)
- Gera arquivos de teste Jest
- Cria testes parametrizados para cada tipo de evento
- Inclui testes de validação e error handling
- Gera configuração de testes
- **USA APENAS DADOS ANONIMIZADOS**

## Uso

### Executar o sistema completo:
```bash
npx ts-node scripts/webhook-test-system/index.ts
```

### Executar componentes individuais:
```bash
# Apenas parsing
npx ts-node scripts/webhook-test-system/csv-parser.ts

# Apenas geração de fixtures
npx ts-node scripts/webhook-test-system/fixture-generator.ts

# Apenas geração de testes
npx ts-node scripts/webhook-test-system/test-generator.ts
```

## Estrutura de Saída

```
__tests__/
  fixtures/
    webhook-events/          # ⚠️ DADOS SENSÍVEIS - NÃO COMMITAR
    webhook-events-anon/     # ✅ Dados anonimizados - SEGUROS
      parsing-stats.json     # Estatísticas do parsing
      anonymization-stats.json # Estatísticas da anonimização
      parsed-events/         # JSONs anonimizados por tipo
        *.json
    webhook-fixtures/        # ⚠️ DADOS SENSÍVEIS - NÃO COMMITAR
    webhook-fixtures-anon/   # ✅ Fixtures anonimizadas - SEGUROS
      fixture-summary.json   # Resumo da seleção
      {event-type}/          # Diretórios por tipo
        1.json, 2.json...    # Eventos anonimizados
    webhook-mocks/           # ✅ Mocks seguros (sem dados reais)
      purchase-expired.json
      switch-plan.json
  unit/
    webhook/                 # ✅ Testes usando dados anonimizados
      test-config.json       # Configuração dos testes
      HotmartTrigger.*.test.ts
```

## ⚠️ SEGURANÇA E PRIVACIDADE

### Dados Sensíveis
O sistema processa dados reais de usuários que incluem:
- Informações pessoais (nome, email, CPF)
- Dados de pagamento
- Endereços e telefones
- Tokens e IDs de usuário

### Proteção Implementada
1. **Anonimização Automática**: Todos os dados pessoais são substituídos
2. **Gitignore Configurado**: Diretórios com dados reais são ignorados
3. **Hash Determinístico**: Permite testes consistentes sem expor dados
4. **Separação Clara**: Diretórios `-anon` contêm apenas dados seguros

### Regras de Segurança
- **NUNCA** commitar diretórios sem `-anon` no nome
- **SEMPRE** executar o anonimizador antes de compartilhar dados
- **VERIFICAR** o .gitignore antes de fazer push
- **USAR** apenas dados anonimizados em testes

## Estatísticas

- **Total de eventos processados**: 626
- **Tipos de eventos capturados**: 13/15
- **Eventos selecionados para testes**: 87
- **Arquivos de teste gerados**: 16
- **Total de testes criados**: 133

## Estratégias de Seleção

### Edge Cases Automáticos
O sistema identifica automaticamente edge cases baseado em:
- Valores numéricos extremos (min/max)
- Arrays vazios ou muito grandes
- Primeiro e último evento (temporais)

### Cobertura
- **86.7%** dos tipos de eventos foram capturados em produção
- **100%** de cobertura com adição de mocks para:
  - PURCHASE_EXPIRED
  - SWITCH_PLAN

## Executar os Testes Gerados

```bash
# Todos os testes de webhook
npm test -- __tests__/unit/webhook

# Teste específico
npm test -- __tests__/unit/webhook/HotmartTrigger.purchase-complete.test.ts

# Com coverage
npm test -- --coverage __tests__/unit/webhook
```

## Manutenção

### Adicionar novos eventos
1. Adicione o mock em `__tests__/fixtures/webhook-mocks/`
2. Execute o sistema novamente
3. Os testes serão gerados automaticamente

### Atualizar estratégia de seleção
Edite `fixture-generator.ts`:
- `maxEventsPerType`: Máximo de eventos por tipo
- `includeEdgeCases`: Incluir detecção de edge cases

## Troubleshooting

### CSV com formato diferente
Ajuste a interface `CSVRow` em `csv-parser.ts` para corresponder às colunas do seu CSV.

### Eventos sem JSON válido
Verifique `parsing-stats.json` para ver erros de parsing e ajuste a lógica em `parseRow()`.

### Testes falhando
Verifique se o HotmartTrigger foi modificado e ajuste os testes conforme necessário.