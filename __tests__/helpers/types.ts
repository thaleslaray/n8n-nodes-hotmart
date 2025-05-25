/**
 * Types for testing to avoid using 'any'
 */

export interface MockNodeParameters {
  triggerMode?: string;
  event?: string;
  events?: string[];
  useHotTokToken?: boolean;
  customizeOutputs?: boolean;
  outputName0?: string;
  outputName1?: string;
  outputName2?: string;
  outputName3?: string;
  outputName4?: string;
  outputName5?: string;
  outputName6?: string;
  outputName7?: string;
  outputName8?: string;
  outputName9?: string;
  outputName10?: string;
  outputName11?: string;
  outputName12?: string;
  outputName13?: string;
  outputName14?: string;
  outputName15?: string;
  outputName16?: string;
  outputName17?: string;
  outputName18?: string;
  outputName19?: string;
  outputName20?: string;
  outputNameSuper0?: string;
  outputNameSuper1?: string;
  outputNameSuper2?: string;
  outputNameSuper3?: string;
  outputNameSuper4?: string;
  outputNameSuper5?: string;
  outputNameSuper6?: string;
  outputNameSuper7?: string;
  outputNameSuper8?: string;
  outputNameSuper9?: string;
  outputNameSuper10?: string;
  outputNameSuper11?: string;
  outputNameSuper12?: string;
  outputNameSuper13?: string;
  outputNameSuper14?: string;
  outputNameSuper15?: string;
  outputNameSuper16?: string;
  outputNameSuper17?: string;
  [key: string]: string | string[] | boolean | undefined;
}

export interface MockWebhookData {
  event: string;
  data?: {
    purchase?: {
      transaction?: string;
      approved_date?: number;
      price?: number;
      recurrency_number?: number;
      payment?: {
        is_pix?: boolean;
        pix_qrcode?: string;
      };
    };
    subscription?: {
      subscriber_code?: string;
      status?: string;
    };
    product?: {
      name?: string;
    };
    plan?: {
      old?: string;
      new?: string;
    };
    charge_date?: {
      old?: string;
      new?: string;
    };
    user?: {
      id?: string;
    };
    accessed_at?: number;
    module?: {
      id?: string;
      name?: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}