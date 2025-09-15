import { publish } from '../../core/events/publish';
export class CRMConnector {
  health() { return { ok: true, ts: new Date().toISOString() }; }
  async simulate(payload: any) {
    const result = { accepted: true, echo: payload };
    await publish('crm.simulated', { result });
    return result;
  }
  async dryRun(payload: any) { return { wouldDo: 'createLead', payload }; }
}
