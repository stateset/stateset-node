import type { ApiClientLike } from '../../types';
type PurchaseOrderStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
interface BasePurchaseOrderResponse {
    id: string;
    object: 'purchaseorder';
    status: PurchaseOrderStatus;
}
interface DraftPurchaseOrderResponse extends BasePurchaseOrderResponse {
    status: 'DRAFT';
    draft: true;
}
interface SubmittedPurchaseOrderResponse extends BasePurchaseOrderResponse {
    status: 'SUBMITTED';
    submitted: true;
}
interface ApprovedPurchaseOrderResponse extends BasePurchaseOrderResponse {
    status: 'APPROVED';
    approved: true;
}
interface ReceivedPurchaseOrderResponse extends BasePurchaseOrderResponse {
    status: 'RECEIVED';
    received: true;
}
interface CancelledPurchaseOrderResponse extends BasePurchaseOrderResponse {
    status: 'CANCELLED';
    cancelled: true;
}
type PurchaseOrderResponse = DraftPurchaseOrderResponse | SubmittedPurchaseOrderResponse | ApprovedPurchaseOrderResponse | ReceivedPurchaseOrderResponse | CancelledPurchaseOrderResponse;
interface PurchaseOrderData {
    supplier_id: string;
    expected_delivery_date: string;
    items: {
        item_id: string;
        quantity: number;
        unit_price: number;
    }[];
    [key: string]: any;
}
declare class PurchaseOrders {
    private stateset;
    constructor(stateset: ApiClientLike);
    private handleCommandResponse;
    /**
     * List all purchase orders
     * @returns Array of PurchaseOrderResponse objects
     */
    list(): Promise<PurchaseOrderResponse[]>;
    /**
     * Get a purchase order by ID
     * @param purchaseOrderId - Purchase order ID
     * @returns PurchaseOrderResponse object
     */
    get(purchaseOrderId: string): Promise<PurchaseOrderResponse>;
    /**
     * Create a new purchase order
     * @param purchaseOrderData - PurchaseOrderData object
     * @returns PurchaseOrderResponse object
     */
    create(purchaseOrderData: PurchaseOrderData): Promise<PurchaseOrderResponse>;
    /**
     * Update a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param purchaseOrderData - Partial<PurchaseOrderData> object
     * @returns PurchaseOrderResponse object
     */
    update(purchaseOrderId: string, purchaseOrderData: Partial<PurchaseOrderData>): Promise<PurchaseOrderResponse>;
    /**
     * Delete a purchase order
     * @param purchaseOrderId - Purchase order ID
     */
    delete(purchaseOrderId: string): Promise<void>;
    /**
     * Submit a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns SubmittedPurchaseOrderResponse object
     */
    submit(purchaseOrderId: string): Promise<SubmittedPurchaseOrderResponse>;
    /**
     * Approve a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns ApprovedPurchaseOrderResponse object
     */
    approve(purchaseOrderId: string): Promise<ApprovedPurchaseOrderResponse>;
    /**
     * Receive a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param receivedItems - Array of received items
     * @returns ReceivedPurchaseOrderResponse object
     */
    receive(purchaseOrderId: string, receivedItems: {
        item_id: string;
        quantity_received: number;
    }[]): Promise<ReceivedPurchaseOrderResponse>;
    /**
     * Cancel a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns CancelledPurchaseOrderResponse object
     */
    cancel(purchaseOrderId: string): Promise<CancelledPurchaseOrderResponse>;
    /**
     * Add an item to a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param item - Item object
     * @returns PurchaseOrderResponse object
     */
    addItem(purchaseOrderId: string, item: PurchaseOrderData['items'][0]): Promise<PurchaseOrderResponse>;
    /**
     * Remove an item from a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param itemId - Item ID
     * @returns PurchaseOrderResponse object
     */
    removeItem(purchaseOrderId: string, itemId: string): Promise<PurchaseOrderResponse>;
}
export default PurchaseOrders;
//# sourceMappingURL=PurchaseOrder.d.ts.map