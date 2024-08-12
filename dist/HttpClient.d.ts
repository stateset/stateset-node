/// <reference types="node" />
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as https from 'https';
export declare class HttpClient {
    private axiosInstance;
    constructor(agent?: https.Agent);
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
export default HttpClient;
