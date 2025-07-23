import { AxiosInstance } from 'axios';
export interface StatesetMethodOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path?: string;
    fullPath?: string;
    urlParams?: string[];
    encode?: (data: any) => any;
    host?: string;
    methodType?: 'list' | 'search' | string;
}
interface StatesetResource {
    createResourcePathWithSymbols(path: string): string;
    _request: AxiosInstance;
    [key: string]: any;
}
type StatesetMethodFunction = (this: StatesetResource, ...args: any[]) => Promise<any>;
/**
 * Creates a method for interacting with the Stateset API.
 * @param {MethodSpec} spec - The specification for the method, defining the HTTP method, path, etc.
 * @returns {StatesetMethodFunction} - The function to be used for making the API request.
 */
declare function statesetMethod(spec: StatesetMethodOptions): StatesetMethodFunction;
export default statesetMethod;
//# sourceMappingURL=StatesetMethod.d.ts.map