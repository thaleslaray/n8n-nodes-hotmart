import type { IWebhookResponseData, INodeExecutionData } from 'n8n-workflow';
import { BaseWebhookHandler } from './BaseWebhookHandler';

export class SuperSmartModeHandler extends BaseWebhookHandler {
  private static readonly OUTPUT_INDICES = {
    UNIQUE_PURCHASE: 0,
    NEW_SUBSCRIPTION: 1,
    SUBSCRIPTION_RENEWAL: 2,
    OTHER: 3,
  };

  async process(): Promise<IWebhookResponseData> {
    const validation = await this.validate();
    if (!validation.success) {
      return validation.error!;
    }

    const body = this.webhookFunctions.getBodyData() as any;
    const outputIndex = this.determineOutputIndex(body);

    // Prepara as 4 sa�das
    const outputs: INodeExecutionData[][] = [[], [], [], []];
    outputs[outputIndex] = [{ json: body }];

    return {
      workflowData: outputs,
    };
  }

  private determineOutputIndex(body: any): number {
    const event = body.event;
    const data = body.data || {};

    // L�gica para determinar o tipo de compra
    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
      const subscription = data.subscription;
      
      if (!subscription || !subscription.status) {
        // Compra �nica (sem assinatura)
        return SuperSmartModeHandler.OUTPUT_INDICES.UNIQUE_PURCHASE;
      }
      
      if (subscription.status === 'ACTIVE' && this.isFirstPayment(data)) {
        // Nova assinatura
        return SuperSmartModeHandler.OUTPUT_INDICES.NEW_SUBSCRIPTION;
      }
      
      if (subscription.status === 'ACTIVE' && !this.isFirstPayment(data)) {
        // Renova��o de assinatura
        return SuperSmartModeHandler.OUTPUT_INDICES.SUBSCRIPTION_RENEWAL;
      }
    }

    // Outros eventos
    return SuperSmartModeHandler.OUTPUT_INDICES.OTHER;
  }

  private isFirstPayment(data: any): boolean {
    const purchase = data.purchase || {};
    const subscription = data.subscription || {};
    
    // Verifica se � o primeiro pagamento baseado em v�rias heur�sticas
    if (purchase.recurrence_number === 1) return true;
    if (subscription.subscriber && subscription.subscriber.creation_date === purchase.approved_date) return true;
    if (purchase.installments_number === 1 && !purchase.has_previous_payments) return true;
    
    return false;
  }

  protected getDescription(): string {
    return 'Modo Super Smart - separando por tipo de compra';
  }
}