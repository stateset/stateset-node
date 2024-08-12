import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as https from 'https';

export class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(agent?: https.Agent) {
    this.axiosInstance = axios.create({
      httpsAgent: agent,
      timeout: 80000, // Default timeout, can be overridden in requests
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  // Generic request method
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance(config);
  }

  // GET request
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'GET', url });
  }

  // POST request
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  // PUT request
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

export default HttpClient;
