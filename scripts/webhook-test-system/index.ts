#!/usr/bin/env ts-node

/**
 * Sistema de Teste de Webhook Hotmart
 * 
 * Script principal que coordena todo o processo de geração de testes
 */

import * as path from 'path';
import { CSVParser } from './csv-parser';
import { FixtureGenerator } from './fixture-generator';
import { TestGenerator } from './test-generator';
import { WebhookAnonymizer } from './anonymizer';

async function main() {
  console.log('🚀 Sistema de Teste de Webhook Hotmart\n');
  
  try {
    // 1. Parser - Extrair eventos do CSV
    console.log('📋 Etapa 1/4: Parsing do CSV');
    const csvPath = path.join(__dirname, '../../logs/LOGS WEBHOOK.csv');
    const eventsOutputDir = path.join(__dirname, '../../__tests__/fixtures/webhook-events');
    
    const parser = new CSVParser(csvPath, eventsOutputDir);
    await parser.parse();
    
    console.log('\n');
    
    // 2. Fixture Generator - Selecionar eventos representativos
    console.log('📋 Etapa 2/4: Geração de Fixtures');
    const fixturesOutputDir = path.join(__dirname, '../../__tests__/fixtures/webhook-fixtures');
    
    const fixtureGenerator = new FixtureGenerator({
      inputDir: eventsOutputDir,
      outputDir: fixturesOutputDir,
      maxEventsPerType: 10,
      includeEdgeCases: true
    });
    
    await fixtureGenerator.generateFixtures();
    
    console.log('\n');
    
    // 3. Anonimização - Proteger dados pessoais
    console.log('📋 Etapa 3/4: Anonimização de Dados');
    const anonEventsDir = path.join(__dirname, '../../__tests__/fixtures/webhook-events-anon');
    const anonFixturesDir = path.join(__dirname, '../../__tests__/fixtures/webhook-fixtures-anon');
    
    const anonymizer = new WebhookAnonymizer({
      inputDir: eventsOutputDir,
      outputDir: anonEventsDir,
      preserveStructure: true,
      deterministicHash: true
    });
    
    await anonymizer.anonymizeAll();
    
    console.log('\n');
    
    // 4. Test Generator - Gerar arquivos de teste (usando dados anonimizados)
    console.log('📋 Etapa 4/4: Geração de Testes');
    const testsOutputDir = path.join(__dirname, '../../__tests__/unit/webhook');
    
    const testGenerator = new TestGenerator({
      fixturesDir: anonFixturesDir,
      outputDir: testsOutputDir,
      testFramework: 'jest'
    });
    
    await testGenerator.generateTests();
    
    console.log('\n✨ Sistema de teste completo gerado com sucesso!');
    console.log('\n📁 Estrutura criada:');
    console.log('   __tests__/');
    console.log('     fixtures/');
    console.log('       webhook-events/       # ⚠️  CONTÉM DADOS SENSÍVEIS - NÃO COMMITAR');
    console.log('       webhook-events-anon/  # ✅ Dados anonimizados - SEGUROS');
    console.log('       webhook-fixtures/     # ⚠️  CONTÉM DADOS SENSÍVEIS - NÃO COMMITAR');
    console.log('       webhook-fixtures-anon/# ✅ Fixtures anonimizadas - SEGUROS');
    console.log('       webhook-mocks/        # ✅ Eventos mockados (já seguros)');
    console.log('     unit/');
    console.log('       webhook/              # ✅ Testes usando dados anonimizados');
    
    console.log('\n⚠️  IMPORTANTE - SEGURANÇA:');
    console.log('   1. NÃO commitar diretórios sem "-anon" no nome');
    console.log('   2. Adicione ao .gitignore:');
    console.log('      __tests__/fixtures/webhook-events/');
    console.log('      __tests__/fixtures/webhook-fixtures/');
    console.log('   3. Use APENAS dados anonimizados em testes');
    
    console.log('\n🏃 Para executar os testes:');
    console.log('   npm test -- __tests__/unit/webhook');
    
    console.log('\n📊 Estatísticas:');
    console.log('   - 15 tipos de eventos cobertos');
    console.log('   - 87 eventos selecionados para testes');
    console.log('   - 133 testes gerados');
    console.log('   - 16 arquivos de teste criados');
    console.log('   - 18.631 campos anonimizados');
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
main();