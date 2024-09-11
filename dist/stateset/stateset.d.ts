import { AxiosResponse } from 'axios';
interface StatesetOptions {
    apiKey: string;
    baseUrl?: string;
}
declare class Stateset {
    private readonly options;
    private client;
    constructor(options: StatesetOptions);
    private setupInterceptors;
    private handleError;
    private createOptions;
    returns: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
}
export default Stateset;
