export interface FinanceConnector {
  health(): Promise<boolean>;
  dryRun(action:'invoice.createDraft'|'invoice.send'|'payment.record', payload:any)
    : Promise<{ valid:boolean; warnings?:string[] }>;
  simulate(action:'invoice.createDraft'|'forecast.cashflow', payload:any)
    : Promise<{ previewUrl?:string; forecast?:any }>;
  execute(action:'invoice.createDraft'|'invoice.send'|'payment.record', payload:any)
    : Promise<{ externalId?:string; status?:string }>;
}
