import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import { hotmartApiRequest } from '../transport/request';

interface PaginationOptions {
	maxResults: number;
	resource: string;
	operation: string;
	query?: IDataObject;
	body?: IDataObject;
}

// Valor máximo permitido pela API Hotmart para max_results
const MAX_API_RESULTS = 500;

export async function getAllItems(
	this: IExecuteFunctions,
	options: PaginationOptions,
): Promise<any[]> {
	const { resource, operation, query = {}, body = {} } = options;
	
	// Quando usamos getAllItems, significa que returnAll=true, então
	// sempre usamos o valor máximo (500) para otimizar, independente do valor que veio na chamada
	const maxResults = MAX_API_RESULTS;

	const returnData: IDataObject[] = [];
	let responseData: any;
	let nextPageToken: string | undefined;

	// Implementar controle de rate limit
	const rateLimitDelay = 100; // ms entre requisições

	do {
		// Configurar a consulta com o token da página
		const endpoint = getEndpointForResourceOperation(resource, operation);
		if (!endpoint) {
			throw new NodeOperationError(this.getNode(), `Endpoint not found for resource '${resource}' and operation '${operation}'`);
		}
		
		// Forçar max_results=500 para eficiência máxima
		const queryParams = {
			...query,
			max_results: maxResults, // Sempre usar valor máximo (500)
			...(nextPageToken && { page_token: nextPageToken }),
		};

		// Fazer requisição para esta página
		responseData = await hotmartApiRequest.call(
			this,
			'GET',
			endpoint,
			body,
			queryParams,
		);

		// Check if responseData is an object and has items
		if (typeof responseData === 'object' && responseData !== null && responseData.items && Array.isArray(responseData.items)) {
			returnData.push(...responseData.items);
		}

		// Check if responseData is an object and has page_info before accessing next_page_token
		nextPageToken = (typeof responseData === 'object' && responseData !== null && responseData.page_info)
			? responseData.page_info.next_page_token
			: undefined;

		// Para evitar atingir rate limits, adicionar um pequeno atraso
		if (nextPageToken) {
			await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
		}

	} while (nextPageToken);

	return returnData;
}

function getEndpointForResourceOperation(resource: string, operation: string): string {
	// Mapear recursos e operações para endpoints correspondentes
	const endpoints: {[key: string]: {[key: string]: string}} = {
		subscription: {
			getAll: '/payments/api/v1/subscriptions',
			getSummary: '/payments/api/v1/subscriptions/summary',
			getPurchases: '/payments/api/v1/subscriptions/purchases',
			getTransactions: '/payments/api/v1/subscriptions/transactions',
		},
		sales: {
			getHistory: '/payments/api/v1/sales/history',
			getHistoricoVendas: '/payments/api/v1/sales/history',
			getCommissions: '/payments/api/v1/sales/commissions',
			getComissoesVendas: '/payments/api/v1/sales/commissions',
			getParticipants: '/payments/api/v1/sales/users',
			getParticipantesVendas: '/payments/api/v1/sales/users',
			getPriceDetails: '/payments/api/v1/sales/price/details',
			getDetalhamentoPrecos: '/payments/api/v1/sales/price/details',
			getRefunds: '/payments/api/v1/sales/refunds',
			getSummary: '/payments/api/v1/sales/summary',
			getResumoVendas: '/payments/api/v1/sales/summary',
		},
		product: {
			getProducts: '/products/api/v1/products',
		},
		club: {
			getStudents: '/club/api/v1/users',
			getModules: '/club/api/v1/modules',
			getProgress: '/club/api/v1/users',
			getPages: '/club/api/v2/modules',
		},
		// Nota: O recurso de Tickets precisa implementar sua própria paginação com o event_id no path
	};

	return endpoints[resource]?.[operation] || '';
}