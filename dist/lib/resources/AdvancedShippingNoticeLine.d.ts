import type { ApiClientLike } from '../../types';
export declare enum WeightUnit {
    LB = "LB",
    KG = "KG"
}
export declare enum LineItemStatus {
    PENDING = "PENDING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED"
}
export interface HazmatInfo {
    un_number?: string;
    class_division?: string;
    packing_group?: string;
}
export interface ASNLineItem {
    id: string;
    asn_id: string;
    purchase_order_line_item_id: string;
    quantity_shipped: number;
    package_number?: string;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
    weight?: number;
    weight_unit?: WeightUnit;
    customs_value?: number;
    customs_currency?: string;
    country_of_origin?: string;
    hazmat_info?: HazmatInfo;
    status: LineItemStatus;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
}
export declare class ASNLineError extends Error {
    constructor(message: string, name: string);
}
export declare class ASNLineNotFoundError extends ASNLineError {
    constructor(lineItemId: string);
}
export declare class ASNLineValidationError extends ASNLineError {
    constructor(message: string);
}
type CreateASNLineItem = Omit<ASNLineItem, 'id' | 'created_at' | 'updated_at' | 'status'> & {
    status?: LineItemStatus;
};
export declare class ASNLines {
    private readonly client;
    constructor(client: ApiClientLike);
    private request;
    private validateLineItem;
    list(params?: {
        asn_id?: string;
        status?: LineItemStatus;
        purchase_order_line_item_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        line_items: ASNLineItem[];
        total: number;
    }>;
    get(lineItemId: string): Promise<ASNLineItem>;
    create(lineItemData: CreateASNLineItem): Promise<ASNLineItem>;
    update(lineItemId: string, lineItemData: Partial<ASNLineItem>): Promise<ASNLineItem>;
    delete(lineItemId: string): Promise<void>;
    bulkCreate(asnId: string, lineItems: Array<Omit<CreateASNLineItem, 'asn_id'>>): Promise<ASNLineItem[]>;
    updateTrackingInfo(lineItemId: string, trackingInfo: {
        package_number?: string;
        tracking_number?: string;
        carrier_status?: string;
    }): Promise<ASNLineItem>;
    updateStatus(lineItemId: string, status: LineItemStatus, statusDetails?: {
        timestamp?: string;
        notes?: string;
    }): Promise<ASNLineItem>;
    getTrackingHistory(lineItemId: string, params?: {
        from_date?: Date;
        to_date?: Date;
    }): Promise<Array<{
        timestamp: string;
        status: LineItemStatus;
        package_number?: string;
        tracking_number?: string;
        carrier_status?: string;
        notes?: string;
    }>>;
}
export default ASNLines;
//# sourceMappingURL=AdvancedShippingNoticeLine.d.ts.map