import type { INodeProperties } from 'n8n-workflow';

// Import operation modules
import * as generateNegotiation from './generateNegotiation.operation';

// Export operations grouped together
export const operations = {
	generateNegotiation,
};

// Export description separately
export const description: INodeProperties[] = [
	// Spread descriptions from individual operation files
	...generateNegotiation.description,
];