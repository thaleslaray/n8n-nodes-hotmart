#!/usr/bin/env ts-node

/**
 * Gerador de Fixtures para Testes
 * 
 * Seleciona eventos representativos de cada tipo para criar fixtures de teste
 */

import * as fs from 'fs';
import * as path from 'path';

interface EventSelection {
  eventType: string;
  totalEvents: number;
  selectedCount: number;
  selectionStrategy: 'all' | 'sample' | 'edge-cases';
}

interface FixtureGeneratorConfig {
  inputDir: string;
  outputDir: string;
  maxEventsPerType: number;
  includeEdgeCases: boolean;
}

export class FixtureGenerator {
  private config: FixtureGeneratorConfig;
  
  constructor(config: FixtureGeneratorConfig) {
    this.config = config;
  }

  /**
   * Gera fixtures baseado nos eventos parseados
   */
  async generateFixtures(): Promise<void> {
    console.log('🎯 Iniciando geração de fixtures...');
    
    // Ler estatísticas
    const statsPath = path.join(this.config.inputDir, 'parsing-stats.json');
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    
    // Criar diretório de saída
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    const selections: EventSelection[] = [];
    
    // Processar cada tipo de evento
    for (const [eventType, count] of Object.entries(stats.eventTypes)) {
      const selection = await this.selectEventsForType(
        eventType, 
        count as number
      );
      selections.push(selection);
    }
    
    // Adicionar eventos mockados para tipos faltantes
    await this.addMockedEvents();
    
    // Salvar resumo da seleção
    this.saveSelectionSummary(selections);
    
    console.log('\n✅ Geração de fixtures concluída!');
  }

