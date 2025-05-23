import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeTypeBaseDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';
import { getProducts, getEventProducts, getCouponsByProduct } from './methods/loadOptions';

/**
 * Hotmart node version 1 implementation
 * @class HotmartV1
 * @implements {INodeType}
 * @description Version 1 implementation of the Hotmart node. Handles all operations
 * for interacting with the Hotmart API including subscriptions, sales, products, and more.
 * @since 0.1.0
 */
export class HotmartV1 implements INodeType {
  /**
   * Node description containing metadata and properties
   * @type {INodeTypeDescription}
   * @description Combined description from base and version-specific properties
   */
  description: INodeTypeDescription;

  /**
   * Creates a new instance of HotmartV1
   * @param {INodeTypeBaseDescription} baseDescription - Base node description from parent
   * @description Merges base description with version-specific description and properties
   */
  constructor(baseDescription: INodeTypeBaseDescription) {
    this.description = {
      ...baseDescription,
      ...versionDescription,
    };
  }

  /**
   * Methods available for this node
   * @description Provides load options for dynamic dropdowns in the UI
   */
  methods = {
    loadOptions: {
      getProducts,
      getEventProducts,
      getCouponsByProduct,
    },
  };

  /**
   * Executes the Hotmart node operation
   * @param {IExecuteFunctions} this - n8n execution context with access to parameters and helpers
   * @returns {Promise<INodeExecutionData[][]>} Array of execution results for each output
   * @throws {NodeOperationError} When operation fails or invalid parameters are provided
   * @description Routes the execution to the appropriate operation handler based on selected resource and operation
   * @example
   * // Execute subscription listing
   * const result = await execute.call(executeFunctions);
   * // Returns: [[{ json: { subscription_id: "123", status: "ACTIVE", ... } }]]
   */
  async execute(this: IExecuteFunctions) {
    return await router.call(this);
  }
}
