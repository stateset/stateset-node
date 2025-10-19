import { BaseResource } from '../core/base-resource';
import { EnhancedHttpClient } from '../core/http-client';
import { Order, Product, Customer, Shipment, WorkOrder, Agent } from '../types';

// Placeholder resource implementations
export class OrdersResource extends BaseResource<Order> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'orders');
  }
}

export class ProductsResource extends BaseResource<Product> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'products');
  }
}

export class CustomersResource extends BaseResource<Customer> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'customers');
  }
}

export class ShipmentsResource extends BaseResource<Shipment> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'shipments');
  }
}

export class WorkOrdersResource extends BaseResource<WorkOrder> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'work-orders');
  }
}

export class AgentsResource extends BaseResource<Agent> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'agents');
  }
}

export class InventoryResource extends BaseResource<any> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'inventory');
  }
}
