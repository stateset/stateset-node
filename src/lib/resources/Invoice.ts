// lib/resources/Invoice.ts

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

interface ApiResponse {
  update_invoices_by_pk: {
    id: string;
    status: InvoiceStatus;
    [key: string]: any;
  };
}

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
  constructor(private client: any) {}

  private handleCommandResponse(response: any): InvoiceResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_invoices_by_pk) {
      throw new Error('Unexpected response format');
    }

    const invoiceData = response.update_invoices_by_pk;

    const baseResponse: BaseInvoiceResponse = {
      id: invoiceData.id,
      object: 'invoice',
      status: invoiceData.status,
    };

    switch (invoiceData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'SENT':
        return { ...baseResponse, status: 'SENT', sent: true };
      case 'PAID':
        return { ...baseResponse, status: 'PAID', paid: true };
      case 'OVERDUE':
        return { ...baseResponse, status: 'OVERDUE', overdue: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected invoice status: ${invoiceData.status}`);
    }
  }

  async create(data: InvoiceData): Promise<InvoiceResponse> {
    const response = await this.client.request('POST', 'invoices', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<InvoiceResponse> {
    const response = await this.client.request('GET', `invoices/${id}`);
    return this.handleCommandResponse({ update_invoices_by_pk: response });
  }

  async update(id: string, data: Partial<InvoiceData>): Promise<InvoiceResponse> {
    const response = await this.client.request('PUT', `invoices/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<InvoiceResponse[]> {
    const response = await this.client.request('GET', 'invoices', params);
    return response.map((invoice: any) => this.handleCommandResponse({ update_invoices_by_pk: invoice }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `invoices/${id}`);
  }

  async getLines(id: string): Promise<InvoiceLineItem[]> {
    return this.client.request('GET', `invoices/${id}/lines`);
  }

  async updateLines(id: string, data: InvoiceLineItem[]): Promise<InvoiceResponse> {
    const response = await this.client.request('PUT', `invoices/${id}/lines`, data);
    return this.handleCommandResponse(response);
  }

  async send(id: string): Promise<SentInvoiceResponse> {
    const response = await this.client.request('POST', `invoices/${id}/send`);
    return this.handleCommandResponse(response) as SentInvoiceResponse;
  }

  async markAsPaid(id: string): Promise<PaidInvoiceResponse> {
    const response = await this.client.request('POST', `invoices/${id}/mark-paid`);
    return this.handleCommandResponse(response) as PaidInvoiceResponse;
  }

  async cancel(id: string): Promise<CancelledInvoiceResponse> {
    const response = await this.client.request('POST', `invoices/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledInvoiceResponse;
  }

  async reminder(id: string): Promise<InvoiceResponse> {
    const response = await this.client.request('POST', `invoices/${id}/reminder`);
    return this.handleCommandResponse(response);
  }
}