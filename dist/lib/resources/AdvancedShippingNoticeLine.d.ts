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
    /**
     * List ASN line items
     * @param asnId - ASN ID
     * @returns Array of ASNLineItem objects
     */
    list(asnId?: string): Promise<ASNLineItem[]>;
    /**
     * Get ASN line item
     * @param lineItemId - Line item ID
     * @returns ASNLineItem object
     */
    get(lineItemId: string): Promise<ASNLineItem>;
    /**
     * Create ASN line item
     * @param lineItemData - ASNLineItem object
     * @returns ASNLineItem object
     */
    create(lineItemData: Omit<ASNLineItem, 'id'>): Promise<ASNLineItem>;
    /**
     * Update ASN line item
     * @param lineItemId - Line item ID
     * @param lineItemData - Partial<ASNLineItem> object
     * @returns ASNLineItem object
     */
    update(lineItemId: string, lineItemData: Partial<ASNLineItem>): Promise<ASNLineItem>;
    /**
     * Delete ASN line item
     * @param lineItemId - Line item ID
     */
    delete(lineItemId: string): Promise<void>;
    /**
     * Bulk create ASN line items
     * @param asnId - ASN ID
     * @param lineItems - Array of ASNLineItem objects
     * @returns Array of ASNLineItem objects
     */
    bulkCreate(asnId: string, lineItems: Array<Omit<ASNLineItem, 'id' | 'asn_id'>>): Promise<ASNLineItem[]>;
    /**
     * Update tracking information for ASN line item
     * @param lineItemId - Line item ID
     * @param trackingInfo - TrackingInfo object
     * @returns ASNLineItem object
     */
    updateTrackingInfo(lineItemId: string, trackingInfo: {
        package_number?: string;
        tracking_number?: string;
        carrier_status?: string;
    }): Promise<ASNLineItem>;
}
export default ASNLines;
