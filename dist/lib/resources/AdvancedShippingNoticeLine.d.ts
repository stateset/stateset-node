import { stateset } from '../../stateset-client';
interface ASNLineItem {
    id: string;
    asn_id: string;
    purchase_order_line_item_id: string;
    quantity_shipped: number;
    package_number?: string;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
    weight?: number;
    weight_unit?: 'LB' | 'KG';
    customs_value?: number;
    customs_currency?: string;
    country_of_origin?: string;
    hazmat_info?: {
        un_number?: string;
        class_division?: string;
        packing_group?: string;
    };
    status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    metadata?: Record<string, any>;
}
declare class ASNLines {
    private stateset;
    constructor(stateset: stateset);
    list(asnId?: string): Promise<ASNLineItem[]>;
    get(lineItemId: string): Promise<ASNLineItem>;
    create(lineItemData: Omit<ASNLineItem, 'id'>): Promise<ASNLineItem>;
    update(lineItemId: string, lineItemData: Partial<ASNLineItem>): Promise<ASNLineItem>;
    delete(lineItemId: string): Promise<void>;
    bulkCreate(asnId: string, lineItems: Array<Omit<ASNLineItem, 'id' | 'asn_id'>>): Promise<ASNLineItem[]>;
    updateTrackingInfo(lineItemId: string, trackingInfo: {
        package_number?: string;
        tracking_number?: string;
        carrier_status?: string;
    }): Promise<ASNLineItem>;
}
export default ASNLines;
