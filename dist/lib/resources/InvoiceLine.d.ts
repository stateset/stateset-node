export default class InvoiceLines {
    private client;
    constructor(client: any);
    /**
     * Create a new invoice line
     * @param data - InvoiceLineItem object
     * @returns InvoiceLineItem object
     */
    create(data: any): Promise<any>;
    /**
     * Get an invoice line by ID
     * @param id - Invoice line ID
     * @returns InvoiceLineItem object
     */
    get(id: string): Promise<any>;
    /**
     * Update an invoice line
     * @param id - Invoice line ID
     * @param data - Partial<InvoiceLineItem> object
     * @returns InvoiceLineItem object
     */
    update(id: string, data: any): Promise<any>;
    /**
     * List invoice lines
     * @param params - Optional filtering parameters
     * @returns Array of InvoiceLineItem objects
     */
    list(params?: any): Promise<any>;
    /**
     * Delete an invoice line
     * @param id - Invoice line ID
     */
    delete(id: string): Promise<any>;
    /**
     * Get payouts for an invoice line
     * @param id - Invoice line ID
     * @returns Array of Payout objects
     */
    getPayouts(id: string): Promise<any>;
    /**
     * Update payouts for an invoice line
     * @param id - Invoice line ID
     * @param data - Array of Payout objects
     * @returns Array of Payout objects
     */
    updatePayouts(id: string, data: any): Promise<any>;
}
