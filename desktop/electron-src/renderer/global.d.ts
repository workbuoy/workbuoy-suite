export {};
declare global {
  interface Window {
    wb: {
      notify: (title: string, body?: string)=>Promise<{ok:boolean,error?:string}>;
      updater: {
        check: ()=>Promise<any>;
        download: ()=>Promise<any>;
        install: ()=>Promise<any>;
        onEvent: (cb:(e:any)=>void)=>void;
      }
    }
  }
}
