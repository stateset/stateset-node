import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

interface StatesetOptions {
  apiKey: string;
  baseUrl?: string;
}

interface RequestOptions extends AxiosRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: {
    Authorization: string;
  };
  data?: any;
  params?: any;
}

class Stateset {
  private client: AxiosInstance;

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

  private createOptions(method: RequestOptions['method'], path: string, params?: any): RequestOptions {
    const options: RequestOptions = {
      method,
      url: path,
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
      },
    };

    if (method === 'GET') {
      options.params = params;
    } else {
      options.data = params;
    }

    return options;
  }

  returns = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/returns', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/returns/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/returns/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/returns', params)),
  };
  
}

export default Stateset;