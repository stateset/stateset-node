import type { ApiClientLike } from '../../types';

export type SalesOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'FULFILLED'
  | 'INVOICED'
  | 'PAID'
  | 'CANCELLED';

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

export type SalesOrderResponse =
  | DraftSalesOrderResponse
  | SubmittedSalesOrderResponse
  | FulfilledSalesOrderResponse
  | InvoicedSalesOrderResponse
  | PaidSalesOrderResponse
  | CancelledSalesOrderResponse;



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

class SalesOrders {
  constructor(private stateset: ApiClientLike) {}

  private handleCommandResponse(response: any): SalesOrderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_salesorders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const salesOrder = response.update_salesorders_by_pk;

    const base: BaseSalesOrderResponse = {
      id: salesOrder.id,
      object: 'salesorder',
      status: salesOrder.status,
    };

    switch (salesOrder.status) {
      case 'DRAFT':
        return { ...base, status: 'DRAFT', draft: true };
      case 'SUBMITTED':
        return { ...base, status: 'SUBMITTED', submitted: true };
      case 'FULFILLED':
        return { ...base, status: 'FULFILLED', fulfilled: true };
      case 'INVOICED':
        return { ...base, status: 'INVOICED', invoiced: true };
      case 'PAID':
        return { ...base, status: 'PAID', paid: true };
      case 'CANCELLED':
        return { ...base, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected sales order status: ${salesOrder.status}`);
    }
  }

  async list(): Promise<SalesOrderResponse[]> {
    const response = await this.stateset.request('GET', 'salesorders');
    return response.map((so: any) =>
      this.handleCommandResponse({ update_salesorders_by_pk: so })
    );
  }

  async get(id: string): Promise<SalesOrderResponse> {
    const response = await this.stateset.request('GET', `salesorders/${id}`);
    return this.handleCommandResponse({ update_salesorders_by_pk: response });
  }

  async create(data: SalesOrderData): Promise<SalesOrderResponse> {
    const response = await this.stateset.request('POST', 'salesorders', data);
    return this.handleCommandResponse(response);
  }

  async update(id: string, data: Partial<SalesOrderData>): Promise<SalesOrderResponse> {
    const response = await this.stateset.request('PUT', `salesorders/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async delete(id: string): Promise<void> {
    await this.stateset.request('DELETE', `salesorders/${id}`);
  }

  async submit(id: string): Promise<SubmittedSalesOrderResponse> {
    const response = await this.stateset.request('POST', `salesorders/${id}/submit`);
    return this.handleCommandResponse(response) as SubmittedSalesOrderResponse;
  }

  async fulfill(id: string): Promise<FulfilledSalesOrderResponse> {
    const response = await this.stateset.request('POST', `salesorders/${id}/fulfill`);
    return this.handleCommandResponse(response) as FulfilledSalesOrderResponse;
  }

  async invoice(id: string): Promise<InvoicedSalesOrderResponse> {
    const response = await this.stateset.request('POST', `salesorders/${id}/invoice`);
    return this.handleCommandResponse(response) as InvoicedSalesOrderResponse;
  }

  async pay(id: string): Promise<PaidSalesOrderResponse> {
    const response = await this.stateset.request('POST', `salesorders/${id}/pay`);
    return this.handleCommandResponse(response) as PaidSalesOrderResponse;
  }

  async cancel(id: string): Promise<CancelledSalesOrderResponse> {
    const response = await this.stateset.request('POST', `salesorders/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledSalesOrderResponse;
  }
}

export default SalesOrders;
