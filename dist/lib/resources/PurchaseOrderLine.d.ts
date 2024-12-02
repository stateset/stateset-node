import { stateset } from '../../stateset-client';
interface PurchaseOrderLineItem {
    id: string;
    purchase_order_id: string;
    item_id: string;
    quantity: number;
    unit_price: number;
    currency?: string;
    tax_rate?: number;
    discount?: number;
    total_amount: number;
    description?: string;
    uom?: string;
    requested_delivery_date?: string;
    notes?: string;
    status?: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    metadata?: Record<string, any>;
}
declare class PurchaseOrderLines {
    private stateset;
    constructor(stateset: stateset);
    /**
     * List all purchase order lines
     * @param purchaseOrderId - Purchase order ID
     * @returns Array of PurchaseOrderLineItem objects
     */
    list(purchaseOrderId?: string): Promise<PurchaseOrderLineItem[]>;
    /**
     * Get a purchase order line by ID
     * @param lineItemId - Purchase order line ID
     * @returns PurchaseOrderLineItem object
     */
    get(lineItemId: string): Promise<PurchaseOrderLineItem>;
    /**
     * Create a new purchase order line
     * @param lineItemData - PurchaseOrderLineItem object
     * @returns PurchaseOrderLineItem object
     */
    create(lineItemData: Omit<PurchaseOrderLineItem, 'id'>): Promise<PurchaseOrderLineItem>;
    /**
     * Update a purchase order line
     * @param lineItemId - Purchase order line ID
     * @param lineItemData - Partial<PurchaseOrderLineItem> object
     * @returns PurchaseOrderLineItem object
     */
    update(lineItemId: string, lineItemData: Partial<PurchaseOrderLineItem>): Promise<PurchaseOrderLineItem>;
    /**
     * Delete a purchase order line
     * @param lineItemId - Purchase order line ID
     */
    delete(lineItemId: string): Promise<void>;
    /**
     * Bulk create purchase order lines
     * @param purchaseOrderId - Purchase order ID
     * @param lineItems - Array of PurchaseOrderLineItem objects
     * @returns Array of PurchaseOrderLineItem objects
     */
    bulkCreate(purchaseOrderId: string, lineItems: Array<Omit<PurchaseOrderLineItem, 'id' | 'purchase_order_id'>>): Promise<PurchaseOrderLineItem[]>;
    /**
     * Update the quantity received for a purchase order line
     * @param lineItemId - Purchase order line ID
     * @param quantityReceived - Quantity received
     * @returns PurchaseOrderLineItem object
     */
    updateQuantityReceived(lineItemId: string, quantityReceived: number): Promise<PurchaseOrderLineItem>;
}
export default PurchaseOrderLines;
