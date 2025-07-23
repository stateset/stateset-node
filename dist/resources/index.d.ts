import { BaseResource } from '../core/base-resource';
import { HttpClient } from '../core/http-client';
import { Order, Product, Customer, Shipment, WorkOrder, Agent } from '../types';
export declare class OrdersResource extends BaseResource<Order> {
    constructor(httpClient: HttpClient);
}
export declare class ProductsResource extends BaseResource<Product> {
    constructor(httpClient: HttpClient);
}
export declare class CustomersResource extends BaseResource<Customer> {
    constructor(httpClient: HttpClient);
}
export declare class ShipmentsResource extends BaseResource<Shipment> {
    constructor(httpClient: HttpClient);
}
export declare class WorkOrdersResource extends BaseResource<WorkOrder> {
    constructor(httpClient: HttpClient);
}
export declare class AgentsResource extends BaseResource<Agent> {
    constructor(httpClient: HttpClient);
}
export declare class InventoryResource extends BaseResource<any> {
    constructor(httpClient: HttpClient);
}
//# sourceMappingURL=index.d.ts.map