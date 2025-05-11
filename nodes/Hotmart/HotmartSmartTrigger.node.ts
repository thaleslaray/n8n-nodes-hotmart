import type {
	IDataObject,
	IHookFunctions,
	INodeExecutionData,
	INodeParameters,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

enum WebhookEventTypes {
	PURCHASE_OUT_OF_SHOPPING_CART,
	PURCHASE_APPROVED,
	PURCHASE_COMPLETE,
	PURCHASE_CANCELED,
	PURCHASE_REFUNDED,
	PURCHASE_CHARGEBACK,
	PURCHASE_BILLET_PRINTED,
	PURCHASE_PROTEST,
	PURCHASE_EXPIRED,
	PURCHASE_DELAYED,
	SUBSCRIPTION_CANCELLATION,
	SUBSCRIPTION_PLAN_CHANGE,
	SUBSCRIPTION_BILLING_DATE_CHANGE,
	SUBSCRIPTION_WAITING_PAYMENT,
	SUBSCRIPTION_ACTIVATED,
	SUBSCRIPTION_REFUNDED,
	CLUB_FIRST_ACCESS,
	CLUB_MODULE_COMPLETED,
}

const webhookEvents = {
	[WebhookEventTypes.PURCHASE_OUT_OF_SHOPPING_CART]: {
		name: 'Abandono de Carrinho',
		value: 'PURCHASE_OUT_OF_SHOPPING_CART',
	},
	[WebhookEventTypes.PURCHASE_APPROVED]: {
		name: 'Compra Aprovada',
		value: 'PURCHASE_APPROVED',
	},
	[WebhookEventTypes.PURCHASE_COMPLETE]: {
		name: 'Compra Completa',
		value: 'PURCHASE_COMPLETE',
	},
	[WebhookEventTypes.PURCHASE_CANCELED]: {
		name: 'Compra Cancelada',
		value: 'PURCHASE_CANCELED',
	},
	[WebhookEventTypes.PURCHASE_REFUNDED]: {
		name: 'Compra Reembolsada',
		value: 'PURCHASE_REFUNDED',
	},
	[WebhookEventTypes.PURCHASE_CHARGEBACK]: {
		name: 'Compra Chargeback',
		value: 'PURCHASE_CHARGEBACK',
	},
	[WebhookEventTypes.PURCHASE_BILLET_PRINTED]: {
		name: 'Boleto Impresso',
		value: 'PURCHASE_BILLET_PRINTED',
	},
	[WebhookEventTypes.PURCHASE_PROTEST]: {
		name: 'Compra em Disputa',
		value: 'PURCHASE_PROTEST',
	},
	[WebhookEventTypes.PURCHASE_EXPIRED]: {
		name: 'Compra Expirada',
		value: 'PURCHASE_EXPIRED',
	},
	[WebhookEventTypes.PURCHASE_DELAYED]: {
		name: 'Compra Atrasada',
		value: 'PURCHASE_DELAYED',
	},
	[WebhookEventTypes.SUBSCRIPTION_CANCELLATION]: {
		name: 'Assinatura Cancelada',
		value: 'SUBSCRIPTION_CANCELLATION',
	},
	[WebhookEventTypes.SUBSCRIPTION_PLAN_CHANGE]: {
		name: 'Troca de Plano de Assinatura',
		value: 'SWITCH_PLAN',
	},
	[WebhookEventTypes.SUBSCRIPTION_BILLING_DATE_CHANGE]: {
		name: 'Troca de Dia de Cobrança',
		value: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
	},
	[WebhookEventTypes.SUBSCRIPTION_WAITING_PAYMENT]: {
		name: 'Assinatura Aguardando Pagamento',
		value: 'SUBSCRIPTION_WAITING_PAYMENT',
	},
	[WebhookEventTypes.SUBSCRIPTION_ACTIVATED]: {
		name: 'Assinatura Ativada',
		value: 'SUBSCRIPTION_ACTIVATED',
	},
	[WebhookEventTypes.SUBSCRIPTION_REFUNDED]: {
		name: 'Assinatura Reembolsada',
		value: 'SUBSCRIPTION_REFUNDED',
	},
	[WebhookEventTypes.CLUB_FIRST_ACCESS]: {
		name: 'Primeiro Acesso',
		value: 'CLUB_FIRST_ACCESS',
	},
	[WebhookEventTypes.CLUB_MODULE_COMPLETED]: {
		name: 'Módulo Completo',
		value: 'CLUB_MODULE_COMPLETED',
	},
	all: {
		name: 'Todos',
		value: '*',
	},
};

// Função para obter o tipo de evento a partir do corpo da requisição
function getEvent(this: IWebhookFunctions): WebhookEventTypes | undefined {
	const body = this.getBodyData() as IDataObject;
	
	if (body.event === 'PURCHASE_CANCELED') {
		return WebhookEventTypes.PURCHASE_CANCELED;
	}
	
	if (body.event === 'PURCHASE_COMPLETE') {
		return WebhookEventTypes.PURCHASE_COMPLETE;
	}
	
	if (body.event === 'PURCHASE_APPROVED') {
		return WebhookEventTypes.PURCHASE_APPROVED;
	}
	
	if (body.event === 'PURCHASE_EXPIRED') {
		return WebhookEventTypes.PURCHASE_EXPIRED;
	}
	
	if (body.event === 'PURCHASE_REFUNDED') {
		return WebhookEventTypes.PURCHASE_REFUNDED;
	}
	
	if (body.event === 'PURCHASE_CHARGEBACK') {
		return WebhookEventTypes.PURCHASE_CHARGEBACK;
	}
	
	if (body.event === 'PURCHASE_BILLET_PRINTED') {
		return WebhookEventTypes.PURCHASE_BILLET_PRINTED;
	}
	
	if (body.event === 'PURCHASE_PROTEST') {
		return WebhookEventTypes.PURCHASE_PROTEST;
	}
	
	if (body.event === 'PURCHASE_DELAYED') {
		return WebhookEventTypes.PURCHASE_DELAYED;
	}
	
	if (body.event === 'PURCHASE_OUT_OF_SHOPPING_CART') {
		return WebhookEventTypes.PURCHASE_OUT_OF_SHOPPING_CART;
	}
	
	if (body.event === 'SUBSCRIPTION_CANCELLATION') {
		return WebhookEventTypes.SUBSCRIPTION_CANCELLATION;
	}
	
	if (body.event === 'SWITCH_PLAN') {
		return WebhookEventTypes.SUBSCRIPTION_PLAN_CHANGE;
	}
	
	if (body.event === 'UPDATE_SUBSCRIPTION_CHARGE_DATE') {
		return WebhookEventTypes.SUBSCRIPTION_BILLING_DATE_CHANGE;
	}
	
	if (body.event === 'SUBSCRIPTION_WAITING_PAYMENT') {
		return WebhookEventTypes.SUBSCRIPTION_WAITING_PAYMENT;
	}
	
	if (body.event === 'SUBSCRIPTION_ACTIVATED') {
		return WebhookEventTypes.SUBSCRIPTION_ACTIVATED;
	}
	
	if (body.event === 'SUBSCRIPTION_REFUNDED') {
		return WebhookEventTypes.SUBSCRIPTION_REFUNDED;
	}
	
	if (body.event === 'CLUB_FIRST_ACCESS') {
		return WebhookEventTypes.CLUB_FIRST_ACCESS;
	}
	
	if (body.event === 'CLUB_MODULE_COMPLETED') {
		return WebhookEventTypes.CLUB_MODULE_COMPLETED;
	}
	
	return undefined;
}

// Função para configurar os nomes das saídas dinamicamente
const configureOutputNames = (parameters: INodeParameters) => {
	const customizeOutputs = parameters.customizeOutputs as boolean;
	
	if (customizeOutputs) {
		return [
			{
				type: 'main',
				displayName: parameters.outputName0 || 'Aprovada',
			},
			{
				type: 'main',
				displayName: parameters.outputName1 || 'Completa',
			},
			{
				type: 'main',
				displayName: parameters.outputName2 || 'Cancelada',
			},
			{
				type: 'main',
				displayName: parameters.outputName3 || 'Reembolso',
			},
			{
				type: 'main',
				displayName: parameters.outputName4 || 'Chargeback',
			},
			{
				type: 'main',
				displayName: parameters.outputName5 || 'Boleto',
			},
			{
				type: 'main',
				displayName: parameters.outputName6 || 'Disputa',
			},
			{
				type: 'main',
				displayName: parameters.outputName7 || 'Expirada',
			},
			{
				type: 'main',
				displayName: parameters.outputName8 || 'Atrasada',
			},
			{
				type: 'main',
				displayName: parameters.outputName9 || 'Abandono',
			},
			{
				type: 'main',
				displayName: parameters.outputName10 || 'Ass. Cancelada',
			},
			{
				type: 'main',
				displayName: parameters.outputName11 || 'Troca de Plano',
			},
			{
				type: 'main',
				displayName: parameters.outputName12 || 'Troca de Data',
			},
			{
				type: 'main',
				displayName: parameters.outputName13 || 'Primeiro Acesso',
			},
			{
				type: 'main',
				displayName: parameters.outputName14 || 'Módulo Completo',
			},
		];
	} else {
		return [
			{
				type: 'main',
				displayName: 'Aprovada',
			},
			{
				type: 'main',
				displayName: 'Completa',
			},
			{
				type: 'main',
				displayName: 'Cancelada',
			},
			{
				type: 'main',
				displayName: 'Reembolso',
			},
			{
				type: 'main',
				displayName: 'Chargeback',
			},
			{
				type: 'main',
				displayName: 'Boleto',
			},
			{
				type: 'main',
				displayName: 'Disputa',
			},
			{
				type: 'main',
				displayName: 'Expirada',
			},
			{
				type: 'main',
				displayName: 'Atrasada',
			},
			{
				type: 'main',
				displayName: 'Abandono',
			},
			{
				type: 'main',
				displayName: 'Ass. Cancelada',
			},
			{
				type: 'main',
				displayName: 'Troca de Plano',
			},
			{
				type: 'main',
				displayName: 'Troca de Data',
			},
			{
				type: 'main',
				displayName: 'Primeiro Acesso',
			},
			{
				type: 'main',
				displayName: 'Módulo Completo',
			},
		];
	}
};

export class HotmartSmartTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hotmart Smart Trigger',
		name: 'hotmartSmartTrigger',
		icon: 'file:hotmart.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{ "Webhook para eventos Hotmart" }}',
		description: 'Recebe eventos da Hotmart via webhooks e os direciona para saídas específicas',
		defaults: {
			name: 'Hotmart Smart Trigger',
		},
		inputs: [],
		outputs: `={{(${configureOutputNames})($parameter)}}`,
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'hotmart-smart',
				isFullPath: true,
			},
		],
		properties: [
			{
				displayName: 'URL Secreta',
				name: 'useSecretUrl',
				type: 'boolean',
				default: false,
				description: 'Se deve usar uma URL secreta para o webhook',
			},
			{
				displayName: 'Segredo',
				name: 'secret',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						useSecretUrl: [true],
					},
				},
				description: 'O segredo a ser usado para a URL do webhook',
			},
			{
				displayName: 'Hottok Token de Verificação',
				name: 'hotTokToken',
				type: 'string',
				default: '',
				description: 'Token de verificação enviado pela Hotmart no cabeçalho X-HOTMART-HOTTOK (opcional)',
			},
			{
				displayName: 'Personalizar Nomes das Saídas',
				name: 'customizeOutputs',
				type: 'boolean',
				default: false,
				description: 'Use nomes alternativos mais curtos para as saídas (visual apenas)',
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_APPROVED',
				name: 'outputName0',
				type: 'string',
				default: 'Aprovada',
				description: 'Nome personalizado para a saída de Compra Aprovada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_COMPLETE',
				name: 'outputName1',
				type: 'string',
				default: 'Completa',
				description: 'Nome personalizado para a saída de Compra Completa',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_CANCELED',
				name: 'outputName2',
				type: 'string',
				default: 'Cancelada',
				description: 'Nome personalizado para a saída de Compra Cancelada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_REFUNDED',
				name: 'outputName3',
				type: 'string',
				default: 'Reembolso',
				description: 'Nome personalizado para a saída de Compra Reembolsada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_CHARGEBACK',
				name: 'outputName4',
				type: 'string',
				default: 'Chargeback',
				description: 'Nome personalizado para a saída de Compra com Chargeback',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_BILLET_PRINTED',
				name: 'outputName5',
				type: 'string',
				default: 'Boleto',
				description: 'Nome personalizado para a saída de Boleto Impresso',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_PROTEST',
				name: 'outputName6',
				type: 'string',
				default: 'Disputa',
				description: 'Nome personalizado para a saída de Compra em Disputa',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_EXPIRED',
				name: 'outputName7',
				type: 'string',
				default: 'Expirada',
				description: 'Nome personalizado para a saída de Compra Expirada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_DELAYED',
				name: 'outputName8',
				type: 'string',
				default: 'Atrasada',
				description: 'Nome personalizado para a saída de Compra Atrasada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: PURCHASE_OUT_OF_SHOPPING_CART',
				name: 'outputName9',
				type: 'string',
				default: 'Abandono',
				description: 'Nome personalizado para a saída de Abandono de Carrinho',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: SUBSCRIPTION_CANCELLATION',
				name: 'outputName10',
				type: 'string',
				default: 'Ass. Cancelada',
				description: 'Nome personalizado para a saída de Assinatura Cancelada',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: SWITCH_PLAN',
				name: 'outputName11',
				type: 'string',
				default: 'Troca de Plano',
				description: 'Nome personalizado para a saída de Troca de Plano',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: UPDATE_SUBSCRIPTION_CHARGE_DATE',
				name: 'outputName12',
				type: 'string',
				default: 'Troca de Data',
				description: 'Nome personalizado para a saída de Troca de Data de Cobrança',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: CLUB_FIRST_ACCESS',
				name: 'outputName13',
				type: 'string',
				default: 'Primeiro Acesso',
				description: 'Nome personalizado para a saída de Primeiro Acesso',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
			{
				displayName: 'Nome alternativo para: CLUB_MODULE_COMPLETED',
				name: 'outputName14',
				type: 'string',
				default: 'Módulo Completo',
				description: 'Nome personalizado para a saída de Módulo Completo',
				displayOptions: {
					show: {
						customizeOutputs: [true],
					},
				},
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				
				// No caso dos webhooks Hotmart, não precisamos verificar um registro externo
				// pois o webhook é registrado manualmente no painel da Hotmart
				if (webhookData.webhookId === undefined) {
					return false;
				}
				
				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const useSecretUrl = this.getNodeParameter('useSecretUrl', false) as boolean;
				
				let webhookUrlWithSecret = webhookUrl;

				if (useSecretUrl) {
					const secret = this.getNodeParameter('secret', '') as string;
					if (secret) {
						webhookUrlWithSecret = `${webhookUrl}?secret=${encodeURIComponent(secret)}`;
					}
				}

				// Adicionar um campo na descrição com a URL do webhook
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = `manual-${Date.now()}`;
				webhookData.webhookUrl = webhookUrlWithSecret;

				// Log informando a URL de webhook configurada
				console.log('\n[HotmartSmartTrigger] ======== IMPORTANTE ========');
				console.log('[HotmartSmartTrigger] Configure esta URL no painel de webhooks da Hotmart:');
				console.log('[HotmartSmartTrigger]', webhookUrlWithSecret);
				console.log('[HotmartSmartTrigger] Selecione os eventos de interesse');
				console.log('[HotmartSmartTrigger] ==============================\n');

				if (useSecretUrl) {
					webhookData.webhookSecret = this.getNodeParameter('secret', '') as string;
				}
				
				// Salvar o token hottok se fornecido
				const hotTokToken = this.getNodeParameter('hotTokToken', '') as string;
				if (hotTokToken) {
					webhookData.hotTokToken = hotTokToken;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					// O webhook está configurado manualmente na Hotmart, então só precisamos
					// remover os dados locais e orientar o usuário a remover o webhook na Hotmart
					console.log('\n[HotmartSmartTrigger] Webhook local removido. Lembre-se de remover também o webhook no painel da Hotmart:');
					console.log('[HotmartSmartTrigger] https://app-vlc.hotmart.com/tools/webhook\n');
					
					// Remover dados do webhook do armazenamento estático
					delete webhookData.webhookId;
					delete webhookData.webhookSecret;
					delete webhookData.hotTokToken;
					delete webhookData.webhookUrl;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const req = this.getRequestObject();
		const headerData = this.getHeaderData();
		const webhookData = this.getWorkflowStaticData('node');
		const res = this.getResponseObject();
		
		// Verificar token hottok enviado no cabeçalho HTTP
		const hottok = headerData['x-hotmart-hottok'] as string;
		
		// Verificar se o hottok está configurado e corresponde
		if (hottok && webhookData.hotTokToken && hottok !== webhookData.hotTokToken) {
			console.log('[HotmartSmartTrigger] Erro: Token hottok não corresponde ao configurado');
			res.status(401).send('Invalid token');
			return {
				noWebhookResponse: true,
			};
		}
		
		// Verificar o secret se estiver usando URL secreta
		if (webhookData.webhookSecret) {
			const querySecret = (req.query?.secret as string) || '';

			if (querySecret !== webhookData.webhookSecret) {
				console.log('[HotmartSmartTrigger] Erro: Secret na URL não corresponde ao configurado');
				res.status(401).send('Invalid secret');
				return {
					noWebhookResponse: true,
				};
			}
		}

		// Verificar o evento
		const event = getEvent.call(this);
		if (!event) {
			console.log('[HotmartSmartTrigger] Evento desconhecido:', (bodyData as IDataObject).event);
			res.status(400).send('Unknown event');
			return {
				noWebhookResponse: true,
			};
		}

		// Adicionar informações de debug e metadados úteis
		const returnData = {
			...bodyData as IDataObject,
			eventName: webhookEvents[event]?.name,
			hottok,
		};

		// Logar informações para depuração
		console.log('[HotmartSmartTrigger] ============ DEBUG ============');
		console.log('[HotmartSmartTrigger] Evento recebido:', webhookEvents[event]?.name);
		console.log('[HotmartSmartTrigger] Código evento:', event);
		console.log('[HotmartSmartTrigger] Token hottok recebido:', hottok);
		console.log('[HotmartSmartTrigger] ================================');

		// Determinar para qual saída o evento deve ser direcionado
		let outputIndex = -1;

		switch ((bodyData as IDataObject).event) {
			case 'PURCHASE_APPROVED':
			case '1': // Compatibilidade com valor numérico
				outputIndex = 0;
				break;
			case 'PURCHASE_COMPLETE':
				outputIndex = 1;
				break;
			case 'PURCHASE_CANCELED':
				outputIndex = 2;
				break;
			case 'PURCHASE_REFUNDED':
				outputIndex = 3;
				break;
			case 'PURCHASE_CHARGEBACK':
				outputIndex = 4;
				break;
			case 'PURCHASE_BILLET_PRINTED':
				outputIndex = 5;
				break;
			case 'PURCHASE_PROTEST':
				outputIndex = 6;
				break;
			case 'PURCHASE_EXPIRED':
				outputIndex = 7;
				break;
			case 'PURCHASE_DELAYED':
				outputIndex = 8;
				break;
			case 'PURCHASE_OUT_OF_SHOPPING_CART':
				outputIndex = 9;
				break;
			case 'SUBSCRIPTION_CANCELLATION':
				outputIndex = 10;
				break;
			case 'SWITCH_PLAN':
				outputIndex = 11;
				break;
			case 'UPDATE_SUBSCRIPTION_CHARGE_DATE':
				outputIndex = 12;
				break;
			case 'CLUB_FIRST_ACCESS':
				outputIndex = 13;
				break;
			case 'CLUB_MODULE_COMPLETED':
				outputIndex = 14;
				break;
			default:
				// Se for um evento não mapeado, não enviamos para nenhuma saída
				console.log(`[HotmartSmartTrigger] Evento não reconhecido: ${(bodyData as IDataObject).event}`);
				res.status(400).send('Unknown event');
				return {
					noWebhookResponse: true,
				};
		}

		// Criar arrays vazios para cada saída possível (15 saídas)
		const outputData: INodeExecutionData[][] = Array(15).fill(0).map(() => []);

		// Adicionar os dados apenas na saída correspondente ao evento
		if (outputIndex >= 0) {
			const jsonData = this.helpers.returnJsonArray(returnData);
			outputData[outputIndex] = jsonData;
			return {
				workflowData: outputData,
			};
		}

		// Se chegou aqui, algo deu errado
		res.status(500).send('Internal error');
		return {
			noWebhookResponse: true,
		};
	}
}