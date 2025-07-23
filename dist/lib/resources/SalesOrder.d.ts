import { stateset } from '../../stateset-client';
export type SalesOrderStatus = 'DRAFT' | 'SUBMITTED' | 'FULFILLED' | 'INVOICED' | 'PAID' | 'CANCELLED';
interface BaseSalesOrderResponse {
    id: string;
    object: 'salesorder';
    status: SalesOrderStatus;
}
interface DraftSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'DRAFT';
    draft: true;
}
interface SubmittedSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'SUBMITTED';
    submitted: true;
}
interface FulfilledSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'FULFILLED';
    fulfilled: true;
}
interface InvoicedSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'INVOICED';
    invoiced: true;
}
interface PaidSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'PAID';
    paid: true;
}
interface CancelledSalesOrderResponse extends BaseSalesOrderResponse {
    status: 'CANCELLED';
    cancelled: true;
}
export type SalesOrderResponse = DraftSalesOrderResponse | SubmittedSalesOrderResponse | FulfilledSalesOrderResponse | InvoicedSalesOrderResponse | PaidSalesOrderResponse | CancelledSalesOrderResponse;
export interface SalesOrderItem {
    item_id: string;
    quantity: number;
    unit_price: number;
    [key: string]: any;
}
export interface SalesOrderData {
    customer_id: string;
    order_date: string;
    items: SalesOrderItem[];
    [key: string]: any;
}
declare class SalesOrders {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<SalesOrderResponse[]>;
    get(id: string): Promise<SalesOrderResponse>;
    create(data: SalesOrderData): Promise<SalesOrderResponse>;
    update(id: string, data: Partial<SalesOrderData>): Promise<SalesOrderResponse>;
    delete(id: string): Promise<void>;
    submit(id: string): Promise<SubmittedSalesOrderResponse>;
    fulfill(id: string): Promise<FulfilledSalesOrderResponse>;
    invoice(id: string): Promise<InvoicedSalesOrderResponse>;
    pay(id: string): Promise<PaidSalesOrderResponse>;
    cancel(id: string): Promise<CancelledSalesOrderResponse>;
}
export default SalesOrders;
//# sourceMappingURL=SalesOrder.d.ts.map