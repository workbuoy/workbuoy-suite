/**
 * @typedef {{Object}} HealthResult
 * @property {{boolean}} ok
 * @property {{string=}} details
 */

/**
 * Minimal adapter interface
 * key: string; name: string; version: string;
 * enabled(store): boolean
 * enable(store, bool): void
 * health({{ authCtx }}): Promise<HealthResult>
 * apply(step, {{ authCtx, orgId }}): Promise<{{ ok: boolean, result?: any }}> 
 */
const key = 'google-calendar';
const name = 'Google Calendar';
const version = '0.1.0';

function enabled(store) {
  return !!store.get(`plugins.${key}.enabled`, false);
}
function enable(store, bool) {
  store.set(`plugins.${key}.enabled`, !!bool);
}

/** @param {{authCtx:any}} _ctx */
async function health(_ctx) {
  // Replace with real API pings
  return { ok: true };
}

/** @param {{qtype:string, entity?:string, op?:string, payload?:any}} step */
async function apply(step, {{ authCtx, orgId }}) { // eslint-disable-line no-unused-vars
  // This is a mock; real implementations should call external APIs.
  return {{ ok: true, result: {{ echoed: {{ step, orgId, hasAuth: !!authCtx }} }} }};
}

module.exports = {{ key, name, version, enabled, enable, health, apply }};
