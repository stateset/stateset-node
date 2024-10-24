import { stateset } from '../../stateset-client';
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
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<PurchaseOrderResponse[]>;
    get(purchaseOrderId: string): Promise<PurchaseOrderResponse>;
    create(purchaseOrderData: PurchaseOrderData): Promise<PurchaseOrderResponse>;
    update(purchaseOrderId: string, purchaseOrderData: Partial<PurchaseOrderData>): Promise<PurchaseOrderResponse>;
    delete(purchaseOrderId: string): Promise<void>;
    submit(purchaseOrderId: string): Promise<SubmittedPurchaseOrderResponse>;
    approve(purchaseOrderId: string): Promise<ApprovedPurchaseOrderResponse>;
    receive(purchaseOrderId: string, receivedItems: {
        item_id: string;
        quantity_received: number;
    }[]): Promise<ReceivedPurchaseOrderResponse>;
    cancel(purchaseOrderId: string): Promise<CancelledPurchaseOrderResponse>;
    addItem(purchaseOrderId: string, item: PurchaseOrderData['items'][0]): Promise<PurchaseOrderResponse>;
    removeItem(purchaseOrderId: string, itemId: string): Promise<PurchaseOrderResponse>;
}
export default PurchaseOrders;
