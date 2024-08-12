import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
const qs = require('qs');

interface StatesetOptions {
  arrayFormat: 'brackets';
  encode: boolean;
}

interface RequestOptions extends AxiosRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: {
    Authorization: string;
  };
  data?: any;
  params?: any;
  paramsSerializer?: (params: any) => string;
}

class Stateset {
  private apiKey: string;
  private baseUri: string;
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUri = `https://api.stateset.com/v1`;

    this.client = axios.create({
      baseURL: this.baseUri,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'brackets', encode: false }),
    });

    // Interceptors for request/response (optional)
    this.client.interceptors.request.use(
      (config) => {
        // Add logic before request is sent
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        // Any status code that lies within the range of 2xx cause this function to trigger
        return response;
      },
      (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): any {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('No response received:', error.request);
    } else {
      // Other errors (e.g., configuration)
      console.error('Error:', error.message);
    }
    return error;
  }

  private createOptions(method: RequestOptions['method'], path: string, params?: any): RequestOptions {
    const options: RequestOptions = {
      method,
      url: path,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    if (method === 'GET') {
      options.params = params;
    } else {
      options.data = params;
    }

    return options;
  }

  // Example of a converted resource method
  accounts = {
    create: (params: any) => this.client(this.createOptions('POST', '/accounts', params)),
    retrieve: (id: string) => this.client(this.createOptions('GET', `/accounts/${id}`)),
    update: (id: string, params: any) => this.client(this.createOptions('PUT', `/accounts/${id}`, params)),
    list: (params: any) => this.client(this.createOptions('GET', '/accounts', params)),
  };

  // Add other resources here...
  transactions = {
    create: (params: any) => this.client(this.createOptions('POST', '/transactions', params)),
    retrieve: (id: string) => this.client(this.createOptions('GET', `/transactions/${id}`)),
    list: (params: any) => this.client(this.createOptions('GET', '/transactions', params)),
  };


}

export = (apiKey: string) => new Stateset(apiKey);