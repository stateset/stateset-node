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
}, options: MakeRequestOptions) => import("axios").AxiosPromise<any>;
export default makeRequest;
