declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    params: Record<string, any>;
    query: Record<string, any>;
    body?: any;
    header(name: string): string | undefined;
  }

  export interface Response extends ServerResponse {
    json(body: any): this;
    status(code: number): this;
    send(body?: any): this;
    end(body?: any): this;
    setHeader(name: string, value: string): this;
  }

  export type NextFunction = () => void;

  export interface Router {
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    use(...args: any[]): Router;
  }

  export interface Express extends Router {
    use(...args: any[]): Express;
  }

  export type ExpressFactory = {
    (): Express;
    Router(): Router;
    json(): any;
  };

  const express: ExpressFactory;

  export default express;
  export function Router(): Router;
  export function json(): any;
}
