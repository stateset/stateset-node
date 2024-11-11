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
    list(purchaseOrderId?: string): Promise<PurchaseOrderLineItem[]>;
    get(lineItemId: string): Promise<PurchaseOrderLineItem>;
    create(lineItemData: Omit<PurchaseOrderLineItem, 'id'>): Promise<PurchaseOrderLineItem>;
    update(lineItemId: string, lineItemData: Partial<PurchaseOrderLineItem>): Promise<PurchaseOrderLineItem>;
    delete(lineItemId: string): Promise<void>;
    bulkCreate(purchaseOrderId: string, lineItems: Array<Omit<PurchaseOrderLineItem, 'id' | 'purchase_order_id'>>): Promise<PurchaseOrderLineItem[]>;
    updateQuantityReceived(lineItemId: string, quantityReceived: number): Promise<PurchaseOrderLineItem>;
}
export default PurchaseOrderLines;
