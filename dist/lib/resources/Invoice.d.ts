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
    /**
     * Create a new invoice
     * @param data - InvoiceData object
     * @returns InvoiceResponse object
     */
    create(data: InvoiceData): Promise<InvoiceResponse>;
    /**
     * Get an invoice by ID
     * @param id - Invoice ID
     * @returns InvoiceResponse object
     */
    get(id: string): Promise<InvoiceResponse>;
    /**
     * Update an invoice
     * @param id - Invoice ID
     * @param data - Partial<InvoiceData> object
     * @returns InvoiceResponse object
     */
    update(id: string, data: Partial<InvoiceData>): Promise<InvoiceResponse>;
    /**
     * List invoices
     * @param params - Optional filtering parameters
     * @returns Array of InvoiceResponse objects
     */
    list(params?: any): Promise<InvoiceResponse[]>;
    /**
     * Delete an invoice
     * @param id - Invoice ID
     */
    delete(id: string): Promise<void>;
    /**
     * Get invoice lines
     * @param id - Invoice ID
     * @returns Array of InvoiceLineItem objects
     */
    getLines(id: string): Promise<InvoiceLineItem[]>;
    /**
     * Update invoice lines
     * @param id - Invoice ID
     * @param data - Array of InvoiceLineItem objects
     * @returns InvoiceResponse object
     */
    updateLines(id: string, data: InvoiceLineItem[]): Promise<InvoiceResponse>;
    /**
     * Send an invoice
     * @param id - Invoice ID
     * @returns SentInvoiceResponse object
     */
    send(id: string): Promise<SentInvoiceResponse>;
    /**
     * Mark an invoice as paid
     * @param id - Invoice ID
     * @returns PaidInvoiceResponse object
     */
    markAsPaid(id: string): Promise<PaidInvoiceResponse>;
    /**
     * Cancel an invoice
     * @param id - Invoice ID
     * @returns CancelledInvoiceResponse object
     */
    cancel(id: string): Promise<CancelledInvoiceResponse>;
    /**
     * Send a reminder for an invoice
     * @param id - Invoice ID
     * @returns InvoiceResponse object
     */
    reminder(id: string): Promise<InvoiceResponse>;
}
export {};
//# sourceMappingURL=Invoice.d.ts.map