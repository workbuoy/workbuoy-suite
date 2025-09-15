import { runCapability } from '../core/capabilityRunner';
import type { Autonomy } from '../core/types';
import type { FinanceConnector } from '../connectors/finance';

/**
 * Resilient orchestrator:
 * - simulate/execute calls wrapped in try/catch to ensure degraded outputs when downstream fails
 */
export class FinanceOrchestrator {
  constructor(private connector: FinanceConnector) {}

  async prepareDraft(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.invoice.prepareDraft', input, ctx, {
      suggest: async () => {
        try {
          const r = await this.connector.simulate('invoice.createDraft', input);
          return { previewUrl: r.previewUrl };
        } catch {
          return { previewUrl: undefined, degraded: true };
        }
      },
      prepare: async () => {
        try {
          const r = await this.connector.simulate('invoice.createDraft', input);
          return { previewUrl: r.previewUrl };
        } catch {
          return { previewUrl: undefined, degraded: true };
        }
      },
      execute: async () => {
        try {
          const r = await this.connector.execute('invoice.createDraft', input);
          return { externalId: r.externalId };
        } catch {
          // allow runner to record degraded outcome via fallback
          throw new Error('connector_execute_failed');
        }
      }
    });
  }

  async sendInvoice(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.invoice.send', input, ctx, {
      suggest: async () => ({ message:'Klar til å sende (krever godkjenning)' } as any),
      prepare: async () => ({ message:'Utkast klart – venter godkjenning' } as any),
      execute: async () => {
        try {
          const r = await this.connector.execute('invoice.send', input);
        return { status: r.status };
        } catch {
          throw new Error('connector_execute_failed');
        }
      }
    });
  }

  async forecastCashflow(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.forecast.cashflow', input, ctx, {
      suggest: async () => {
        try { return (await this.connector.simulate('forecast.cashflow', input)) as any; }
        catch { return { forecast: [], degraded: true } as any; }
      },
      prepare: async () => {
        try { return (await this.connector.simulate('forecast.cashflow', input)) as any; }
        catch { return { forecast: [], degraded: true } as any; }
      },
      execute: async () => {
        try { return (await this.connector.simulate('forecast.cashflow', input)) as any; }
        catch { return { forecast: [], degraded: true } as any; }
      }
    });
  }

  async suggestReminder(input:{ invoiceId:string, tenantId:string }, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.payment.suggestReminder', input, ctx, {
      suggest: async () => ({ draftEmail: this.renderReminderEmail(input) } as any),
      prepare: async () => ({ draftEmail: this.renderReminderEmail(input) } as any),
    });
  }

  private renderReminderEmail({ invoiceId }:{ invoiceId:string }){
    return `Hei,
Dette er en vennlig påminnelse om faktura ${invoiceId}.
Vennlig hilsen,
Workbuoy`;
  }
}
