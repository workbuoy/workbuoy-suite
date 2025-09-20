declare module 'express' {
  import { IncomingMessage, ServerResponse, Server } from 'http';

  export interface Request extends IncomingMessage {
    params: Record<string, any>;
    query: Record<string, any>;
    body?: any;
    header(name: string): string | undefined;
    wb?: any;
    originalUrl: string;
    path?: string;
    route?: { path?: string };
  }

  export interface Response extends ServerResponse {
    json(body: any): this;
    status(code: number): this;
    send(body?: any): this;
    end(body?: any): this;
    setHeader(name: string, value: string): this;
  }

  export type NextFunction = (err?: any) => void;
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;
  export type ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => any;

  export interface Router {
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    put?(path: string, ...handlers: RequestHandler[]): Router;
    delete?(path: string, ...handlers: RequestHandler[]): Router;
    use(...handlers: Array<RequestHandler | ErrorRequestHandler | Router | string>): Router;
  }

  export interface Express extends Router {
    use(...handlers: Array<RequestHandler | ErrorRequestHandler | Router | string>): Express;
    listen(port: number, ...args: any[]): Server;
  }

  export type ExpressFactory = {
    (): Express;
    Router(): Router;
    json(): RequestHandler;
  };

  const express: ExpressFactory;

  export default express;
  export function Router(): Router;
  export function json(): RequestHandler;
}
