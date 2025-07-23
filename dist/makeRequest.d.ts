import { AxiosInstance } from 'axios';
interface MakeRequestOptions {
    method: string;
    path: string;
    data?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    spec?: any;
    args?: any[];
}
declare const makeRequest: (stateset: {
    _request: AxiosInstance;
}, options: MakeRequestOptions) => Promise<import("axios").AxiosResponse<any, any>>;
export default makeRequest;
//# sourceMappingURL=makeRequest.d.ts.map