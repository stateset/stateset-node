import { stateset } from '../../stateset-client';
type ASNStatus = 'DRAFT' | 'SUBMITTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
interface BaseASNResponse {
    id: string;
    object: 'asn';
    status: ASNStatus;
}
interface DraftASNResponse extends BaseASNResponse {
    status: 'DRAFT';
    draft: true;
}
interface SubmittedASNResponse extends BaseASNResponse {
    status: 'SUBMITTED';
    submitted: true;
}
interface InTransitASNResponse extends BaseASNResponse {
    status: 'IN_TRANSIT';
    in_transit: true;
}
interface DeliveredASNResponse extends BaseASNResponse {
    status: 'DELIVERED';
    delivered: true;
}
interface CancelledASNResponse extends BaseASNResponse {
    status: 'CANCELLED';
    cancelled: true;
}
type ASNResponse = DraftASNResponse | SubmittedASNResponse | InTransitASNResponse | DeliveredASNResponse | CancelledASNResponse;
interface ASNData {
    purchase_order_id: string;
    carrier: string;
    tracking_number: string;
    expected_delivery_date: string;
    ship_from_address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    ship_to_address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    items: {
        purchase_order_item_id: string;
        quantity_shipped: number;
        package_number?: string;
    }[];
    [key: string]: any;
}
declare class ASN {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    /**
     * List ASNs
     * @returns Array of ASNResponse objects
     */
    list(): Promise<ASNResponse[]>;
    /**
     * Get ASN
     * @param asnId - ASN ID
     * @returns ASNResponse object
     */
    get(asnId: string): Promise<ASNResponse>;
    /**
     * Create ASN
     * @param asnData - ASNData object
     * @returns ASNResponse object
     */
    create(asnData: ASNData): Promise<ASNResponse>;
    /**
     * Update ASN
     * @param asnId - ASN ID
     * @param asnData - Partial<ASNData> object
     * @returns ASNResponse object
     */
    update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse>;
    /**
     * Delete ASN
     * @param asnId - ASN ID
     */
    delete(asnId: string): Promise<void>;
    /**
     * Submit ASN
     * @param asnId - ASN ID
     * @returns SubmittedASNResponse object
     */
    submit(asnId: string): Promise<SubmittedASNResponse>;
    /**
     * Mark ASN as in transit
     * @param asnId - ASN ID
     * @param transitDetails - TransitDetails object
     * @returns InTransitASNResponse object
     */
    markInTransit(asnId: string, transitDetails?: {
        departure_date?: string;
        estimated_arrival_date?: string;
        carrier_status_updates?: string;
    }): Promise<InTransitASNResponse>;
    /**
     * Mark ASN as delivered
     * @param asnId - ASN ID
     * @param deliveryDetails - DeliveryDetails object
     * @returns DeliveredASNResponse object
     */
    markDelivered(asnId: string, deliveryDetails: {
        delivery_date: string;
        received_by?: string;
        delivery_notes?: string;
    }): Promise<DeliveredASNResponse>;
    /**
     * Cancel ASN
     * @param asnId - ASN ID
     * @returns CancelledASNResponse object
     */
    cancel(asnId: string): Promise<CancelledASNResponse>;
    /**
     * Add item to ASN
     * @param asnId - ASN ID
     * @param item - ASNData['items'][0] object
     * @returns ASNResponse object
     */
    addItem(asnId: string, item: ASNData['items'][0]): Promise<ASNResponse>;
    /**
     * Remove item from ASN
     * @param asnId - ASN ID
     * @param purchaseOrderItemId - Purchase order item ID
     * @returns ASNResponse object
     */
    removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse>;
    /**
     * Update shipping information for ASN
     * @param asnId - ASN ID
     * @param shippingInfo - ShippingInfo object
     * @returns ASNResponse object
     */
    updateShippingInfo(asnId: string, shippingInfo: {
        carrier?: string;
        tracking_number?: string;
        expected_delivery_date?: string;
    }): Promise<ASNResponse>;
}
export default ASN;
