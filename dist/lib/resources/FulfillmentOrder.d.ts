import { stateset } from '../../stateset-client';
export type FulfillmentOrderStatus = 'OPEN' | 'ALLOCATED' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'CANCELLED';
interface BaseFulfillmentOrderResponse {
    id: string;
    object: 'fulfillmentorder';
    status: FulfillmentOrderStatus;
}
interface OpenFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'OPEN';
    open: true;
}
interface AllocatedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'ALLOCATED';
    allocated: true;
}
interface PickedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'PICKED';
    picked: true;
}
interface PackedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'PACKED';
    packed: true;
}
interface ShippedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'SHIPPED';
    shipped: true;
}
interface CancelledFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
    status: 'CANCELLED';
    cancelled: true;
}
export type FulfillmentOrderResponse = OpenFulfillmentOrderResponse | AllocatedFulfillmentOrderResponse | PickedFulfillmentOrderResponse | PackedFulfillmentOrderResponse | ShippedFulfillmentOrderResponse | CancelledFulfillmentOrderResponse;
export interface FulfillmentOrderLine {
    item_id: string;
    quantity: number;
    [key: string]: any;
}
export interface FulfillmentOrderData {
    order_id: string;
    warehouse_id: string;
    lines: FulfillmentOrderLine[];
    [key: string]: any;
}
declare class FulfillmentOrders {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<FulfillmentOrderResponse[]>;
    get(id: string): Promise<FulfillmentOrderResponse>;
    create(data: FulfillmentOrderData): Promise<FulfillmentOrderResponse>;
    update(id: string, data: Partial<FulfillmentOrderData>): Promise<FulfillmentOrderResponse>;
    delete(id: string): Promise<void>;
    allocate(id: string): Promise<AllocatedFulfillmentOrderResponse>;
    pick(id: string): Promise<PickedFulfillmentOrderResponse>;
    pack(id: string): Promise<PackedFulfillmentOrderResponse>;
    ship(id: string): Promise<ShippedFulfillmentOrderResponse>;
    cancel(id: string): Promise<CancelledFulfillmentOrderResponse>;
}
export default FulfillmentOrders;
