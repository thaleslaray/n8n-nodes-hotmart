#!/usr/bin/env ts-node

/**
 * Simula eventos da Hotmart para testar o webhook
 * 
 * Uso: npm run webhook:simulate -- --url http://localhost:5678/webhook/xxx/hotmart
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface SimulationConfig {
  webhookUrl: string;
  authToken: string;
  delay: number;
  verbose: boolean;
}

// Templates de eventos baseados na documentação Hotmart
const EVENT_TEMPLATES = {
  PURCHASE_OUT_OF_SHOPPING_CART: {
    event: 'PURCHASE_OUT_OF_SHOPPING_CART',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      cart: {
        id: '{{CART_ID}}',
        creation_date: '{{TIMESTAMP}}',
        abandonment_date: '{{TIMESTAMP}}'
      },
      buyer: {
        email: 'test-{{RANDOM}}@example.com',
        name: 'Test User {{RANDOM}}'
      },
      product: {
        id: 'prod_{{RANDOM}}',
        name: 'Test Product'
      }
    }
  },
  
  PURCHASE_APPROVED: {
    event: 'PURCHASE_APPROVED',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      purchase: {
        transaction: 'HP{{TRANSACTION_ID}}',
        status: 'approved',
        creation_date: '{{TIMESTAMP}}',
        approved_date: '{{TIMESTAMP}}',
        price: {
          value: 99.90,
          currency_code: 'BRL'
        },
        payment: {
          type: 'CREDIT_CARD',
          installments_number: 1
        },
        is_subscription: false
      },
      buyer: {
        email: 'buyer-{{RANDOM}}@example.com',
        name: 'Buyer {{RANDOM}}',
        document: '12345678901'
      },
      product: {
        id: 'prod_{{RANDOM}}',
        name: 'Product {{RANDOM}}'
      },
      producer: {
        name: 'Test Producer'
      }
    }
  },
  
  PURCHASE_COMPLETE: {
    event: 'PURCHASE_COMPLETE',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      purchase: {
        transaction: 'HP{{TRANSACTION_ID}}',
        status: 'complete',
        creation_date: '{{TIMESTAMP}}',
        approved_date: '{{TIMESTAMP}}',
        completion_date: '{{TIMESTAMP}}',
        price: {
          value: 99.90,
          currency_code: 'BRL'
        },
        is_subscription: false
      },
      buyer: {
        email: 'buyer-{{RANDOM}}@example.com',
        name: 'Buyer {{RANDOM}}'
      },
      product: {
        id: 'prod_{{RANDOM}}',
        name: 'Product {{RANDOM}}'
      }
    }
  },
  
  PURCHASE_CANCELED: {
    event: 'PURCHASE_CANCELED',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      purchase: {
        transaction: 'HP{{TRANSACTION_ID}}',
        status: 'canceled',
        cancellation_date: '{{TIMESTAMP}}',
        price: {
          value: 99.90
        }
      },
      buyer: {
        email: 'buyer-{{RANDOM}}@example.com'
      }
    }
  },
  
  SUBSCRIPTION_CANCELLATION: {
    event: 'SUBSCRIPTION_CANCELLATION',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      subscription: {
        subscription_id: 'sub_{{RANDOM}}',
        status: 'CANCELLED',
        cancellation_date: '{{TIMESTAMP}}',
        subscriber: {
          code: 'user_{{RANDOM}}'
        },
        plan: {
          id: 'plan_{{RANDOM}}',
          name: 'Monthly Plan'
        }
      },
      product: {
        id: 'prod_{{RANDOM}}',
        name: 'Subscription Product'
      }
    }
  },
  
  PURCHASE_BILLET_PRINTED: {
    event: 'PURCHASE_BILLET_PRINTED',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      purchase: {
        transaction: 'HP{{TRANSACTION_ID}}',
        status: 'billet_printed',
        payment: {
          type: 'BILLET',
          billet_url: 'https://billet.example.com/{{RANDOM}}',
          billet_barcode: '123456789012345678901234567890123456789012345678',
          due_date: '{{FUTURE_DATE}}'
        },
        price: {
          value: 199.90
        }
      },
      buyer: {
        email: 'buyer-{{RANDOM}}@example.com'
      }
    }
  },
  
  // Simular PIX (usando BILLET_PRINTED com dados PIX)
  PURCHASE_PIX_GENERATED: {
    event: 'PURCHASE_BILLET_PRINTED',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      purchase: {
        transaction: 'HP{{TRANSACTION_ID}}',
        status: 'billet_printed',
        payment: {
          type: 'PIX',
          pix_qrcode: '00020126360014BR.GOV.BCB.PIX0114{{RANDOM}}',
          pix_code: 'pix-{{RANDOM}}',
          due_date: '{{FUTURE_DATE}}'
        },
        price: {
          value: 299.90
        }
      },
      buyer: {
        email: 'buyer-{{RANDOM}}@example.com'
      }
    }
  },
  
  CLUB_FIRST_ACCESS: {
    event: 'CLUB_FIRST_ACCESS',
    hottok: '{{TOKEN}}',
    creation_date: '{{TIMESTAMP}}',
    data: {
      club: {
        id: 'club_{{RANDOM}}',
        access_date: '{{TIMESTAMP}}'
      },
      user: {
        code: 'user_{{RANDOM}}',
        email: 'student-{{RANDOM}}@example.com'
      },
      product: {
        id: 'prod_{{RANDOM}}',
        name: 'Course {{RANDOM}}'
      }
    }
  }
};

// Substituir placeholders
function fillTemplate(template: any, config: SimulationConfig): any {
  const json = JSON.stringify(template);
  const filled = json
    .replace(/{{TOKEN}}/g, config.authToken)
    .replace(/{{TIMESTAMP}}/g, new Date().toISOString())
    .replace(/{{FUTURE_DATE}}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .replace(/{{RANDOM}}/g, () => Math.random().toString(36).substring(7))
    .replace(/{{TRANSACTION_ID}}/g, () => Math.floor(Math.random() * 1000000000).toString())
    .replace(/{{CART_ID}}/g, () => uuidv4());
    
  return JSON.parse(filled);
}

// Simular um evento
async function simulateEvent(
  eventType: string, 
  config: SimulationConfig
): Promise<void> {
  const template = EVENT_TEMPLATES[eventType];
  if (!template) {
    throw new Error(`Template não encontrado para evento: ${eventType}`);
  }
  
  const payload = fillTemplate(template, config);
  
  if (config.verbose) {
    console.log(`\n📤 Enviando ${eventType}:`);
    console.log(JSON.stringify(payload, null, 2));
  }
  
  try {
    const response = await axios.post(config.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hotmart-Webhook-Simulator/1.0'
      },
      timeout: 10000
    });
    
    console.log(`✅ ${eventType}: ${response.status} ${response.statusText}`);
    
    if (config.verbose && response.data) {
      console.log('📥 Resposta:', response.data);
    }
  } catch (error: any) {
    console.error(`❌ ${eventType}: ${error.message}`);
    if (config.verbose && error.response) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

// Simular fluxos completos
async function simulateFlows(config: SimulationConfig): Promise<void> {
  const flows = [
    {
      name: 'Compra Completa',
      events: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
    },
    {
      name: 'Abandono de Carrinho',
      events: ['PURCHASE_OUT_OF_SHOPPING_CART']
    },
    {
      name: 'Compra Cancelada',
      events: ['PURCHASE_APPROVED', 'PURCHASE_CANCELED']
    },
    {
      name: 'Assinatura Cancelada',
      events: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'SUBSCRIPTION_CANCELLATION']
    },
    {
      name: 'Pagamento Boleto',
      events: ['PURCHASE_BILLET_PRINTED']
    },
    {
      name: 'Pagamento PIX',
      events: ['PURCHASE_PIX_GENERATED']
    },
    {
      name: 'Primeiro Acesso',
      events: ['PURCHASE_COMPLETE', 'CLUB_FIRST_ACCESS']
    }
  ];
  
  for (const flow of flows) {
    console.log(`\n🔄 Simulando fluxo: ${flow.name}`);
    console.log('━'.repeat(50));
    
    for (const event of flow.events) {
      await simulateEvent(event, config);
      
      if (config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  // Parse argumentos
  const config: SimulationConfig = {
    webhookUrl: '',
    authToken: 'test-token-123',
    delay: 1000,
    verbose: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
      case '-u':
        config.webhookUrl = args[++i];
        break;
      case '--token':
      case '-t':
        config.authToken = args[++i];
        break;
      case '--delay':
      case '-d':
        config.delay = parseInt(args[++i]);
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Simulador de Eventos Hotmart

Uso: npm run webhook:simulate -- [opções]

Opções:
  --url, -u <url>      URL do webhook (obrigatório)
  --token, -t <token>  Token de autenticação (padrão: test-token-123)
  --delay, -d <ms>     Delay entre eventos em ms (padrão: 1000)
  --verbose, -v        Mostrar payloads completos
  --help, -h           Mostrar esta ajuda

Exemplos:
  npm run webhook:simulate -- --url http://localhost:5678/webhook/xxx/hotmart
  npm run webhook:simulate -- -u http://localhost:5678/webhook/xxx -t meu-token -v
        `);
        process.exit(0);
    }
  }
  
  if (!config.webhookUrl) {
    console.error('❌ URL do webhook é obrigatória! Use --url <url>');
    process.exit(1);
  }
  
  console.log(`
🎮 Simulador de Eventos Hotmart
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: ${config.webhookUrl}
🔑 Token: ${config.authToken}
⏱️  Delay: ${config.delay}ms
🔊 Verbose: ${config.verbose ? 'Sim' : 'Não'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // Menu
  console.log('Escolha uma opção:\n');
  console.log('1. Simular todos os fluxos');
  console.log('2. Simular evento específico');
  console.log('3. Simular apenas abandono de carrinho');
  console.log('4. Stress test (100 eventos)');
  console.log('0. Sair\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Opção: ', async (answer) => {
    readline.close();
    
    switch (answer) {
      case '1':
        await simulateFlows(config);
        break;
        
      case '2':
        console.log('\nEventos disponíveis:');
        Object.keys(EVENT_TEMPLATES).forEach((event, index) => {
          console.log(`${index + 1}. ${event}`);
        });
        
        const rl2 = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl2.question('\nNúmero do evento: ', async (eventNum) => {
          rl2.close();
          const events = Object.keys(EVENT_TEMPLATES);
          const selectedEvent = events[parseInt(eventNum) - 1];
          
          if (selectedEvent) {
            await simulateEvent(selectedEvent, config);
          } else {
            console.error('❌ Evento inválido!');
          }
        });
        break;
        
      case '3':
        await simulateEvent('PURCHASE_OUT_OF_SHOPPING_CART', config);
        break;
        
      case '4':
        console.log('\n🚀 Iniciando stress test...');
        const events = Object.keys(EVENT_TEMPLATES);
        
        for (let i = 0; i < 100; i++) {
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          await simulateEvent(randomEvent, { ...config, verbose: false });
          
          if (i % 10 === 0) {
            console.log(`📊 Progresso: ${i}/100`);
          }
        }
        console.log('\n✅ Stress test concluído!');
        break;
        
      case '0':
        console.log('👋 Até logo!');
        process.exit(0);
        
      default:
        console.error('❌ Opção inválida!');
    }
    
    console.log('\n✨ Simulação concluída!');
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}