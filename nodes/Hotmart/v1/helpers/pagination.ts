import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow'; // Added NodeOperationError
import { hotmartApiRequest } from '../transport/request';

interface PaginationOptions {
	maxResults: number;
	resource: string;
	operation: string;
	query?: IDataObject;
	body?: IDataObject;
}

export async function getAllItems(
	this: IExecuteFunctions,
	options: PaginationOptions,
): Promise<any[]> {
	const { resource, operation, query = {}, body = {} } = options;
	
	// Usamos o max_results que foi definido no query, que já deve incluir o valor correto
	// O valor foi definido no arquivo getAll.operation.ts
	const maxResults = options.maxResults;
	
	console.log(`\n[DEBUG] getAllItems iniciado - maxResults=${maxResults}`);
	console.log(`\n[DEBUG] Query recebido em getAllItems:`, JSON.stringify(query, null, 2));

	const returnData: IDataObject[] = [];
	let responseData: any; // Use 'any' for now, or define a more specific interface if possible
	let nextPageToken: string | undefined;

	// Implementar controle de rate limit
	const rateLimitDelay = 100; // ms entre requisições

	do {
		// Configurar a consulta com o token da página
		const endpoint = getEndpointForResourceOperation(resource, operation);
		if (!endpoint) {
			throw new NodeOperationError(this.getNode(), `Endpoint not found for resource '${resource}' and operation '${operation}'`);
		}
		
		// Se usamos qs.max_results na chamada original, não precisamos adicionar aqui
		// mas vamos manter para garantir
		const queryParams = {
			...query,
			...(nextPageToken && { page_token: nextPageToken }),
		};
		
		// Log da query que será enviada
		console.log(`\n[DEBUG] Enviando requisição com parâmetros:`, JSON.stringify(queryParams, null, 2));

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
			console.log(`\n[DEBUG] Recebidos ${responseData.items.length} itens nesta página`);
		}

		// Check if responseData is an object and has page_info before accessing next_page_token
		nextPageToken = (typeof responseData === 'object' && responseData !== null && responseData.page_info)
			? responseData.page_info.next_page_token
			: undefined;
		
		if (nextPageToken) {
			console.log(`\n[DEBUG] Próxima página disponível com token: ${nextPageToken}`);
		} else {
			console.log(`\n[DEBUG] Não há mais páginas disponíveis`);
		}

		// Para evitar atingir rate limits, adicionar um pequeno atraso
		if (nextPageToken) {
			await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
		}

	} while (nextPageToken);
	
	console.log(`\n[DEBUG] getAllItems concluído - total de itens: ${returnData.length}`);

	return returnData;
}

function getEndpointForResourceOperation(resource: string, operation: string): string {
	// Mapear recursos e operações para endpoints correspondentes
	const endpoints: {[key: string]: {[key: string]: string}} = {
		subscription: {
			getAll: '/payments/api/v1/subscriptions',
			getSummary: '/payments/api/v1/subscriptions/summary',
			getPurchases: '/payments/api/v1/subscriptions/purchases',
			getTransactions: '/payments/api/v1/subscriptions/transactions', // Endpoint adicionado para a operação getTransactions
			// Outros endpoints de assinaturas
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
			getStudents: '/club/api/v1/users', // Endpoint correto para buscar alunos
			getModules: '/club/api/v1/modules',
			getProgress: '/club/api/v1/users', // Base do endpoint para progresso (complementado com userId no código)
			getPages: '/club/api/v2/modules', // Base do endpoint para páginas (complementado com moduleId no código)
		},
		// Nota: O recurso de Tickets precisa implementar sua própria paginação com o event_id no path
	};

	return endpoints[resource]?.[operation] || '';
}