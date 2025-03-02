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

  returnItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/return-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/return-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/return-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/return-items', params)),
  };

  warranties = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/warranties', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/warranties/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/warranties/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/warranties', params)),
  };

  warrantyItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/warranty-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/warranty-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/warranty-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/warranty-items', params)),
  };

  products = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/products', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/products/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/products/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/products', params)),
  };

  orders = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/orders', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/orders/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/orders/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/orders', params)),
  };

  orderItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/order-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/order-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/order-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/order-items', params)),
  };

  shipments = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/shipments', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/shipments/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/shipments/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/shipments', params)),
  };

  shipmentItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/shipment-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/shipment-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/shipment-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/shipment-items', params)),
  };

  inventory = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/inventory', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/inventory/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/inventory/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/inventory', params)),
  };

  customers = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/customers', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/customers/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/customers/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/customers', params)),
  };

  workorders = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/workorders', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/workorders/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/workorders/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/workorders', params)),
  };

  workorderItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/workorder-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/workorder-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/workorder-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/workorder-items', params)),
  };

  billOfMaterials = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/bill-of-materials', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/bill-of-material/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/bill-of-material/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/bill-of-material', params)),
  };

  purchaseOrders = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/purchase-orders', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/purchase-orders/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/purchase-orders/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/purchase-orders', params)),
  };

  purchaseOrderItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/purchase-order-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/purchase-order-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/purchase-order-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/purchase-order-items', params)),
  };

  manufacturerOrders = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/manufacturer-orders', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/manufacturer-orders/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/manufacturer-orders/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/manufacturer-orders', params)),
  };

  manufacturerOrderItems = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/manufacturer-order-items', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/manufacturer-order-items/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/manufacturer-order-items/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/manufacturer-order-items', params)),
  };

  channels = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/channels', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/channels/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/channels/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/channels', params)),
  };

  messages = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/messages', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/messages/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/messages/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/messages', params)),
  };

  agents = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/agents', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/agents/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/agents/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/agents', params)),
  };

  rules = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/rules', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/rules/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/rules/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/rules', params)),
  };

  attributes = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/attributes', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/attributes/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/attributes/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/attributes', params)),
  };

  workflows = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/workflows', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/workflows/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/workflows/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/workflows', params)),
  };

  users = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/users', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/users/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/users/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/users', params)),
  };

  settlements = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/settlements', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/settlements/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/settlements/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/settlements', params)),
  };

  payouts = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/payouts', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/payouts/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/payouts/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/payouts', params)),
  };

  picks = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/picks', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/picks/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/picks/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/picks', params)),
  };

  cycleCounts = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/cycle-counts', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/cycle-counts/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/cycle-counts/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/cycle-counts', params)),
  };

  machines = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/machines', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/machines/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/machines/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/machines', params)),
  };

  wasteAndScrap = {
    create: (params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('POST', '/waste-and-scrap', params)),
    retrieve: (id: string): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', `/waste-and-scrap/${id}`)),
    update: (id: string, params: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('PUT', `/waste-and-scrap/${id}`, params)),
    list: (params?: any): Promise<AxiosResponse> => 
      this.client(this.createOptions('GET', '/waste-and-scrap', params)),
  };
}

export default Stateset;