  /**
   * Seleciona eventos representativos para um tipo
   */
  private async selectEventsForType(
    eventType: string, 
    totalCount: number
  ): Promise<EventSelection> {
    const filename = `${eventType.toLowerCase().replace(/_/g, '-')}.json`;
    const eventsPath = path.join(this.config.inputDir, 'parsed-events', filename);
    
    // Ler todos os eventos deste tipo
    const allEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
    
    let selectedEvents: any[] = [];
    let strategy: 'all' | 'sample' | 'edge-cases';
    
    if (totalCount <= 5) {
      // Se tem poucos eventos, usar todos
      selectedEvents = allEvents;
      strategy = 'all';
    } else if (totalCount <= 20) {
      // Se tem quantidade moderada, selecionar ~50%
      selectedEvents = this.selectSample(allEvents, Math.ceil(totalCount / 2));
      strategy = 'sample';
    } else {
      // Se tem muitos eventos, aplicar estratégia de amostragem estatística
      const sampleSize = Math.min(this.config.maxEventsPerType, Math.ceil(Math.sqrt(totalCount)));
      selectedEvents = this.selectStatisticalSample(allEvents, sampleSize);
      strategy = 'edge-cases';
    }
    
    // Salvar fixtures selecionadas
    const outputDir = path.join(this.config.outputDir, eventType.toLowerCase().replace(/_/g, '-'));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    selectedEvents.forEach((event, index) => {
      const outputPath = path.join(outputDir, `${index + 1}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(event, null, 2));
    });
    
    console.log(`   📁 ${eventType}: ${selectedEvents.length}/${totalCount} eventos selecionados (${strategy})`);
    
    return {
      eventType,
      totalEvents: totalCount,
      selectedCount: selectedEvents.length,
      selectionStrategy: strategy
    };
  }

  /**
   * Seleciona uma amostra simples
   */
  private selectSample(events: any[], sampleSize: number): any[] {
    const step = Math.floor(events.length / sampleSize);
    const selected: any[] = [];
    
    for (let i = 0; i < events.length; i += step) {
      if (selected.length < sampleSize) {
        selected.push(events[i]);
      }
    }
    
    return selected;
  }

  /**
   * Seleciona amostra estatística incluindo edge cases
   */
  private selectStatisticalSample(events: any[], sampleSize: number): any[] {
    const selected: any[] = [];
    
    // Sempre incluir primeiro e último (edge cases temporais)
    selected.push(events[0]);
    if (events.length > 1) {
      selected.push(events[events.length - 1]);
    }
    
    // Analisar campos para identificar edge cases
    const edgeCases = this.findEdgeCases(events);
    selected.push(...edgeCases.slice(0, Math.floor(sampleSize / 3)));
    
    // Preencher o restante com amostra aleatória
    const remainingSize = sampleSize - selected.length;
    const randomSample = this.getRandomSample(
      events.filter(e => !selected.includes(e)), 
      remainingSize
    );
    selected.push(...randomSample);
    
    return selected.slice(0, sampleSize);
  }

  /**
   * Identifica edge cases nos eventos
   */
  private findEdgeCases(events: any[]): any[] {
    const edgeCases: any[] = [];
    
    // Procurar por valores extremos em campos numéricos
    const numericFields = ['price', 'commission', 'fee', 'value'];
    
    for (const field of numericFields) {
      const eventsWithField = events.filter(e => 
        e.data && typeof e.data[field] === 'number'
      );
      
      if (eventsWithField.length > 0) {
        // Menor valor
        const minEvent = eventsWithField.reduce((min, e) => 
          e.data[field] < min.data[field] ? e : min
        );
        edgeCases.push(minEvent);
        
        // Maior valor
        const maxEvent = eventsWithField.reduce((max, e) => 
          e.data[field] > max.data[field] ? e : max
        );
        if (maxEvent !== minEvent) {
          edgeCases.push(maxEvent);
        }
      }
    }
    
    // Procurar por arrays vazios ou muito grandes
    const arrayFields = ['items', 'subscriptions', 'commissions'];
    
    for (const field of arrayFields) {
      const eventsWithArray = events.filter(e => 
        e.data && Array.isArray(e.data[field])
      );
      
      if (eventsWithArray.length > 0) {
        // Array vazio
        const emptyArray = eventsWithArray.find(e => e.data[field].length === 0);
        if (emptyArray) edgeCases.push(emptyArray);
        
        // Array mais longo
        const longestArray = eventsWithArray.reduce((longest, e) => 
          e.data[field].length > longest.data[field].length ? e : longest
        );
        edgeCases.push(longestArray);
      }
    }
    
    // Remover duplicatas
    return Array.from(new Set(edgeCases));
  }

  /**
   * Seleciona amostra aleatória
   */
  private getRandomSample(events: any[], size: number): any[] {
    const shuffled = [...events].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  /**
   * Adiciona eventos mockados para tipos faltantes
   */
  private async addMockedEvents(): Promise<void> {
    const mockedTypes = ['PURCHASE_EXPIRED', 'SWITCH_PLAN'];
    
    for (const eventType of mockedTypes) {
      const mockPath = path.join(
        __dirname, 
        '../../__tests__/fixtures/webhook-mocks',
        `${eventType.toLowerCase().replace(/_/g, '-')}.json`
      );
      
      if (fs.existsSync(mockPath)) {
        const mockEvent = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
        
        const outputDir = path.join(this.config.outputDir, eventType.toLowerCase().replace(/_/g, '-'));
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, '1.json');
        fs.writeFileSync(outputPath, JSON.stringify(mockEvent, null, 2));
        
        console.log(`   🎭 ${eventType}: 1 evento mockado adicionado`);
      }
    }
  }

  /**
   * Salva resumo da seleção
   */
  private saveSelectionSummary(selections: EventSelection[]): void {
    const summary = {
      generatedAt: new Date().toISOString(),
      totalEventTypes: selections.length + 2, // +2 para os mockados
      totalSelectedEvents: selections.reduce((sum, s) => sum + s.selectedCount, 0) + 2,
      selections: selections,
      mockedEvents: ['PURCHASE_EXPIRED', 'SWITCH_PLAN'],
      config: {
        maxEventsPerType: this.config.maxEventsPerType,
        includeEdgeCases: this.config.includeEdgeCases
      }
    };
    
    const summaryPath = path.join(this.config.outputDir, 'fixture-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`\n📋 Resumo salvo em: ${summaryPath}`);
    console.log(`   Total de tipos de eventos: ${summary.totalEventTypes}`);
    console.log(`   Total de eventos selecionados: ${summary.totalSelectedEvents}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const config: FixtureGeneratorConfig = {
    inputDir: path.join(__dirname, '../../__tests__/fixtures/webhook-events'),
    outputDir: path.join(__dirname, '../../__tests__/fixtures/webhook-fixtures'),
    maxEventsPerType: 10, // Máximo de eventos por tipo para testes
    includeEdgeCases: true
  };
  
  const generator = new FixtureGenerator(config);
  generator.generateFixtures()
    .then(() => {
      console.log('\n✨ Fixtures geradas com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao gerar fixtures:', error);
      process.exit(1);
    });
}