import Returns from './lib/resources/Return';
import Warranties from './lib/resources/Warranty';
import Orders from './lib/resources/Order';
import Shipments from './lib/resources/Shipment';
import Inventory from './lib/resources/Inventory';
import Customers from './lib/resources/Customer';

interface StatesetOptions {
  apiKey: string;
  baseUrl?: string;
}

export class stateset {
  private baseUrl: string;
  private apiKey: string;
  public returns: Returns;
  public warranties: Warranties;
  public orders: Orders;
  public shipments: Shipments;
  public inventory: Inventory;
  public customers: Customers;


  constructor(options: StatesetOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
    this.returns = new Returns(this);
    this.warranties = new Warranties(this);
    this.orders = new Orders(this);
    this.shipments = new Shipments(this);
    this.inventory = new Inventory(this);
    this.customers = new Customers(this);
  }

  async request(method: string, path: string, data?: any) {
    const url = `${this.baseUrl}/${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    console.log(`Making ${method} request to ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in Stateset request:', error);
      throw error;
    }
  }
}

export default stateset;