import type { ApiClientLike } from '../../types';
export type CashSaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
interface BaseCashSaleResponse {
    id: string;
    object: 'cashsale';
    status: CashSaleStatus;
}
interface PendingCashSaleResponse extends BaseCashSaleResponse {
    status: 'PENDING';
    pending: true;
}
interface CompletedCashSaleResponse extends BaseCashSaleResponse {
    status: 'COMPLETED';
    completed: true;
}
interface CancelledCashSaleResponse extends BaseCashSaleResponse {
    status: 'CANCELLED';
    cancelled: true;
}
interface RefundedCashSaleResponse extends BaseCashSaleResponse {
    status: 'REFUNDED';
    refunded: true;
}
export type CashSaleResponse = PendingCashSaleResponse | CompletedCashSaleResponse | CancelledCashSaleResponse | RefundedCashSaleResponse;
export interface CashSaleLine {
    item_id: string;
    quantity: number;
    unit_price: number;
    [key: string]: any;
}
export interface CashSaleData {
    customer_id: string;
    sale_date: string;
    lines: CashSaleLine[];
    [key: string]: any;
}
declare class CashSales {
    private stateset;
    constructor(stateset: ApiClientLike);
    private handleCommandResponse;
    list(): Promise<CashSaleResponse[]>;
    get(id: string): Promise<CashSaleResponse>;
    create(data: CashSaleData): Promise<CashSaleResponse>;
    update(id: string, data: Partial<CashSaleData>): Promise<CashSaleResponse>;
    delete(id: string): Promise<void>;
    complete(id: string): Promise<CompletedCashSaleResponse>;
    refund(id: string): Promise<RefundedCashSaleResponse>;
    cancel(id: string): Promise<CancelledCashSaleResponse>;
}
export default CashSales;
//# sourceMappingURL=CashSale.d.ts.map