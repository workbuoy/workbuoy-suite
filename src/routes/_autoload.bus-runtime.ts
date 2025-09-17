// src/routes/_autoload.bus-runtime.ts
// Ensures unified bus is non-noop at runtime by swapping in a simple in-proc priority bus if needed.
type Handler = (payload:any)=>Promise<void>|void;
type Priority = 'high'|'medium'|'low';

class InProcPriorityBus {
  private q: Record<Priority, Array<{type:string,payload:any}>> = { high:[], medium:[], low:[] };
  private handlers: Record<string, Handler[]> = {};
  async emit<T>(type:string, payload:T, opts?:{priority?:Priority,idempotencyKey?:string}) {
    const p:Priority = opts?.priority || 'medium';
    this.q[p].push({ type, payload });
    queueMicrotask(()=>this.drain());
  }
  on(type:string, h:Handler){ (this.handlers[type] ||= []).push(h as Handler); }
  async stats(){
    const summary = {
      high: this.q.high.length,
      medium: this.q.medium.length,
      low: this.q.low.length,
      dlq: 0
    } as const;
    return {
      summary,
      queues:[
        {name:'high',size:summary.high,events:[...this.q.high]},
        {name:'medium',size:summary.medium,events:[...this.q.medium]},
        {name:'low',size:summary.low,events:[...this.q.low]}
      ],
      dlq:[]
    };
  }
  private async drain(){
    for (const name of ['high','medium','low'] as Priority[]) {
      const arr = this.q[name];
      while (arr.length) {
        const { type, payload } = arr.shift()!;
        const hs = this.handlers[type] || [];
        for (const h of hs) { try { await h(payload); } catch {/* swallow */} }
      }
    }
  }
}

function tryRequire(p:string){ try { return require(p); } catch { return null; } }

(function bindBus(){
  const mod = tryRequire('../core/eventBusV2') || tryRequire('../core/eventBus');
  if (!mod) return;
  const b = mod.bus || mod.default || mod;
  const isValid = !!(b && typeof b.emit==='function' && typeof b.on==='function' && typeof b.stats==='function');
  if (!isValid) {
    const runtime = new InProcPriorityBus();
    (mod as any).bus = runtime;
    if ('default' in mod) (mod as any).default = runtime;
    (mod as any).emit = runtime.emit.bind(runtime);
    (mod as any).on = runtime.on.bind(runtime);
    (mod as any).stats = runtime.stats.bind(runtime);
    // eslint-disable-next-line no-console
    console.warn('[bus-runtime-patch] Using in-proc priority bus fallback');
  }
})();

export {};
