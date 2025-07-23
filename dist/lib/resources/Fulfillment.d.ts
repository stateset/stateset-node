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
    /**
     * Create fulfillment
     * @param data - FulfillmentData object
     * @returns FulfillmentResponse object
     */
    create(data: FulfillmentData): Promise<FulfillmentResponse>;
    /**
     * Get fulfillment
     * @param id - Fulfillment ID
     * @returns FulfillmentResponse object
     */
    get(id: string): Promise<FulfillmentResponse>;
    /**
     * Update fulfillment
     * @param id - Fulfillment ID
     * @param data - Partial<FulfillmentData> object
     * @returns FulfillmentResponse object
     */
    update(id: string, data: Partial<FulfillmentData>): Promise<FulfillmentResponse>;
    /**
     * List fulfillments
     * @param params - Optional filtering parameters
     * @returns Array of FulfillmentResponse objects
     */
    list(params?: any): Promise<FulfillmentResponse[]>;
    /**
     * Cancel fulfillment
     * @param id - Fulfillment ID
     * @returns CancelledFulfillmentResponse object
     */
    cancel(id: string): Promise<CancelledFulfillmentResponse>;
    /**
     * Create shipment
     * @param id - Fulfillment ID
     * @param data - ShipmentData object
     * @returns ShippedFulfillmentResponse object
     */
    createShipment(id: string, data: ShipmentData): Promise<ShippedFulfillmentResponse>;
    /**
     * Get shipments
     * @param id - Fulfillment ID
     * @returns Array of ShipmentData objects
     */
    getShipments(id: string): Promise<ShipmentData[]>;
    /**
     * Update tracking information
     * @param id - Fulfillment ID
     * @param data - TrackingData object
     * @returns FulfillmentResponse object
     */
    updateTracking(id: string, data: TrackingData): Promise<FulfillmentResponse>;
    /**
     * Process fulfillment
     * @param id - Fulfillment ID
     * @returns ProcessingFulfillmentResponse object
     */
    process(id: string): Promise<ProcessingFulfillmentResponse>;
    /**
     * Mark fulfillment as delivered
     * @param id - Fulfillment ID
     * @returns DeliveredFulfillmentResponse object
     */
    markAsDelivered(id: string): Promise<DeliveredFulfillmentResponse>;
}
export {};
//# sourceMappingURL=Fulfillment.d.ts.map