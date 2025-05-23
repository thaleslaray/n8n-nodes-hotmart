import type { INodeTypeBaseDescription } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { HotmartV1 } from './v1/HotmartV1.node';

/**
 * Hotmart integration node for n8n
 * @class Hotmart
 * @extends {VersionedNodeType}
 * @description Main node class that handles versioning and delegates execution to specific versions.
 * Provides integration with Hotmart API for managing subscriptions, products, sales and more.
 * @since 0.1.0
 * @author Thales Laray
 */
export class Hotmart extends VersionedNodeType {
  /**
   * Creates a new instance of the Hotmart node
   * @description Initializes the node with base description and available versions.
   * Currently supports version 1 of the Hotmart API integration.
   */
  constructor() {
    const baseDescription: INodeTypeBaseDescription = {
      displayName: 'Hotmart',
      name: 'hotmart',
      icon: 'file:hotmart.svg',
      group: ['transform'],
      description: 'Interagir com a API Hotmart',
      defaultVersion: 1,
      // Removido o campo version que não existe em INodeTypeBaseDescription
      // Removido includeCustomApiCallOption que não existe em INodeTypeBaseDescription
    };

    const nodeVersions = {
      1: new HotmartV1(baseDescription),
    };

    super(nodeVersions, baseDescription);
  }
}
