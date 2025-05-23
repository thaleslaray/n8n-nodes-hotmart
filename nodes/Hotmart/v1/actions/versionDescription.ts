import { type INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';

import * as subscription from './subscription/Subscription.resource';
import * as sales from './sales/Sales.resource';
import * as product from './product/Product.resource';
import * as coupon from './coupon/Coupon.resource';
import * as club from './club/Club.resource';
import * as tickets from './tickets/Tickets.resource';
import * as negotiate from './negotiate/Negotiate.resource';

/**
 * IMPORTANTE: Prevenção da injeção de "Custom API Call"
 *
 * O n8n injeta automaticamente a opção "Custom API Call" em nós considerados
 * "versão mais recente", que são definidos pela seguinte condição:
 * node.defaultVersion === undefined || node.defaultVersion === node.version
 *
 * Para prevenir esta injeção, criamos intencionalmente uma discrepância entre
 * version e defaultVersion. Usamos version: [1, 2] e defaultVersion: 1
 * para evitar que o nó seja considerado "versão mais recente".
 *
 * Adicionalmente, mantemos proteções de backup:
 * 1. Tratamento no router.ts para interceptar tentativas de uso da opção
 * 2. Uma implementação vazia em customApiCall.operation.ts
 *
 * Esta abordagem explora um detalhe de implementação interna do n8n e pode
 * precisar ser revisitada após atualizações futuras da plataforma.
 */

export const versionDescription: INodeTypeDescription = {
  displayName: 'Hotmart',
  name: 'hotmart',
  icon: 'file:hotmart.svg',
  group: ['transform'],
  // Criando discrepância para prevenir injeção de Custom API Call
  version: [1, 2], // Suportamos versões 1 e 2 da API
  defaultVersion: 1, // Mas a versão padrão é a 1
  subtitle:
    '={{ $parameter["resource"] === "product" ? "Produtos - Listar Produtos" : $parameter["resource"] === "subscription" && $parameter["operation"] === "getAll" ? "Assinaturas - Obter Assinaturas" : $parameter["resource"] === "subscription" && $parameter["operation"] === "getSummary" ? "Assinaturas - Sumário de Assinaturas" : $parameter["resource"] === "subscription" && $parameter["operation"] === "getTransactions" ? "Assinaturas - Transações de Assinatura" : $parameter["resource"] === "subscription" && $parameter["operation"] === "getPurchases" ? "Assinaturas - Compras de Assinantes" : $parameter["resource"] === "subscription" && $parameter["operation"] === "cancel" ? "Assinaturas - Cancelar Assinatura" : $parameter["resource"] === "subscription" && $parameter["operation"] === "cancelList" ? "Assinaturas - Cancelar Lista de Assinaturas" : $parameter["resource"] === "subscription" && $parameter["operation"] === "reactivate" ? "Assinaturas - Reativar Assinatura" : $parameter["resource"] === "subscription" && $parameter["operation"] === "reactivateList" ? "Assinaturas - Reativar Lista de Assinaturas" : $parameter["resource"] === "subscription" && $parameter["operation"] === "changeBillingDate" ? "Assinaturas - Alterar dia de Cobrança" : $parameter["resource"] === "sales" && $parameter["operation"] === "getHistoricoVendas" ? "Vendas - Histórico de Vendas" : $parameter["resource"] === "sales" && $parameter["operation"] === "getComissoesVendas" ? "Vendas - Comissões de Vendas" : $parameter["resource"] === "sales" && $parameter["operation"] === "getResumoVendas" ? "Vendas - Sumário de Vendas" : $parameter["resource"] === "sales" && $parameter["operation"] === "getParticipantesVendas" ? "Vendas - Participantes de Vendas" : $parameter["resource"] === "sales" && $parameter["operation"] === "getDetalhamentoPrecos" ? "Vendas - Detalhamento de Preços" : $parameter["resource"] === "sales" && $parameter["operation"] === "solicitarReembolso" ? "Vendas - Solicitar Reembolso" : $parameter["resource"] === "coupon" && $parameter["operation"] === "create" ? "Cupons - Criar Cupom" : $parameter["resource"] === "coupon" && $parameter["operation"] === "delete" ? "Cupons - Excluir Cupom" : $parameter["resource"] === "coupon" && $parameter["operation"] === "get" ? "Cupons - Obter Cupom" : $parameter["resource"] === "club" && $parameter["operation"] === "getModules" ? "Club - Obter Módulos" : $parameter["resource"] === "club" && $parameter["operation"] === "getPages" ? "Club - Obter Páginas" : $parameter["resource"] === "club" && $parameter["operation"] === "getAll" ? "Club - Obter Alunos" : $parameter["resource"] === "club" && $parameter["operation"] === "getProgress" ? "Club - Progresso do Aluno" : $parameter["resource"] === "tickets" && $parameter["operation"] === "getAll" ? "Eventos - Lista de Ingressos e Participantes" : $parameter["resource"] === "tickets" && $parameter["operation"] === "getInfo" ? "Eventos - Informações do Evento" : $parameter["resource"] === "negotiate" && $parameter["operation"] === "generateNegotiation" ? "Negociação - Gerar Negociação" : $parameter["name"] }}',
  description: 'Interagir com a API Hotmart',
  defaults: {
    name: 'Hotmart',
  },
  // AI Ready - Torna o nó disponível para AI Agents
  usableAsTool: true,
  inputs: [NodeConnectionTypes.Main],
  outputs: [NodeConnectionTypes.Main],
  credentials: [
    {
      name: 'hotmartOAuth2Api',
      required: true,
    },
  ],
  properties: [
    {
      displayName: 'AI Metadata',
      name: '_aiMetadata',
      type: 'hidden',
      default: {
        version: '1.0',
        capabilities: [
          'sales_management',
          'subscription_management',
          'product_listing',
          'coupon_creation',
          'member_area_access',
          'event_ticketing',
          'payment_negotiation'
        ],
        aiReady: true,
        supportedOperations: 26,
        apiVersion: 'v1'
      },
    },
    {
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options: [
        {
          name: 'Assinaturas',
          value: 'subscription',
        },
        {
          name: 'Vendas',
          value: 'sales',
        },
        {
          name: 'Produtos',
          value: 'product',
        },
        {
          name: 'Cupons de Desconto',
          value: 'coupon',
        },
        {
          name: 'Área de Membros',
          value: 'club',
        },
        {
          name: 'Ingressos para Eventos',
          value: 'tickets',
        },
        {
          name: 'Negociação de Parcelas',
          value: 'negotiate',
        },
      ],
      default: 'subscription',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['subscription'],
        },
      },
      options: [
        {
          name: 'Obter Assinaturas',
          value: 'getAll',
          description: 'Listar todas as assinaturas',
          action: 'Obter Assinaturas',
        },
        {
          name: 'Sumário de Assinaturas',
          value: 'getSummary',
          description: 'Obtém dados sumarizados das assinaturas',
          action: 'Sumário de Assinaturas',
        },
        {
          name: 'Transações de Assinatura',
          value: 'getTransactions',
          description: 'Listar transações de assinatura detalhadas',
          action: 'Transações de Assinatura',
        },
        {
          name: 'Obter Compras de Assinantes',
          value: 'getPurchases',
          description: 'Listar compras de uma assinatura',
          action: 'Obter Compras de Assinantes',
        },
        {
          name: 'Cancelar Assinatura',
          value: 'cancel',
          description: 'Cancela uma assinatura',
          action: 'Cancelar Assinatura',
        },
        {
          name: 'Cancelar Lista de Assinaturas',
          value: 'cancelList',
          description: 'Cancela múltiplas assinaturas',
          action: 'Cancelar Lista de Assinaturas',
        },
        {
          name: 'Reativar e Cobrar Assinatura',
          value: 'reactivate',
          description: 'Reativa e cobra uma assinatura cancelada',
          action: 'Reativar e Cobrar Assinatura',
        },
        {
          name: 'Reativar Lista de Assinaturas',
          value: 'reactivateList',
          description: 'Reativa e cobra múltiplas assinaturas',
          action: 'Reativar Lista de Assinaturas',
        },
        {
          name: 'Alterar dia de Cobrança',
          value: 'changeBillingDate',
          description: 'Altera o dia de cobrança de uma assinatura',
          action: 'Alterar dia de Cobrança',
        },
      ],
      default: 'getAll',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['product'],
        },
      },
      options: [
        {
          name: 'Listar Produtos',
          value: 'getAll',
          description: 'Listar todos os produtos',
          action: 'Listar Produtos',
        },
      ],
      default: 'getAll',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['coupon'],
        },
      },
      options: [
        {
          name: 'Criar Cupom',
          value: 'create',
          description: 'Criar um novo cupom',
          action: 'Criar Cupom',
        },
        {
          name: 'Excluir Cupom',
          value: 'delete',
          description: 'Excluir um cupom',
          action: 'Excluir Cupom',
        },
        {
          name: 'Obter Cupom',
          value: 'get',
          description: 'Obter informações de um cupom',
          action: 'Obter Cupom',
        },
      ],
      default: 'create',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['club'],
        },
      },
      options: [
        {
          name: 'Obter Módulos',
          value: 'getModules',
          description: 'Obter todos os módulos',
          action: 'Obter Módulos',
        },
        {
          name: 'Obter Páginas',
          value: 'getPages',
          description: 'Obter páginas de um módulo',
          action: 'Obter Páginas',
        },
        {
          name: 'Obter Alunos',
          value: 'getAll',
          description: 'Obter todos os alunos',
          action: 'Obter Alunos',
        },
        {
          name: 'Obter o Progresso do Aluno',
          value: 'getProgress',
          description: 'Obter progresso de um aluno',
          action: 'Obter o Progresso do Aluno',
        },
      ],
      default: 'getModules',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['sales'],
        },
      },
      options: [
        {
          name: 'Histórico de Vendas',
          value: 'getHistoricoVendas',
          description: 'Lista completa de todas as vendas realizadas com filtros avançados por período, produto, status e muito mais',
          action: 'Histórico de Vendas',
        },
        {
          name: 'Comissões de Vendas',
          value: 'getComissoesVendas',
          description: 'Relatório detalhado de comissões ganhas como produtor, afiliado ou co-produtor',
          action: 'Comissões de Vendas',
        },
        {
          name: 'Sumário de Vendas',
          value: 'getResumoVendas',
          description: 'Métricas consolidadas e KPIs de vendas para análise de performance e dashboards',
          action: 'Sumário de Vendas',
        },
        {
          name: 'Participantes de Vendas',
          value: 'getParticipantesVendas',
          description: 'Identifica todos os envolvidos em cada venda: produtores, afiliados e co-produtores',
          action: 'Participantes de Vendas',
        },
        {
          name: 'Detalhamento de Preços',
          value: 'getDetalhamentoPrecos',
          description: 'Breakdown completo de valores: preço bruto, taxas, impostos e valor líquido recebido',
          action: 'Detalhamento de Preços',
        },
        {
          name: 'Solicitar Reembolso',
          value: 'solicitarReembolso',
          description: '⚠️ Processa reembolso de uma venda (ação irreversível - requer confirmação)',
          action: 'Solicitar Reembolso',
        },
      ],
      default: 'getHistoricoVendas',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['tickets'],
        },
      },
      options: [
        {
          name: 'Lista de Ingressos e Participantes',
          value: 'getAll',
          description: 'Listar ingressos e participantes de um evento',
          action: 'Lista de Ingressos e Participantes',
        },
        {
          name: 'Informações do Evento',
          value: 'getInfo',
          description: 'Obter informações de um evento',
          action: 'Informações do Evento',
        },
      ],
      default: 'getAll',
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: ['negotiate'],
        },
      },
      options: [
        {
          name: 'Gerar Negociação',
          value: 'generateNegotiation',
          description: 'Gerar uma negociação para pagamento de parcelas',
          action: 'Gerar Negociação',
        },
      ],
      default: 'generateNegotiation',
    },
    ...subscription.description,
    ...sales.description,
    ...product.description,
    ...coupon.description,
    ...club.description,
    ...tickets.description,
    ...negotiate.description,
  ],
};
