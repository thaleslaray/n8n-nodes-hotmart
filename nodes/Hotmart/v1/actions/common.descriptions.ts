import { INodeProperties } from 'n8n-workflow';

// Descrições comuns que podem ser reutilizadas em vários recursos
export const returnAllOption: INodeProperties = {
	displayName: 'Retornar Todos os Resultados',
	name: 'returnAll',
	type: 'boolean',
	default: false,
	description: 'Se ativado, buscará automaticamente todos os registros em todas as páginas',
};

export const limitOption: INodeProperties = {
	displayName: 'Máximo de Resultados',
	name: 'limit',
	type: 'number',
	default: 50,
	description: 'Número máximo de resultados a serem retornados',
	typeOptions: {
		minValue: 1,
	},
	displayOptions: {
		show: {
			returnAll: [false],
		},
	},
};

export const maxResultsOption: INodeProperties = {
	displayName: 'Resultados Por Página',
	name: 'maxResults',
	type: 'number',
	typeOptions: {
		minValue: 1,
		maxValue: 500,
	},
	default: 500,
	description: 'Quantos resultados buscar por requisição (1-500, padrão: 500 para máxima eficiência)',
};

export const dateRangeOptions: INodeProperties[] = [
	{
		displayName: 'Data Inicial',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		description: 'Filtrar por data inicial',
	},
	{
		displayName: 'Data Final',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'Filtrar por data final',
	},
];

export const productIdOption: INodeProperties = {
	displayName: 'ID do Produto',
	name: 'productId',
	type: 'string',
	default: '',
	description: 'Filtrar por ID do produto',
};

export const subscriptionStatusOptions = [
	{
		name: 'Iniciada',
		value: 'STARTED',
	},
	{
		name: 'Inativa',
		value: 'INACTIVE',
	},
	{
		name: 'Ativa',
		value: 'ACTIVE',
	},
	{
		name: 'Atrasada',
		value: 'DELAYED',
	},
	{
		name: 'Cancelada pelo Administrador',
		value: 'CANCELLED_BY_ADMIN',
	},
	{
		name: 'Cancelada pelo Cliente',
		value: 'CANCELLED_BY_CUSTOMER',
	},
	{
		name: 'Cancelada pelo Vendedor',
		value: 'CANCELLED_BY_SELLER',
	},
	{
		name: 'Vencida',
		value: 'OVERDUE',
	},
];

export const transactionStatusOptions = [
	{
		name: 'Aprovada',
		value: 'APPROVED',
	},
	{
		name: 'Bloqueada',
		value: 'BLOCKED',
	},
	{
		name: 'Cancelada',
		value: 'CANCELLED',
	},
	{
		name: 'Estornada (Chargeback)',
		value: 'CHARGEBACK',
	},
	{
		name: 'Completa',
		value: 'COMPLETE',
	},
	{
		name: 'Expirada',
		value: 'EXPIRED',
	},
	{
		name: 'Sem Fundos',
		value: 'NO_FUNDS',
	},
	{
		name: 'Atrasada',
		value: 'OVERDUE',
	},
	{
		name: 'Parcialmente Reembolsada',
		value: 'PARTIALLY_REFUNDED',
	},
	{
		name: 'Pré-Venda',
		value: 'PRE_ORDER',
	},
	{
		name: 'Boleto Gerado',
		value: 'PRINTED_BILLET',
	},
	{
		name: 'Processando Transação',
		value: 'PROCESSING_TRANSACTION',
	},
	{
		name: 'Protestada',
		value: 'PROTESTED',
	},
	{
		name: 'Reembolsada',
		value: 'REFUNDED',
	},
	{
		name: 'Iniciada',
		value: 'STARTED',
	},
	{
		name: 'Em Análise',
		value: 'UNDER_ANALISYS',
	},
	{
		name: 'Aguardando Pagamento',
		value: 'WAITING_PAYMENT',
	},
];

export const paymentTypeOptions = [
	{ name: 'Boleto', value: 'BILLET' },
	{ name: 'Pagamento em Dinheiro', value: 'CASH_PAYMENT' },
	{ name: 'Cartão de Crédito', value: 'CREDIT_CARD' },
	{ name: 'Transferência Bancária', value: 'DIRECT_BANK_TRANSFER' },
	{ name: 'Débito Direto', value: 'DIRECT_DEBIT' },
	{ name: 'Boleto Financiado', value: 'FINANCED_BILLET' },
	{ name: 'Parcelamento Financiado', value: 'FINANCED_INSTALLMENT' },
	{ name: 'Google Pay', value: 'GOOGLE_PAY' },
	{ name: 'Hotcard', value: 'HOTCARD' },
	{ name: 'Híbrido', value: 'HYBRID' },
	{ name: 'Transferência Manual', value: 'MANUAL_TRANSFER' },
	{ name: 'PayPal', value: 'PAYPAL' },
	{ name: 'PayPal Internacional', value: 'PAYPAL_INTERNACIONAL' },
	{ name: 'PicPay', value: 'PICPAY' },
	{ name: 'PIX', value: 'PIX' },
	{ name: 'Samsung Pay', value: 'SAMSUNG_PAY' },
	{ name: 'Wallet', value: 'WALLET' }
];

export const commissionAsOptions = [
	{ name: 'Produtor', value: 'PRODUCER' },
	{ name: 'Coprodutor', value: 'COPRODUCER' },
	{ name: 'Afiliado', value: 'AFFILIATE' }
];

export const productStatusOptions = [
	{ name: 'Ativo', value: 'ACTIVE' },
	{ name: 'Alterações Pendentes', value: 'CHANGES_PENDING_ON_PRODUCT' },
	{ name: 'Excluído', value: 'DELETED' },
	{ name: 'Rascunho', value: 'DRAFT' },
	{ name: 'Em Análise', value: 'IN_REVIEW' },
	{ name: 'Não Aprovado', value: 'NOT_APPROVED' },
	{ name: 'Pausado', value: 'PAUSED' }
];

export const productFormatOptions = [
	{ name: 'Áudios', value: 'AUDIOS' },
	{ name: 'Bundles', value: 'BUNDLE' },
	{ name: 'Comunidade', value: 'COMMUNITY' },
	{ name: 'E-book', value: 'EBOOK' },
	{ name: 'Ingresso Eletrônico', value: 'ETICKET' },
	{ name: 'Imagens', value: 'IMAGES' },
	{ name: 'Aplicativos Móveis', value: 'MOBILE_APPS' },
	{ name: 'Curso Online', value: 'ONLINE_COURSE' },
	{ name: 'Evento Online', value: 'ONLINE_EVENT' },
	{ name: 'Serviço Online', value: 'ONLINE_SERVICE' },
	{ name: 'Códigos de Série', value: 'SERIAL_CODES' },
	{ name: 'Software', value: 'SOFTWARE' },
	{ name: 'Templates', value: 'TEMPLATES' },
	{ name: 'Vídeos', value: 'VIDEOS' }
];