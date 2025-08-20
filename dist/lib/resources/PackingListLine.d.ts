import type { ApiClientLike } from '../../types';
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
    constructor(stateset: ApiClientLike);
    /**
     * Get all packing list line items
     * @param packingListId - Optional packing list ID
     * @returns Array of PackingListLineItem objects
     */
    list(packingListId?: string): Promise<PackingListLineItem[]>;
    /**
     * Get a packing list line item by ID
     * @param lineItemId - Packing list line item ID
     * @returns PackingListLineItem object
     */
    get(lineItemId: string): Promise<PackingListLineItem>;
    /**
     * Create a new packing list line item
     * @param lineItemData - PackingListLineItem object
     * @returns PackingListLineItem object
     */
    create(lineItemData: Omit<PackingListLineItem, 'id'>): Promise<PackingListLineItem>;
    /**
     * Update a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param lineItemData - Partial<PackingListLineItem> object
     * @returns PackingListLineItem object
     */
    update(lineItemId: string, lineItemData: Partial<PackingListLineItem>): Promise<PackingListLineItem>;
    /**
     * Delete a packing list line item
     * @param lineItemId - Packing list line item ID
     */
    delete(lineItemId: string): Promise<void>;
    /**
     * Bulk create packing list line items
     * @param packingListId - Packing list ID
     * @param lineItems - Array of PackingListLineItem objects
     * @returns Array of PackingListLineItem objects
     */
    bulkCreate(packingListId: string, lineItems: Array<Omit<PackingListLineItem, 'id' | 'packing_list_id'>>): Promise<PackingListLineItem[]>;
    /**
     * Verify a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param verificationData - Verification data object
     * @returns PackingListLineItem object
     */
    verifyItem(lineItemId: string, verificationData: {
        inspector: string;
        inspection_date: string;
        passed: boolean;
        notes?: string;
    }): Promise<PackingListLineItem>;
    /**
     * Update the location of a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param locationData - Location data object
     * @returns PackingListLineItem object
     */
    updateLocation(lineItemId: string, locationData: PackingListLineItem['location']): Promise<PackingListLineItem>;
}
export default PackingListLines;
//# sourceMappingURL=PackingListLine.d.ts.map