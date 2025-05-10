import type { INodeTypeBaseDescription } from 'n8n-workflow'; // Removed IVersionedNodeType
import { VersionedNodeType } from 'n8n-workflow';

import { HotmartV1 } from './v1/HotmartV1.node';

export class Hotmart extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Hotmart',
			name: 'hotmart',
			icon: 'file:icons/hotmart.svg',
			group: ['transform'],
			description: 'Interagir com a API Hotmart',
			defaultVersion: 1,
		};

		const nodeVersions = {
			1: new HotmartV1(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
