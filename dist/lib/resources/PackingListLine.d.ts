import { stateset } from '../../stateset-client';
interface PackingListLineItem {
    id: string;
    packing_list_id: string;
    purchase_order_line_item_id: string;
    package_number: string;
    quantity_packed: number;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
    location?: {
        warehouse_id: string;
        zone?: string;
        bin?: string;
    };
    quality_check?: {
        inspector: string;
        inspection_date: string;
        passed: boolean;
        notes?: string;
    };
    special_handling?: string[];
    packaging_type?: string;
    status?: 'PACKED' | 'VERIFIED' | 'SHIPPED';
    metadata?: Record<string, any>;
}
declare class PackingListLines {
    private stateset;
    constructor(stateset: stateset);
    list(packingListId?: string): Promise<PackingListLineItem[]>;
    get(lineItemId: string): Promise<PackingListLineItem>;
    create(lineItemData: Omit<PackingListLineItem, 'id'>): Promise<PackingListLineItem>;
    update(lineItemId: string, lineItemData: Partial<PackingListLineItem>): Promise<PackingListLineItem>;
    delete(lineItemId: string): Promise<void>;
    bulkCreate(packingListId: string, lineItems: Array<Omit<PackingListLineItem, 'id' | 'packing_list_id'>>): Promise<PackingListLineItem[]>;
    verifyItem(lineItemId: string, verificationData: {
        inspector: string;
        inspection_date: string;
        passed: boolean;
        notes?: string;
    }): Promise<PackingListLineItem>;
    updateLocation(lineItemId: string, locationData: PackingListLineItem['location']): Promise<PackingListLineItem>;
}
export default PackingListLines;
