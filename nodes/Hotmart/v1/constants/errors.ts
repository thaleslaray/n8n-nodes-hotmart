/**
 * Standardized error messages for n8n-nodes-hotmart
 * Following n8n best practices for user-friendly error handling
 */

export const ERROR_MESSAGES = {
	// API Errors
	API: {
		UNAUTHORIZED: 'Falha na autenticação. Verifique suas credenciais Hotmart OAuth2 e tente novamente.',
		FORBIDDEN: 'Acesso negado. Verifique se sua conta tem permissão para esta operação.',
		NOT_FOUND: 'Recurso não encontrado. Verifique se o ID ou código está correto.',
		RATE_LIMIT: 'Limite de requisições excedido. Aguarde alguns minutos e tente novamente.',
		SERVER_ERROR: 'Erro no servidor da Hotmart. Tente novamente em alguns instantes.',
		TIMEOUT: 'A requisição demorou muito tempo. Verifique sua conexão e tente novamente.',
		INVALID_REQUEST: 'Requisição inválida. Verifique os parâmetros enviados.',
	},

	// Validation Errors
	VALIDATION: {
		REQUIRED_FIELD: 'Campo obrigatório não informado',
		INVALID_FORMAT: 'Formato inválido',
		INVALID_DATE: 'Data inválida. Use o formato AAAA-MM-DD',
		INVALID_EMAIL: 'Email inválido. Verifique o formato do email',
		INVALID_CPF: 'CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números',
		INVALID_TRANSACTION: 'Código de transação inválido. Use o formato HP seguido de números',
		INVALID_SUBSCRIBER: 'Código de assinante inválido. Use o formato sub_ seguido do código',
		MAX_ITEMS_EXCEEDED: 'Número máximo de itens excedido',
		INVALID_PERCENTAGE: 'Percentual deve estar entre 0 e 100',
		INVALID_VALUE: 'Valor monetário inválido. Use formato decimal com até 2 casas',
	},

	// Business Logic Errors
	BUSINESS: {
		SUBSCRIPTION_NOT_CANCELLABLE: 'Esta assinatura não pode ser cancelada. Status atual não permite cancelamento.',
		SUBSCRIPTION_NOT_REACTIVATABLE: 'Esta assinatura não pode ser reativada. Apenas assinaturas CANCELADAS ou ATRASADAS.',
		REFUND_REQUIRES_CONFIRMATION: 'Reembolso não confirmado. Defina "Confirmar Reembolso" como true para prosseguir.',
		REFUND_IRREVERSIBLE: 'Atenção: Reembolsos são irreversíveis. Verifique antes de confirmar.',
		NEGOTIATION_TOO_MANY_INSTALLMENTS: 'Máximo de 5 parcelas por negociação.',
		COUPON_ALREADY_EXISTS: 'Já existe um cupom com este código.',
		BILLING_DATE_INVALID: 'Dia de cobrança inválido. Use valores entre 1 e 31.',
		NO_OVERDUE_INSTALLMENTS: 'Não há parcelas em atraso para esta assinatura.',
	},

	// Resource Errors
	RESOURCE: {
		NOT_SUPPORTED: 'Recurso não suportado',
		OPERATION_NOT_SUPPORTED: 'Operação não suportada para este recurso',
		PRODUCT_NOT_FOUND: 'Produto não encontrado ou não está disponível',
		SUBSCRIPTION_NOT_FOUND: 'Assinatura não encontrada',
		TRANSACTION_NOT_FOUND: 'Transação não encontrada',
		COUPON_NOT_FOUND: 'Cupom não encontrado',
		EVENT_NOT_FOUND: 'Evento não encontrado',
		STUDENT_NOT_FOUND: 'Aluno não encontrado na área de membros',
		MODULE_NOT_FOUND: 'Módulo não encontrado',
	},

	// Network Errors
	NETWORK: {
		CONNECTION_FAILED: 'Falha na conexão com a API Hotmart. Verifique sua internet.',
		DNS_ERROR: 'Não foi possível resolver o endereço da API Hotmart.',
		SSL_ERROR: 'Erro de certificado SSL. Verifique a data/hora do sistema.',
	},

	// Configuration Errors
	CONFIG: {
		NO_CREDENTIALS: 'Credenciais Hotmart não configuradas. Configure OAuth2 nas credenciais.',
		INVALID_CREDENTIALS: 'Credenciais OAuth2 inválidas ou expiradas.',
		MISSING_SCOPE: 'Escopo OAuth2 insuficiente para esta operação.',
	},
} as const;

/**
 * Helper function to create detailed error messages
 */
export function createErrorMessage(
	baseMessage: string,
	details?: {
		code?: string;
		statusCode?: number;
		resource?: string;
		operation?: string;
		hint?: string;
	}
): string {
	let message = baseMessage;

	if (details?.code) {
		message += ` (Código: ${details.code})`;
	}

	if (details?.statusCode) {
		message += ` [HTTP ${details.statusCode}]`;
	}

	if (details?.resource && details?.operation) {
		message += ` - ${details.resource}/${details.operation}`;
	}

	if (details?.hint) {
		message += `\n💡 Dica: ${details.hint}`;
	}

	return message;
}

/**
 * Common error hints for better UX
 */
export const ERROR_HINTS = {
	401: 'Verifique se suas credenciais OAuth2 estão corretas e não expiraram.',
	403: 'Sua conta pode não ter permissão para esta ação. Contate o suporte Hotmart.',
	404: 'Verifique se o ID ou código informado está correto e pertence à sua conta.',
	429: 'Aguarde alguns minutos antes de tentar novamente ou reduza a frequência das requisições.',
	500: 'Erro temporário no servidor. Tente novamente em alguns minutos.',
	502: 'Problemas de conectividade com a Hotmart. Tente novamente.',
	503: 'Serviço temporariamente indisponível. Aguarde alguns minutos.',
} as const;

/**
 * Maps HTTP status codes to user-friendly messages
 */
export function getErrorMessageByStatus(statusCode: number): string {
	switch (statusCode) {
		case 400:
			return ERROR_MESSAGES.API.INVALID_REQUEST;
		case 401:
			return ERROR_MESSAGES.API.UNAUTHORIZED;
		case 403:
			return ERROR_MESSAGES.API.FORBIDDEN;
		case 404:
			return ERROR_MESSAGES.API.NOT_FOUND;
		case 429:
			return ERROR_MESSAGES.API.RATE_LIMIT;
		case 500:
		case 502:
		case 503:
			return ERROR_MESSAGES.API.SERVER_ERROR;
		case 504:
			return ERROR_MESSAGES.API.TIMEOUT;
		default:
			return `Erro na API Hotmart (HTTP ${statusCode})`;
	}
}