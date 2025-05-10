import { 
	IExecuteFunctions, 
	IHookFunctions, 
	IWebhookFunctions,
	IHttpRequestOptions, 
	IDataObject, 
	IHttpRequestMethods,
	ILoadOptionsFunctions
} from 'n8n-workflow'; // Added IDataObject, IHttpRequestMethods, IHookFunctions, IWebhookFunctions, ILoadOptionsFunctions

export async function hotmartApiRequest(
	this: IExecuteFunctions | IHookFunctions | IWebhookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: any = {},
	query: object = {},
): Promise<any> {
	const credentials = await this.getCredentials('hotmartOAuth2Api');
	const baseUrl = credentials.environment === 'production'
		? 'https://developers.hotmart.com'
		: 'https://sandbox.hotmart.com';

	const options: IHttpRequestOptions = {
		method: method as IHttpRequestMethods,
		url: `${baseUrl}${endpoint}`,
		qs: query as IDataObject,
		returnFullResponse: true, // Adiciona esta opção para receber o status code
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
		options.headers = {
			'Content-Type': 'application/json',
		};
	}

	try {
		// Log da requisição
		console.log('\n[Hotmart API Request]');
		console.log('URL:', options.url);
		console.log('Method:', options.method);
		console.log('Query Parameters:', JSON.stringify(options.qs, null, 2));
		if (options.body) {
			console.log('Body:', JSON.stringify(options.body, null, 2));
		}

		const fullResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'hotmartOAuth2Api',
			options,
		);

		// Log da resposta
		console.log('\n[Hotmart API Response]');
		console.log('Status:', fullResponse.statusCode);
		console.log('Headers:', JSON.stringify(fullResponse.headers, null, 2));
		console.log('Response:', JSON.stringify(fullResponse.body, null, 2));

		return fullResponse.body;
	} catch (error) {
		console.log('\n[Hotmart API Error]');
		console.log('Error:', error);
		throw error;
	}
}

// Removed refreshToken function as updateCredentials is not available
// and httpRequestWithAuthentication should handle standard OAuth2 refresh.
// If custom refresh logic is needed later, it would require a different approach.