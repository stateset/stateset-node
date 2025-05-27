import { stateset } from '../../stateset-client';
export type ItemReceiptStatus = 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
interface BaseItemReceiptResponse {
    id: string;
    object: 'itemreceipt';
    status: ItemReceiptStatus;
}
interface PendingItemReceiptResponse extends BaseItemReceiptResponse {
    status: 'PENDING';
    pending: true;
}
interface ReceivedItemReceiptResponse extends BaseItemReceiptResponse {
    status: 'RECEIVED';
    received: true;
}
interface PartialItemReceiptResponse extends BaseItemReceiptResponse {
    status: 'PARTIAL';
    partial: true;
}
interface CancelledItemReceiptResponse extends BaseItemReceiptResponse {
    status: 'CANCELLED';
    cancelled: true;
}
export type ItemReceiptResponse = PendingItemReceiptResponse | ReceivedItemReceiptResponse | PartialItemReceiptResponse | CancelledItemReceiptResponse;
export interface ItemReceiptLine {
    item_id: string;
    quantity_received: number;
    [key: string]: any;
}
export interface ItemReceiptData {
    purchase_order_id: string;
    lines: ItemReceiptLine[];
    receipt_date: string;
    [key: string]: any;
}
declare class ItemReceipts {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<ItemReceiptResponse[]>;
    get(id: string): Promise<ItemReceiptResponse>;
    create(data: ItemReceiptData): Promise<ItemReceiptResponse>;
    update(id: string, data: Partial<ItemReceiptData>): Promise<ItemReceiptResponse>;
    delete(id: string): Promise<void>;
    receive(id: string): Promise<ReceivedItemReceiptResponse>;
    cancel(id: string): Promise<CancelledItemReceiptResponse>;
}
export default ItemReceipts;
