import type {
	IDataObject,
	IHookFunctions,
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
		value: 'SUBSCRIPTION_PLAN_CHANGE',
	},
	[WebhookEventTypes.SUBSCRIPTION_BILLING_DATE_CHANGE]: {
		name: 'Troca de Dia de Cobrança',
		value: 'SUBSCRIPTION_BILLING_DATE_CHANGE',
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
	
	if (body.event === 'SUBSCRIPTION_PLAN_CHANGE') {
		return WebhookEventTypes.SUBSCRIPTION_PLAN_CHANGE;
	}
	
	if (body.event === 'SUBSCRIPTION_BILLING_DATE_CHANGE') {
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

export class HotmartTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hotmart Trigger',
		name: 'hotmartTrigger',
		icon: 'file:hotmart.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Recebe eventos da Hotmart via webhooks',
		defaults: {
			name: 'Hotmart Trigger',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'hotmart',
				isFullPath: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: '',
				options: Object.values(webhookEvents),
			},
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
				webhookData.webhookEvent = this.getNodeParameter('event', '') as string;
				webhookData.webhookUrl = webhookUrlWithSecret;

				// Log informando a URL de webhook configurada
				console.log('\n[HotmartTrigger] ======== IMPORTANTE ========');
				console.log('[HotmartTrigger] Configure esta URL no painel de webhooks da Hotmart:');
				console.log('[HotmartTrigger]', webhookUrlWithSecret);
				console.log('[HotmartTrigger] Selecione o evento:', webhookData.webhookEvent);
				console.log('[HotmartTrigger] ==============================\n');

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
					console.log('\n[HotmartTrigger] Webhook local removido. Lembre-se de remover também o webhook no painel da Hotmart:');
					console.log('[HotmartTrigger] https://app-vlc.hotmart.com/tools/webhook\n');
					
					// Remover dados do webhook do armazenamento estático
					delete webhookData.webhookId;
					delete webhookData.webhookEvent;
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
			console.log('[HotmartTrigger] Erro: Token hottok não corresponde ao configurado');
			res.status(401).send('Invalid token');
			return {
				noWebhookResponse: true,
			};
		}
		
		// Verificar o secret se estiver usando URL secreta
		if (webhookData.webhookSecret) {
			const querySecret = (req.query?.secret as string) || '';

			if (querySecret !== webhookData.webhookSecret) {
				console.log('[HotmartTrigger] Erro: Secret na URL não corresponde ao configurado');
				res.status(401).send('Invalid secret');
				return {
					noWebhookResponse: true,
				};
			}
		}

		// Verificar o evento
		const event = getEvent.call(this);

		if (
			event &&
			(webhookEvents[event].value === this.getNodeParameter('event') ||
			this.getNodeParameter('event') === '*')
		) {
			// Logar informações para depuração com mais detalhes
			console.log('[HotmartTrigger] ============ DEBUG ============');
			console.log('[HotmartTrigger] Evento recebido:', webhookEvents[event].name);
			console.log('[HotmartTrigger] Token hottok recebido:', hottok);
			console.log('[HotmartTrigger] ================================');

			// Adicionar o token hottok aos dados retornados para possível uso no workflow
			const returnData = {
				...bodyData as IDataObject,
				event,
				hottok,
			};

			return {
				workflowData: [this.helpers.returnJsonArray(returnData)],
			};
		}
	
		res.status(400).send('Invalid event');
		return {
			noWebhookResponse: true,
		};
	}
}