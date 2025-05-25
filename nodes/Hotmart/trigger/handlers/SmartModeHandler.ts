import type { IWebhookResponseData, INodeExecutionData } from 'n8n-workflow';
import { BaseWebhookHandler } from './BaseWebhookHandler';
import { EVENT_CONFIG } from '../constants/events';

export class SmartModeHandler extends BaseWebhookHandler {
  async process(): Promise<IWebhookResponseData> {
    const validation = await this.validate();
    if (!validation.success) {
      return validation.error!;
    }

    const body = this.webhookFunctions.getBodyData() as any;
    const event = body.event;

    // Prepara múltiplas saídas baseadas no evento
    const outputs: INodeExecutionData[][] = [];
    const totalOutputs = Object.keys(EVENT_CONFIG).length;

    // Inicializa todas as saídas como vazias
    for (let i = 0; i < totalOutputs; i++) {
      outputs.push([]);
    }

    // Encontra o �ndice correto para o evento
    const eventConfig = EVENT_CONFIG[event as keyof typeof EVENT_CONFIG];
    if (eventConfig && eventConfig.smartIndex !== undefined) {
      outputs[eventConfig.smartIndex] = [{ json: body }];
    }

    return {
      workflowData: outputs,
    };
  }

  protected getDescription(): string {
    return 'Modo Smart - separando eventos em saídas diferentes';
  }
}