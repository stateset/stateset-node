// lib/resources/InvoiceLine.ts

export default class InvoiceLines {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  /**
   * Create a new invoice line
   * @param data - InvoiceLineItem object
   * @returns InvoiceLineItem object
   */
  async create(data: any) {
    return this.client.request('POST', 'invoice-lines', data);
  }

  /**
   * Get an invoice line by ID
   * @param id - Invoice line ID
   * @returns InvoiceLineItem object
   */
  async get(id: string) {
    return this.client.request('GET', `invoice-lines/${id}`);
  }

  /**
   * Update an invoice line
   * @param id - Invoice line ID
   * @param data - Partial<InvoiceLineItem> object
   * @returns InvoiceLineItem object
   */
  async update(id: string, data: any) {
    return this.client.request('PUT', `invoice-lines/${id}`, data);
  }

  /**
   * List invoice lines
   * @param params - Optional filtering parameters
   * @returns Array of InvoiceLineItem objects
   */
  async list(params?: any) {
    return this.client.request('GET', 'invoice-lines', params);
  }

  /**
   * Delete an invoice line
   * @param id - Invoice line ID
   */
  async delete(id: string) {
    return this.client.request('DELETE', `invoice-lines/${id}`);
  }

  /**
   * Get payouts for an invoice line
   * @param id - Invoice line ID
   * @returns Array of Payout objects
   */
  async getPayouts(id: string) {
    return this.client.request('GET', `invoice-lines/${id}/payouts`);
  }

  /**
   * Update payouts for an invoice line
   * @param id - Invoice line ID
   * @param data - Array of Payout objects
   * @returns Array of Payout objects
   */
  async updatePayouts(id: string, data: any) {
    return this.client.request('PUT', `invoice-lines/${id}/payouts`, data);
  }
}
