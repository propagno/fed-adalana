declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string;
    transports?: string[];
    sessionId?: number | (() => number);
    timeout?: number;
    devel?: boolean;
    debug?: boolean;
    protocols_whitelist?: string[];
    [key: string]: any;
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[] | null, options?: SockJSOptions);
    readyState: number;
    protocol: string;
    extensions: string;
    url: string;
    version: string;
    
    onopen: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onclose: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    
    send(data: string): void;
    close(code?: number, reason?: string): void;
    
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }

  export = SockJS;
}

