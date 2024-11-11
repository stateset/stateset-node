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
    list(): Promise<ASNResponse[]>;
    get(asnId: string): Promise<ASNResponse>;
    create(asnData: ASNData): Promise<ASNResponse>;
    update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse>;
    delete(asnId: string): Promise<void>;
    submit(asnId: string): Promise<SubmittedASNResponse>;
    markInTransit(asnId: string, transitDetails?: {
        departure_date?: string;
        estimated_arrival_date?: string;
        carrier_status_updates?: string;
    }): Promise<InTransitASNResponse>;
    markDelivered(asnId: string, deliveryDetails: {
        delivery_date: string;
        received_by?: string;
        delivery_notes?: string;
    }): Promise<DeliveredASNResponse>;
    cancel(asnId: string): Promise<CancelledASNResponse>;
    addItem(asnId: string, item: ASNData['items'][0]): Promise<ASNResponse>;
    removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse>;
    updateShippingInfo(asnId: string, shippingInfo: {
        carrier?: string;
        tracking_number?: string;
        expected_delivery_date?: string;
    }): Promise<ASNResponse>;
}
export default ASN;
