#!/bin/bash

# Script de Reorganização da Documentação
# Organiza os 61 arquivos MD em estrutura hierárquica

echo "🚀 Iniciando reorganização da documentação..."

# Diretório base
DOCS_DIR="/Users/thaleslaray/code/projetos/n8n-hotmart/docs/diario"
cd "$DOCS_DIR"

# 1. Criar backup antes de reorganizar
echo "📦 Criando backup..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r *.md "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup criado em: $BACKUP_DIR"

# 2. Criar nova estrutura de pastas
echo "🏗️ Criando nova estrutura..."
mkdir -p {01-metodo-tdah,02-analises-dados,03-movimento-404,04-jornada-historica,05-conversas-originais,06-ferramentas-continuacao,07-documentacao-projeto,archive}

# 3. Mover arquivos para categorias apropriadas
echo "📂 Organizando arquivos por categoria..."

# Método TDAH
echo "  → Organizando Método TDAH..."
mv metodo-TDAH-acronimo.md 01-metodo-tdah/metodo-acronimo.md 2>/dev/null
mv metodo-thales-detalhado-completo.md 01-metodo-tdah/metodo-detalhado.md 2>/dev/null
mv metodo-thales-pratico.md 01-metodo-tdah/metodo-pratico.md 2>/dev/null
mv metodo-thales-micro-habitos-guia.md 01-metodo-tdah/micro-habitos.md 2>/dev/null
mv metodo-thales-exemplos-reais.md 01-metodo-tdah/exemplos-reais.md 2>/dev/null
mv metodo-thales-framework-replicavel.md 01-metodo-tdah/framework-replicavel.md 2>/dev/null
mv evolucao-metodo-thales.md 01-metodo-tdah/evolucao-metodo.md 2>/dev/null
mv framework-pensamento-thales.md 01-metodo-tdah/framework-pensamento.md 2>/dev/null
mv metodo-thales-definitivo.md 01-metodo-tdah/metodo-definitivo.md 2>/dev/null

# Análises e Dados
echo "  → Organizando Análises..."
mv analise-45426-mensagens.md 02-analises-dados/45426-mensagens.md 2>/dev/null
mv analise-completa-todos-projetos.md 02-analises-dados/todos-projetos.md 2>/dev/null
mv analise-completa-documentacao-md.md 02-analises-dados/documentacao-completa.md 2>/dev/null
mv analise-estrutura-code.md 02-analises-dados/estrutura-codigo.md 2>/dev/null
mv analise-evolucao-real-completa.md 02-analises-dados/evolucao-completa.md 2>/dev/null
mv analise-extracao-dados-claude.md 02-analises-dados/extracao-dados-claude.md 2>/dev/null
mv analise-final.md 02-analises-dados/analise-final.md 2>/dev/null
mv metricas.md 02-analises-dados/metricas.md 2>/dev/null
mv metricas-detalhadas-evolucao.md 02-analises-dados/metricas-detalhadas.md 2>/dev/null
mv dados-coletados.md 02-analises-dados/dados-coletados.md 2>/dev/null
mv insights-evolucao-recente.md 02-analises-dados/insights-recentes.md 2>/dev/null

# Movimento 404
echo "  → Organizando Movimento 404..."
mv movimento-404-until-now.md 03-movimento-404/manifesto.md 2>/dev/null
mv erro404-plano-100-dias.md 03-movimento-404/plano-100-dias.md 2>/dev/null
mv erro404-estrategia-viral-completa.md 03-movimento-404/estrategia-viral.md 2>/dev/null
mv erro404-curriculum-completo.md 03-movimento-404/curriculum.md 2>/dev/null
mv erro404-expansao-total.md 03-movimento-404/plano-expansao.md 2>/dev/null
mv erro404-automacoes-marketing.md 03-movimento-404/automacoes-marketing.md 2>/dev/null
mkdir -p 03-movimento-404/materiais
mv erro404-materiais-suporte.md 03-movimento-404/materiais/materiais-suporte.md 2>/dev/null
mv erro404-pitch-deck-investidores.md 03-movimento-404/materiais/pitch-deck.md 2>/dev/null
mv erro404-netflix-documentary-script.md 03-movimento-404/materiais/documentary-script.md 2>/dev/null
mv erro404-press-release.md 03-movimento-404/materiais/press-release.md 2>/dev/null
mv metodo-erro404-branding.md 03-movimento-404/materiais/branding.md 2>/dev/null
mkdir -p 03-movimento-404/legal
mv erro404-termos-legais.md 03-movimento-404/legal/termos-uso.md 2>/dev/null

# Jornada Histórica
echo "  → Organizando Jornada..."
mv jornada-epica-definitiva.md 04-jornada-historica/jornada-completa.md 2>/dev/null
mv timeline.md 04-jornada-historica/timeline.md 2>/dev/null
mv epic-timeline-final.md 04-jornada-historica/timeline-visual.md 2>/dev/null
mv jornada-epica-cientista-foguetes.md 04-jornada-historica/narrativa-cientista.md 2>/dev/null
mv jornada-epica-redes-sociais.md 04-jornada-historica/versao-redes-sociais.md 2>/dev/null
mv teaser-jornada-epica.md 04-jornada-historica/teaser.md 2>/dev/null
mv historia-primeiro-codigo.md 04-jornada-historica/primeiro-codigo.md 2>/dev/null
mv descoberta-switchy-virada-de-chave.md 04-jornada-historica/virada-switchy.md 2>/dev/null
mv todas-viradas-de-chave-completas.md 04-jornada-historica/todas-viradas.md 2>/dev/null
mv minha-ascensao.md 04-jornada-historica/historia-pessoal.md 2>/dev/null

