export type FinanceAction =
  | 'invoice.createDraft'
  | 'invoice.send'
  | 'payment.record'
  | 'forecast.cashflow';

export interface FinanceConnector {
  health(): Promise<boolean>;
  dryRun(action: FinanceAction, payload: any): Promise<{ valid: boolean; warnings?: string[] }>;
  simulate(action: FinanceAction, payload: any): Promise<{ previewUrl?: string; forecast?: any }>;
  execute(action: FinanceAction, payload: any): Promise<{ externalId?: string; status?: string }>;
}
