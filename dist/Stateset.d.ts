import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Returns from './lib/resources/Return';
interface StatesetOptions {
    apiKey: string;
    baseUrl?: string;
}
export declare class Stateset {
    private readonly options;
    private client;
    returns: Returns;
    constructor(options: StatesetOptions);
    private setupInterceptors;
    private handleError;
    getApiField(field: string): any;
    request(method: string, path: string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse>;
}
export default Stateset;
//# sourceMappingURL=Stateset.d.ts.map