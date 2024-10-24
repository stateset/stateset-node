type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
interface BaseInvoiceResponse {
    id: string;
    object: 'invoice';
    status: InvoiceStatus;
}
interface DraftInvoiceResponse extends BaseInvoiceResponse {
    status: 'DRAFT';
    draft: true;
}
interface SentInvoiceResponse extends BaseInvoiceResponse {
    status: 'SENT';
    sent: true;
}
interface PaidInvoiceResponse extends BaseInvoiceResponse {
    status: 'PAID';
    paid: true;
}
interface OverdueInvoiceResponse extends BaseInvoiceResponse {
    status: 'OVERDUE';
    overdue: true;
}
interface CancelledInvoiceResponse extends BaseInvoiceResponse {
    status: 'CANCELLED';
    cancelled: true;
}
type InvoiceResponse = DraftInvoiceResponse | SentInvoiceResponse | PaidInvoiceResponse | OverdueInvoiceResponse | CancelledInvoiceResponse;
interface InvoiceData {
    customer_id: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    [key: string]: any;
}
interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    [key: string]: any;
}
export default class Invoices {
    private client;
    constructor(client: any);
    private handleCommandResponse;
    create(data: InvoiceData): Promise<InvoiceResponse>;
    get(id: string): Promise<InvoiceResponse>;
    update(id: string, data: Partial<InvoiceData>): Promise<InvoiceResponse>;
    list(params?: any): Promise<InvoiceResponse[]>;
    delete(id: string): Promise<void>;
    getLines(id: string): Promise<InvoiceLineItem[]>;
    updateLines(id: string, data: InvoiceLineItem[]): Promise<InvoiceResponse>;
    send(id: string): Promise<SentInvoiceResponse>;
    markAsPaid(id: string): Promise<PaidInvoiceResponse>;
    cancel(id: string): Promise<CancelledInvoiceResponse>;
    reminder(id: string): Promise<InvoiceResponse>;
}
export {};
