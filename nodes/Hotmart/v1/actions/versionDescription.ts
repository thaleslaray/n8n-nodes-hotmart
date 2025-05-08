import { type INodeTypeDescription } from 'n8n-workflow';

import * as subscription from './subscription/Subscription.resource';
import * as sales from './sales/Sales.resource';
import * as product from './product/Product.resource';
import * as coupon from './coupon/Coupon.resource';
import * as club from './club/Club.resource';
import * as tickets from './tickets/Tickets.resource';

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
	icon: 'file:icons/hotmart.svg',
	group: ['transform'],
	// Criando discrepância para prevenir injeção de Custom API Call
	version: [1, 2],  // Suportamos versões 1 e 2 da API
	defaultVersion: 1, // Mas a versão padrão é a 1
	subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
	description: 'Interagir com a API Hotmart',
	defaults: {
		name: 'Hotmart',
	},
	inputs: ['main'],
	outputs: ['main'],
	credentials: [
		{
			name: 'hotmartOAuth2Api',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Recurso',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Assinatura',
					value: 'subscription',
				},
				{
					name: 'Vendas',
					value: 'sales',
				},
				{
					name: 'Produto',
					value: 'product',
				},
				{
					name: 'Cupom',
					value: 'coupon',
				},
				{
					name: 'Club',
					value: 'club',
				},
				{
					name: 'Ingressos',
					value: 'tickets',
				},
			],
			default: 'subscription',
		},
		{
			displayName: 'Operação',
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
					action: 'Get all subscriptions',
				},
				{
					name: 'Sumário de Assinaturas',
					value: 'getSummary',
					description: 'Obtém dados sumarizados das assinaturas',
					action: 'Get subscription summary',
				},
				{
					name: 'Transações de Assinatura',
					value: 'getTransactions',
					description: 'Listar transações de assinatura detalhadas',
					action: 'Get subscription transactions',
				},
				{
					name: 'Obter Compras de Assinantes',
					value: 'getPurchases',
					description: 'Listar compras de uma assinatura',
					action: 'Get purchases of a subscription',
				},
				{
					name: 'Cancelar Assinatura',
					value: 'cancel',
					description: 'Cancela uma assinatura',
					action: 'Cancel a subscription',
				},
				{
					name: 'Cancelar Lista de Assinaturas',
					value: 'cancelList',
					description: 'Cancela múltiplas assinaturas',
					action: 'Cancel multiple subscriptions',
				},
				{
					name: 'Reativar e Cobrar Assinatura',
					value: 'reactivate',
					description: 'Reativa e cobra uma assinatura cancelada',
					action: 'Reactivate and charge a subscription',
				},
				{
					name: 'Reativar e Cobrar Lista de Assinaturas',
					value: 'reactivateList',
					description: 'Reativa e cobra múltiplas assinaturas',
					action: 'Reactivate and charge multiple subscriptions',
				},
				{
					name: 'Alterar Dia de Cobrança',
					value: 'changeBillingDate',
					description: 'Altera o dia de cobrança de uma assinatura',
					action: 'Change billing date of a subscription',
				},
			],
			default: 'getAll',
		},
		{
			displayName: 'Operação',
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
					action: 'List all products',
				},
			],
			default: 'getAll',
		},
		{
			displayName: 'Operação',
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
					action: 'Create a coupon',
				},
				{
					name: 'Excluir Cupom',
					value: 'delete',
					description: 'Excluir um cupom',
					action: 'Delete a coupon',
				},
				{
					name: 'Obter Cupom',
					value: 'get',
					description: 'Obter informações de um cupom',
					action: 'Get coupon info',
				},
				{
					name: 'Listar Cupons',
					value: 'getAll',
					description: 'Listar todos os cupons',
					action: 'List all coupons',
				},
			],
			default: 'create',
		},
		{
			displayName: 'Operação',
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
					name: 'Listar Alunos',
					value: 'getAll',
					description: 'Listar todos os alunos',
					action: 'List all students',
				},
				{
					name: 'Listar Módulos',
					value: 'getModules',
					description: 'Listar todos os módulos',
					action: 'List all modules',
				},
				{
					name: 'Obter Progresso do Aluno',
					value: 'getProgress',
					description: 'Obter progresso de um aluno',
					action: 'Get student progress',
				},
				{
					name: 'Listar Páginas do Módulo',
					value: 'getPages',
					description: 'Listar páginas de um módulo',
					action: 'List module pages',
				},
			],
			default: 'getAll',
		},
		{
			displayName: 'Operação',
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
					description: 'Obtém o histórico de vendas',
					action: 'Get sales history',
				},
				{
					name: 'Comissões de Vendas',
					value: 'getComissoesVendas',
					description: 'Obtém as comissões de vendas',
					action: 'Get sales commissions',
				},
				{
					name: 'Resumo de Vendas',
					value: 'getResumoVendas',
					description: 'Obtém um resumo das vendas',
					action: 'Get sales summary',
				},
				{
					name: 'Participantes de Vendas',
					value: 'getParticipantesVendas',
					description: 'Obtém os participantes das vendas',
					action: 'Get sales participants',
				},
				{
					name: 'Detalhamento de Preços',
					value: 'getDetalhamentoPrecos',
					description: 'Obtém detalhamento dos preços das vendas',
					action: 'Get price details',
				},
				{
					name: 'Solicitar Reembolso',
					value: 'solicitarReembolso',
					description: 'Solicita reembolso de uma venda',
					action: 'Request refund',
				},
			],
			default: 'getHistoricoVendas',
		},
		{
			displayName: 'Operação',
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
					action: 'List all tickets',
				},
				{
					name: 'Informações do Evento',
					value: 'getInfo',
					description: 'Obter informações de um evento',
					action: 'Get event information',
				},
			],
			default: 'getAll',
		},
		...subscription.description,
		...sales.description,
		...product.description,
		...coupon.description,
		...club.description,
		...tickets.description,
	],
};
