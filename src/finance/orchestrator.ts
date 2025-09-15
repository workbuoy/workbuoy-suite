import { runCapability } from '../core/capabilityRunner';
import type { FinanceConnector } from '../connectors/finance';

export class FinanceOrchestrator {
  constructor(private connector: FinanceConnector) {}

  async prepareDraft(input: any, ctx: { autonomy_level: any; tenantId: string; role: string }) {
    return runCapability('finance.invoice.prepareDraft', input, ctx, {
      observe: async () => {},
      suggest: async () => (await this.connector.simulate('invoice.createDraft', input)),
      prepare: async () => (await this.connector.simulate('invoice.createDraft', input)),
      execute: async () => (await this.connector.execute('invoice.createDraft', input)),
    });
  }

  async sendInvoice(input: any, ctx: { autonomy_level: any; tenantId: string; role: string }) {
    return runCapability('finance.invoice.send', input, ctx, {
      observe: async () => {},
      suggest: async () => ({ message: 'Klar til å sende (krever godkjenning)' }),
      prepare: async () => ({ message: 'Utkast klart – venter godkjenning' }),
      execute: async () => (await this.connector.execute('invoice.send', input)),
    });
  }

  async suggestReminder(input: any, ctx: { autonomy_level: any; tenantId: string; role: string }) {
    return runCapability('finance.payment.suggestReminder', input, ctx, {
      observe: async () => {},
      suggest: async () => ({ draftEmail: renderReminderEmail(input) }),
      prepare: async () => ({ draftEmail: renderReminderEmail(input) }),
    });
  }

  async forecastCashflow(input: any, ctx: { autonomy_level: any; tenantId: string; role: string }) {
    return runCapability('finance.forecast.cashflow', input, ctx, {
      suggest: async () => (await this.connector.simulate('forecast.cashflow', input)),
      prepare: async () => (await this.connector.simulate('forecast.cashflow', input)),
      execute: async () => (await this.connector.simulate('forecast.cashflow', input)),
    });
  }
}

export function renderReminderEmail({ invoiceId, customerEmail }:{ invoiceId: string; customerEmail?: string }){
  return `Hei${customerEmail ? ' ' + customerEmail : ''},
Dette er en vennlig påminnelse om faktura ${invoiceId}.
Vennlig hilsen, Teamet`;
}
