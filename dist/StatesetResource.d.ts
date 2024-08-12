import Stateset from './Stateset';
import StatesetMethod from './StatesetMethod';
declare class StatesetResource {
    private _stateset;
    private _httpClient;
    basePath: (urlData: any) => string;
    path: (urlData: any) => string;
    resourcePath: string;
    static extend: (sub: any) => any;
    static method: typeof StatesetMethod;
    static BASIC_METHODS: any;
    static MAX_BUFFERED_REQUEST_METRICS: number;
    constructor(stateset: Stateset, deprecatedUrlData?: any);
    createFullPath(commandPath: string | ((urlData: any) => string), urlData: any): string;
    createResourcePathWithSymbols(pathWithSymbols?: string): string;
    private _joinUrlParts;
    private _getRequestOptions;
    _request(method: string, host: string, path: string, data: any, auth: string, options: any, callback: (error: Error | null, response?: any) => void): void;
    private _handleResponse;
    private _handleError;
}
export default StatesetResource;
