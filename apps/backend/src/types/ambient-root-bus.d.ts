// Ambient declaration so NodeNext typecheck doesn't choke on optional require()
declare module '../../../src/core/eventBusV2.js' {
  export const eventBus: {
    on(event: string, listener: (...args: any[]) => void): any;
    emit(event: string, ...args: any[]): boolean;
  };
}
