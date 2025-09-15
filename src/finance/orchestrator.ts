import { runCapability } from '../core/capabilityRunner';
import type { Autonomy } from '../core/types';
import type { FinanceConnector } from '../connectors/finance';

export class FinanceOrchestrator {
  constructor(private connector: FinanceConnector) {}

  prepareDraft(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.invoice.prepareDraft', input, ctx, {
      suggest: async () => {
        const r = await this.connector.simulate('invoice.createDraft', input);
        return { previewUrl: r.previewUrl };
      },
      prepare: async () => {
        const r = await this.connector.simulate('invoice.createDraft', input);
        return { previewUrl: r.previewUrl };
      },
      execute: async () => {
        const r = await this.connector.execute('invoice.createDraft', input);
        return { externalId: r.externalId };
      }
    });
  }

  sendInvoice(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.invoice.send', input, ctx, {
      suggest: async () => ({ message:'Klar til å sende (krever godkjenning)' } as any),
      prepare: async () => ({ message:'Utkast klart – venter godkjenning' } as any),
      execute: async () => {
        const r = await this.connector.execute('invoice.send', input);
        return { status: r.status };
      }
    });
  }

  forecastCashflow(input:any, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
    return runCapability('finance.forecast.cashflow', input, ctx, {
      suggest: async () => (await this.connector.simulate('forecast.cashflow', input)) as any,
      prepare: async () => (await this.connector.simulate('forecast.cashflow', input)) as any,
      execute: async () => (await this.connector.simulate('forecast.cashflow', input)) as any
    });
  }

  suggestReminder(input:{ invoiceId:string, tenantId:string }, ctx:{ autonomy_level: Autonomy; tenantId: string; role: string }) {
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
