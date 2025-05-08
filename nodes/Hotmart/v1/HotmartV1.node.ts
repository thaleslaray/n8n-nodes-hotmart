import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';
import { getProducts, getEventProducts } from './methods/loadOptions';

export class HotmartV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...versionDescription,
		};
	}

	methods = {
		loadOptions: {
			getProducts: getProducts,
			getEventProducts: getEventProducts,
		},
	};

	async execute(this: IExecuteFunctions) {
		return await router.call(this);
	}
}