# Conversas Originais
echo "  → Organizando Conversas..."
mv CONVERSA-METODO-TDAH-COMPLETA.md 05-conversas-originais/conversa-descoberta-metodo.md 2>/dev/null
mv CONVERSA-EPICA-COMPLETA-25-05-2025.md 05-conversas-originais/conversa-epica-25-05.md 2>/dev/null
mv CONVERSA-EPICA-RESUMO-25-05-2025.md 05-conversas-originais/conversa-epica-resumo.md 2>/dev/null
mv INDICE-CONVERSA-TDAH.md 05-conversas-originais/indice-conversas.md 2>/dev/null
mv descoberta-historico-claude-conversas.md 05-conversas-originais/descoberta-45426-mensagens.md 2>/dev/null

# Ferramentas de Continuação
echo "  → Organizando Ferramentas..."
mv MEGA-PROMPT-CONTINUACAO.md 06-ferramentas-continuacao/mega-prompt.md 2>/dev/null
mv CONTEXTO-CONVERSA-EPICA.md 06-ferramentas-continuacao/contexto-rapido.md 2>/dev/null
mv prompt-historia-resumida.md 06-ferramentas-continuacao/prompt-resumido.md 2>/dev/null
mv sistema-logging-conversas.md 06-ferramentas-continuacao/sistema-logging.md 2>/dev/null
mv plano-publicacao-tdah.md 06-ferramentas-continuacao/plano-publicacao.md 2>/dev/null

# Documentação do Projeto
echo "  → Organizando Documentação..."
mv decisoes-arquiteturais.md 07-documentacao-projeto/decisoes-arquiteturais.md 2>/dev/null
mv aprendizados.md 07-documentacao-projeto/aprendizados.md 2>/dev/null
mv prompts-eficazes.md 07-documentacao-projeto/prompts-eficazes.md 2>/dev/null
mv padroes-evolucao-software-completos.md 07-documentacao-projeto/padroes-evolucao.md 2>/dev/null
mv evolucao-completa.md 07-documentacao-projeto/evolucao-completa.md 2>/dev/null
mv template-analise-alunos.md 07-documentacao-projeto/template-analise.md 2>/dev/null

# Resumos Executivos (consolidar depois)
echo "  → Arquivando resumos para consolidação..."
mv resumo-executivo*.md archive/ 2>/dev/null

# Ideias
mv ideias.md archive/ 2>/dev/null
mv ideias-arquivadas archive/ 2>/dev/null

# Manter READMEs na raiz
echo "  → Preservando READMEs principais..."
# README.md e README-COMPLETO.md ficam na raiz

# 4. Criar README para cada categoria
echo "📝 Criando índices por categoria..."

# README Método TDAH
cat > 01-metodo-tdah/README.md << 'EOF'
# 🧠 Método T.D.A.H - Documentação Central

Este diretório contém toda a documentação do Método T.D.A.H (Tentativas infinitas, Documentação obsessiva, Ação imediata, Hiperfoco canalizado).

## 📚 Arquivos Disponíveis

1. **metodo-acronimo.md** ⭐ - Versão concisa e visual (3 páginas)
2. **metodo-detalhado.md** 📊 - Análise científica completa (15 páginas)
3. **metodo-pratico.md** - Guia hands-on de aplicação
4. **micro-habitos.md** - 21 micro-hábitos para implementar
5. **exemplos-reais.md** - Cases práticos de sucesso
6. **framework-replicavel.md** - Como ensinar o método
7. **evolucao-metodo.md** - História da descoberta
8. **framework-pensamento.md** - Como o cérebro TDAH funciona

## 🎯 Ordem Sugerida de Leitura

1. Começe com `metodo-acronimo.md` para visão geral
2. Aprofunde em `metodo-detalhado.md`
3. Implemente com `metodo-pratico.md`
4. Forme hábitos com `micro-habitos.md`
EOF

# README Análises
cat > 02-analises-dados/README.md << 'EOF'
# 📊 Análises e Dados - 45.426 Mensagens Analisadas

Análises estatísticas e insights extraídos de 19 dias de desenvolvimento intenso.

## 📈 Arquivos Principais

1. **45426-mensagens.md** - Análise completa das conversas
2. **todos-projetos.md** - Visão de 30+ projetos
3. **metricas.md** - Dashboard de KPIs
4. **insights-recentes.md** - Descobertas mais recentes

## 🔍 Métricas Impressionantes

- 45.426 mensagens analisadas
- 10.3 milhões de caracteres
- 30+ versões do n8n-hotmart
- 19 dias de desenvolvimento
EOF

# Repetir para outras categorias...

# 5. Relatório final
echo ""
echo "✅ Reorganização concluída!"
echo ""
echo "📊 Resumo da reorganização:"
echo "  - Backup criado em: $BACKUP_DIR"
echo "  - 7 categorias principais criadas"
echo "  - Arquivos organizados por tema"
echo "  - READMEs de navegação criados"
echo ""
echo "💡 Próximos passos:"
echo "  1. Revisar arquivos em /archive para consolidação"
echo "  2. Atualizar links quebrados"
echo "  3. Gerar índice mestre atualizado"
echo ""
echo "🎯 Nova estrutura em: $DOCS_DIR"