import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';
import Returns from './lib/resources/Return';

interface StatesetOptions {
  apiKey: string;
  baseUrl?: string;
}

export class Stateset {
  private client: AxiosInstance;
  public returns!: Returns;

  constructor(private readonly options: StatesetOptions) {
    const baseURL = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'brackets', encode: false }),
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error))
    );
  }

  private handleError(error: any): any {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return error;
  }

  getApiField(field: string): any {
    switch (field) {
      case 'auth':
        return `Bearer ${this.options.apiKey}`;
      case 'basePath':
      case 'host':
        return this.options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
      case 'httpClient':
        return this.client;
      default:
        return null;
    }
  }

  request(method: string, path: string, data: any, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return this.client.request({
      method,
      url: path,
      data,
      ...options,
    });
  }
}

export default Stateset;