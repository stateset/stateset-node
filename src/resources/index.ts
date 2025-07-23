import { BaseResource } from '../core/base-resource';
import { HttpClient } from '../core/http-client';
import { Order, Product, Customer, Shipment, WorkOrder, Agent } from '../types';

// Placeholder resource implementations
export class OrdersResource extends BaseResource<Order> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'orders');
  }
}

export class ProductsResource extends BaseResource<Product> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'products');
  }
}

export class CustomersResource extends BaseResource<Customer> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'customers');
  }
}

export class ShipmentsResource extends BaseResource<Shipment> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'shipments');
  }
}

export class WorkOrdersResource extends BaseResource<WorkOrder> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'work-orders');
  }
}

export class AgentsResource extends BaseResource<Agent> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'agents');
  }
}

export class InventoryResource extends BaseResource<any> {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'inventory');
  }
}