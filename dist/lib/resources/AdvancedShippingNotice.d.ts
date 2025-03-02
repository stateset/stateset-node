import { stateset } from '../../stateset-client';
export declare enum ASNStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
interface Address {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}
export interface ASNItem {
    purchase_order_item_id: string;
    quantity_shipped: number;
    package_number?: string;
}
export interface ASNData {
    purchase_order_id: string;
    carrier: string;
    tracking_number: string;
    expected_delivery_date: string;
    ship_from_address: Address;
    ship_to_address: Address;
    items: ASNItem[];
    metadata?: Record<string, any>;
}
interface BaseASNResponse {
    id: string;
    object: 'asn';
    created_at: string;
    updated_at: string;
    status: ASNStatus;
    data: ASNData;
}
export type ASNResponse = BaseASNResponse & {
    [K in ASNStatus]: {
        status: K;
    } & (K extends ASNStatus.DRAFT ? {
        draft: true;
    } : K extends ASNStatus.SUBMITTED ? {
        submitted: true;
    } : K extends ASNStatus.IN_TRANSIT ? {
        in_transit: true;
    } : K extends ASNStatus.DELIVERED ? {
        delivered: true;
    } : K extends ASNStatus.CANCELLED ? {
        cancelled: true;
        cancellation_reason?: string;
    } : {});
}[ASNStatus];
export declare class ASNError extends Error {
    constructor(message: string, name: string);
}
export declare class ASNNotFoundError extends ASNError {
    constructor(asnId: string);
}
export declare class ASNStateError extends ASNError {
    constructor(message: string);
}
export declare class ASN {
    private readonly client;
    constructor(client: stateset);
    private request;
    private normalizeResponse;
    list(params?: {
        status?: ASNStatus;
        purchase_order_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        asns: ASNResponse[];
        total: number;
    }>;
    get(asnId: string): Promise<ASNResponse>;
    create(asnData: ASNData): Promise<ASNResponse>;
    update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse>;
    delete(asnId: string): Promise<void>;
    submit(asnId: string): Promise<ASNResponse>;
    markInTransit(asnId: string, transitDetails?: {
        departure_date?: string;
        estimated_arrival_date?: string;
        carrier_status_updates?: string;
    }): Promise<ASNResponse>;
    markDelivered(asnId: string, deliveryDetails: {
        delivery_date: string;
        received_by?: string;
        delivery_notes?: string;
    }): Promise<ASNResponse>;
    cancel(asnId: string, cancellationDetails?: {
        reason?: string;
    }): Promise<ASNResponse>;
    addItem(asnId: string, item: ASNItem): Promise<ASNResponse>;
    removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse>;
    updateShippingInfo(asnId: string, shippingInfo: {
        carrier?: string;
        tracking_number?: string;
        expected_delivery_date?: string;
    }): Promise<ASNResponse>;
    getTracking(asnId: string): Promise<{
        status: ASNStatus;
        tracking_number: string;
        carrier: string;
        estimated_delivery_date: string;
        events: Array<{
            timestamp: string;
            location: string;
            description: string;
        }>;
    }>;
}
export default ASN;
