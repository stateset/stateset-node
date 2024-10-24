type FulfillmentStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
interface BaseFulfillmentResponse {
    id: string;
    object: 'fulfillment';
    status: FulfillmentStatus;
}
interface PendingFulfillmentResponse extends BaseFulfillmentResponse {
    status: 'PENDING';
    pending: true;
}
interface ProcessingFulfillmentResponse extends BaseFulfillmentResponse {
    status: 'PROCESSING';
    processing: true;
}
interface ShippedFulfillmentResponse extends BaseFulfillmentResponse {
    status: 'SHIPPED';
    shipped: true;
}
interface DeliveredFulfillmentResponse extends BaseFulfillmentResponse {
    status: 'DELIVERED';
    delivered: true;
}
interface CancelledFulfillmentResponse extends BaseFulfillmentResponse {
    status: 'CANCELLED';
    cancelled: true;
}
type FulfillmentResponse = PendingFulfillmentResponse | ProcessingFulfillmentResponse | ShippedFulfillmentResponse | DeliveredFulfillmentResponse | CancelledFulfillmentResponse;
interface FulfillmentData {
    order_id: string;
    items: {
        item_id: string;
        quantity: number;
    }[];
    shipping_address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    [key: string]: any;
}
interface ShipmentData {
    carrier: string;
    tracking_number: string;
    shipping_method: string;
    [key: string]: any;
}
interface TrackingData {
    tracking_number: string;
    status: string;
    estimated_delivery_date?: string;
    [key: string]: any;
}
export default class Fulfillment {
    private client;
    constructor(client: any);
    private handleCommandResponse;
    create(data: FulfillmentData): Promise<FulfillmentResponse>;
    get(id: string): Promise<FulfillmentResponse>;
    update(id: string, data: Partial<FulfillmentData>): Promise<FulfillmentResponse>;
    list(params?: any): Promise<FulfillmentResponse[]>;
    cancel(id: string): Promise<CancelledFulfillmentResponse>;
    createShipment(id: string, data: ShipmentData): Promise<ShippedFulfillmentResponse>;
    getShipments(id: string): Promise<ShipmentData[]>;
    updateTracking(id: string, data: TrackingData): Promise<FulfillmentResponse>;
    process(id: string): Promise<ProcessingFulfillmentResponse>;
    markAsDelivered(id: string): Promise<DeliveredFulfillmentResponse>;
}
export {};
