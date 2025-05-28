#!/usr/bin/env ts-node

/**
 * Script para capturar eventos reais do webhook Hotmart
 * 
 * Uso:
 * 1. npm run webhook:capture:start
 * 2. Configurar URL no painel Hotmart
 * 3. Executar ações para gerar eventos
 * 4. npm run webhook:capture:stop
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const app = express();
app.use(express.json());

const CAPTURE_DIR = path.join(__dirname, '../__tests__/fixtures/webhook-payloads');
const LOG_FILE = path.join(CAPTURE_DIR, 'capture-log.json');

// Garantir que o diretório existe
if (!fs.existsSync(CAPTURE_DIR)) {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
}

// Log de captura
interface CaptureLog {
  startedAt: string;
  events: Array<{
    timestamp: string;
    event: string;
    hash: string;
    filename: string;
  }>;
  stats: {
    [event: string]: number;
  };
}

let captureLog: CaptureLog = {
  startedAt: new Date().toISOString(),
  events: [],
  stats: {}
};

// Carregar log existente se houver
if (fs.existsSync(LOG_FILE)) {
  captureLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
}

// Endpoint de captura
app.post('/webhook/capture/hotmart', (req, res) => {
  const payload = req.body;
  const event = payload.event || 'UNKNOWN';
  const timestamp = new Date().toISOString();
  
  console.log(`📥 Capturando evento: ${event}`);
  
  // Gerar hash único para detectar duplicatas
  const payloadHash = createHash('md5')
    .update(JSON.stringify(payload))
    .digest('hex')
    .substring(0, 8);
  
  // Nome do arquivo
  const filename = `${event.toLowerCase()}-${timestamp.split('T')[0]}-${payloadHash}.json`;
  const filepath = path.join(CAPTURE_DIR, filename);
  
  // Salvar payload
  fs.writeFileSync(filepath, JSON.stringify(payload, null, 2));
  
  // Atualizar log
  captureLog.events.push({
    timestamp,
    event,
    hash: payloadHash,
    filename
  });
  
  // Atualizar estatísticas
  captureLog.stats[event] = (captureLog.stats[event] || 0) + 1;
  
  // Salvar log
  fs.writeFileSync(LOG_FILE, JSON.stringify(captureLog, null, 2));
  
  console.log(`✅ Evento salvo: ${filename}`);
  console.log(`📊 Total capturado: ${captureLog.events.length} eventos`);
  
  // Responder ao webhook
  res.status(200).json({ 
    status: 'captured',
    event,
    hash: payloadHash
  });
});

// Endpoint de status
app.get('/webhook/capture/status', (req, res) => {
  const uptime = Date.now() - new Date(captureLog.startedAt).getTime();
  const uptimeMinutes = Math.floor(uptime / 60000);
  
  res.json({
    status: 'capturing',
    startedAt: captureLog.startedAt,
    uptime: `${uptimeMinutes} minutos`,
    totalEvents: captureLog.events.length,
    uniqueEvents: Object.keys(captureLog.stats).length,
    stats: captureLog.stats,
    recentEvents: captureLog.events.slice(-10).reverse()
  });
});

// Iniciar servidor
const PORT = process.env.CAPTURE_PORT || 3456;
const server = app.listen(PORT, () => {
  console.log(`
🎯 Servidor de Captura Iniciado!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 URL do Webhook: http://localhost:${PORT}/webhook/capture/hotmart
📊 Status: http://localhost:${PORT}/webhook/capture/status

📝 Configure esta URL no painel da Hotmart:
   1. Acesse: https://app.hotmart.com/webhooks
   2. Crie novo webhook com a URL acima
   3. Selecione TODOS os eventos
   4. Use qualquer token (será aceito)

🎬 Ações para gerar eventos:
   - Criar uma compra teste
   - Aprovar pagamento
   - Cancelar compra
   - Criar assinatura
   - Cancelar assinatura
   - Abandonar carrinho
   - etc...

💾 Eventos serão salvos em:
   ${CAPTURE_DIR}

⏹️  Para parar: Ctrl+C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando captura...');
  
  const summary = {
    captureSession: {
      startedAt: captureLog.startedAt,
      endedAt: new Date().toISOString(),
      duration: `${captureLog.events.length} eventos capturados`
    },
    stats: captureLog.stats,
    files: captureLog.events.map(e => e.filename)
  };
  
  const summaryFile = path.join(CAPTURE_DIR, `capture-summary-${Date.now()}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log(`\n📊 Resumo da captura salvo em: ${summaryFile}`);
  console.log('\n📈 Estatísticas:');
  Object.entries(captureLog.stats).forEach(([event, count]) => {
    console.log(`   ${event}: ${count} eventos`);
  });
  
  server.close(() => {
    console.log('\n✅ Captura finalizada com sucesso!');
    process.exit(0);
  });
});