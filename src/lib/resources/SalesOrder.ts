import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

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

class SalesOrders extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'salesorders', 'salesorders');
    this.singleKey = 'update_salesorders_by_pk';
  }

  protected override mapSingle(data: any): any {
    return this.handleCommandResponse({ update_salesorders_by_pk: data });
  }

  protected override mapListItem(item: any): any {
    return this.mapSingle(item);
  }

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

  override async list(): Promise<SalesOrderResponse[]> {
    return super.list();
  }

  override async get(id: string): Promise<SalesOrderResponse> {
    return super.get(id);
  }

  override async create(data: SalesOrderData): Promise<SalesOrderResponse> {
    return super.create(data);
  }

  override async update(id: string, data: Partial<SalesOrderData>): Promise<SalesOrderResponse> {
    return super.update(id, data);
  }

  override async delete(id: string): Promise<void> {
    await super.delete(id);
  }

  async submit(id: string): Promise<SubmittedSalesOrderResponse> {
    const response = await this.client.request('POST', `salesorders/${id}/submit`);
    return this.handleCommandResponse(response) as SubmittedSalesOrderResponse;
  }

  async fulfill(id: string): Promise<FulfilledSalesOrderResponse> {
    const response = await this.client.request('POST', `salesorders/${id}/fulfill`);
    return this.handleCommandResponse(response) as FulfilledSalesOrderResponse;
  }

  async invoice(id: string): Promise<InvoicedSalesOrderResponse> {
    const response = await this.client.request('POST', `salesorders/${id}/invoice`);
    return this.handleCommandResponse(response) as InvoicedSalesOrderResponse;
  }

  async pay(id: string): Promise<PaidSalesOrderResponse> {
    const response = await this.client.request('POST', `salesorders/${id}/pay`);
    return this.handleCommandResponse(response) as PaidSalesOrderResponse;
  }

  async cancel(id: string): Promise<CancelledSalesOrderResponse> {
    const response = await this.client.request('POST', `salesorders/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledSalesOrderResponse;
  }
}

export default SalesOrders;
